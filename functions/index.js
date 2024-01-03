const {initializeApp} = require("firebase-admin/app");
initializeApp();
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated,onDocumentWritten, Change,FirestoreEvent} = require("firebase-functions/v2/firestore");
const {onCall} = require("firebase-functions/v2/https");
const {getFirestore,FieldValue} = require("firebase-admin/firestore");
const firestore = getFirestore();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const fetch = require("node-fetch");

var transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: 'authentication@ball24.in',
    pass: 'w4AJapKeRD5p'
  }
});
var transporter2 = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: 'rewards@ball24.in',
    pass: 'XZXaYgUMPfTS'
  }
});

async function generateUniqueReferCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'H';
  for (let i = 0; i < 6; i++)
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  const referExists = await firestore.collection('users').where('ReferCode', '==', result.toUpperCase()).get();
  if (referExists.empty)
    return result.toUpperCase();
  else
    return generateUniqueReferCode();
}

exports.sendEmail = onCall({maxInstances:10},async (request)=>{
  try{
    const randomNumber = Math.floor(Math.random() * 900000) + 100000;
    const mailOptions = {
      from: 'authentication@ball24.in',
      to: `${request.data.email}`,
      subject: 'Ball24 - OTP for verifying Email',
      html: `<h1>OTP is : ${randomNumber}</h1>`
    }; 
    await transporter.sendMail(mailOptions);
    return randomNumber;
  }
  catch(e){return "Error"};
})

exports.AddEmail = onCall({maxInstances:10},async (request)=>{
  await firestore.collection('users').doc(request.data.uid).update({
    Email:request.data.email
  })
  return null;
})

exports.GenerateReferCode = onCall({maxInstances:10},async (request)=>{
  const existingReferCode = await generateUniqueReferCode();
  await firestore.collection('users').doc(request.data.uid).update({
    ReferCode: existingReferCode,
  });
  return { referCode: existingReferCode };
})

exports.RedeemFifty = onCall({ maxInstances: 10 }, async (request) => {
  try {
    const uid = request.data.uid;
    const dbref = firestore.collection('users').doc(uid);
    const documentSnapshot = await dbref.get();
    if (documentSnapshot.data().ReferPoints < 50) return "Funds";
    const time = new Date().getTime();
    await dbref.update({
      ReferPoints: FieldValue.increment(-10),
      AddedAmount: FieldValue.increment(50),
      Transactions: FieldValue.arrayUnion({
        Amount: '₹' + 50,
        Type: 'Credit',
        Context: 'Refer And Win',
        To: 'Added Amount Amount (Wallet)',
        Time: time,
      }),
    });
    await dbref.collection('ReferHistory').doc(time.toString()).set({
      Points:10,
      Prize:'Rs.50 Ball24 Cash',
      time:time
    })
    return null;
  } catch (e) {return 'Error';}
});

exports.RedeemPrize = onCall({maxInstances:10},async (request) => {
  try{
    const {uid,Point,Prize,Email,Mobile} = request.data;
    const dbref = firestore.collection('users').doc(uid);
    const documentSnapshot = await dbref.get();
    if (documentSnapshot.data().ReferPoints < 50) return "Funds";
    const time = new Date().getTime();
    await dbref.collection('ReferHistory').doc(time.toString()).set({
      Points:Point,
      Prize:Prize,
      time:time
    })
    await firestore.collection('DisperseReferPrize').doc(time.toString()+Prize).set({
      Point:Point,
      uid:uid,
      Email:Email,
      PhoneNumnber:Mobile,
      Prize:Prize,
      EmailSent:false,
      FormFilled:false,
      PrizeDispersed:false,
      PrizeRecieved:false
    });
    await dbref.update({
      ReferPoints:FieldValue.increment(-Point),
    })
    const mailOptions = {
      from: 'rewards@ball24.in',
      to: `${Email}`,
      subject: `Congratulations - ${Prize} Redeemed`,
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                position: relative;
              }
              h1 {
                color: #4caf50;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Congratulations!</h1>
              <p>You have successfully redeemed ${Prize}. An email with details will be sent to you, requesting your address and contact details within the next 24-48 hours.</p>
            </div>
          </body>
        </html>
      `,
    };
    await transporter2.sendMail(mailOptions);
    return null;
  }
  catch(e){return "Error";}
})




exports.EditSet = onCall({maxInstances:10},async (request)=>{
  await firestore.collection('AllMatches').doc(request.data.MatchId).collection('ParticipantsWithTheirSets').doc(request.data.uid).update({
    [request.data.SetName]:request.data.Set
  }).then(()=>{
    return null;
  })
})

exports.EditSetMain = onCall({maxInstances:10},async(request)=>{
  return firestore.collection('AllMatches').doc(request.data.MatchId).collection('ParticipantsWithTheirSets').doc(request.data.uid).update({
    [request.data.SetName]:request.data.Set
  })
})

exports.SetCreator = onCall({maxInstances:10},async(request)=>{
  const def = firestore.collection('AllMatches').doc(request.data.MatchId).collection('ParticipantsWithTheirSets');
  def.doc(request.data.uid).set({
    Count:request.data.UniqueSetNumber,
    ['S'+request.data.UniqueSetNumber]:request.data.selectedScores,
  },{merge:true})
})

exports.SwapSets = onCall({maxInstances:10},async(request)=>{
  const dbref = firestore.collection('AllMatches').doc(request.data.MatchId).collection('4oversContests').doc(request.data.MatchKey).collection('Participants').doc(request.data.Id);
  const dref = firestore.collection('AllMatches').doc(request.data.MatchId).collection('ParticipantsWithTheirSets').doc(request.data.uid);
  dbref.update({
    SetNumber:request.data.SetNumber
  })
  dref.get().then(documentSnapshot=>{
    const Locked = documentSnapshot.data().LockedStatus;
    for(let i=0 ; i<Locked.length ; i++){
      const item = Locked[i];
      if(item.LockedFor==request.data.MatchKey && item.Name==request.data.Name){
        Locked[i] = {LockedFor:request.data.MatchKey,Name:request.data.SetNumber}
        dref.update({LockedStatus:Locked})
        break;
      }
    }
  })
})

exports.Withdraw = onCall({maxInstances:10},async(request)=>{
  let time = new Date().getTime();
  await firestore.collection('users').doc(request.data.uid).update({
    WinningAmount:FieldValue.increment(-request.data.Amount),
    Transactions: FieldValue.arrayUnion({
      Amount:'₹'+request.data.Amount,
      Type:'Withdrawn',
      Context:'Withdraw',
      To:'Bank Account - '+request.data.AccountNumber,
      Status:'Pending',
      Time:time,
    }),
    BankAccount:{
      AccountNumber:request.data.AccountNumber,
      IFSC:request.data.IFSC,
      Name:request.data.Name
    }
  })
  await firestore.collection('Withdrawl Requests').add({
    uid:request.data.uid,
    Amount:request.data.Amount,
    Name:request.data.Name,
    AccountNumber:request.data.AccountNumber,
    IFSCCode:request.data.IFSC,
    Index:request.data.index,
    time:time
  }).then(()=>{
    return null;
  })
})

// redirectUrl: "https://ball24.in",
// redirectMode: "POST",
exports.Transaction = onCall({maxInstances:10},async(request)=>{
  const amount = parseFloat(request.data.amount) * 100;
  const eventPayload = {
      merchantId: "BALL24ONLINE",
      merchantTransactionId: "B24"+Date.now(),
      merchantUserId: request.data.uid,
      amount: amount,
      callbackUrl: `https://us-central1-ball-24.cloudfunctions.net/callbackResponse?uid=${request.data.uid}&amount=${request.data.amount}`,
      mobileNumber: request.data.phone,
      paymentInstrument: {
          type: "PAY_PAGE",
      },
  };
  const encodedPayload = Buffer.from(JSON.stringify(eventPayload)).toString("base64");
  const finalXHeader = crypto.createHash("sha256").update(encodedPayload + "/pg/v1/pay7ec7141f-5344-4d33-aa84-a536da2cb075").digest("hex") + "###" + 1;
  const response = await fetch("https://api.phonepe.com/apis/hermes/pg/v1/pay", {
    method: "POST",
    body: JSON.stringify({ request: encodedPayload }),
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": finalXHeader,
    },
  });
  const data = await response.json();
  return data;
})

exports.callbackResponse = onRequest(async (req, res) => {
  const amount = req.query.amount;
  if (req.method === 'POST') {
    const jsonResponse = JSON.parse(Buffer.from(req.body.response, 'base64').toString('utf-8'));
    if (jsonResponse.code === 'PAYMENT_SUCCESS') {
      await firestore.collection('users').doc(req.query.uid).update({
        AddedAmount:FieldValue.increment(jsonResponse.data.amount/100),
        Transactions:FieldValue.arrayUnion({
          Amount:amount,
          Context:'Deposit',
          Time:new Date().getTime(),
          To:'Added Amount',
          Type:'Credit'
        })
      })
      res.status(200).send('Payment success');
    } 
    else if (jsonResponse.code === 'PAYMENT_ERROR') res.status(200).send('Payment error');
    else res.status(400).send('Bad Request');
  } 
  else res.status(405).send('Method Not Allowed');
});

exports.ProfileImage = onCall({maxInstances:10},async (request)=>{
  await firestore.collection('users').doc(request.data.uid).update({
    ProfileImage:request.data.url
  }).then(()=>{
    return null;
  })
})





// exports.ReferAndWinFifty = onCall({maxInstances:10},async (request)=>{
//   let time = new Date().getTime();
//   await firestore.collection('users').doc(request.data.uid).update({
//     WinningAmount:FieldValue.increment(50),
//     Transactions: FieldValue.arrayUnion({
//       Amount:'₹'+(50),
//       Type:'Credit',
//       Context:'Refer And Win ',
//       To:'Winning Amount (Wallet)',
//       Time:time
//     }),
//     ReferClaims:request.data.replace
//   }).then(()=>{
//     return null;
//   })
// })

// exports.ReferAndWinOthers = onCall({maxInstances:10},async (request)=>{
//   await firestore.collection(request.data.collection).doc(request.data.document).set({
//     UsersData:FieldValue.arrayUnion({
//       uid:request.data.uid,
//       email:request.data.email
//     })
//   },{merge:true})
//   await firestore.collection('users').doc(request.data.uid).update({
//     Email:request.data.email,
//     ReferClaims:request.data.replace
//   }).then(()=>{
//     return null;
//   })
// })

exports.Feedback = onCall({maxInstances:10},async (request)=>{
  await firestore.collection('Feedback').doc(request.data.uid).set({
    uid:request.data.uid,
    Feedback:request.data.Feedback
  }).then(()=>{
    return null;
  })
})

exports.NameEnteredCreateDoc = onCall({maxInstances:10},async (request)=>{
  const dbref = firestore.collection('users').doc(request.data.uid)
  await dbref.set({
    Name: request.data.name,
    PhoneNumber: request.data.phoneNumber,
    AddedAmount: 0,
    WinningAmount: 0,
    Contest:false,
    // ReferClaims: Array(8).fill('NotClaimed'),
    DBCashBonus: 50,
    ProfileImage: request.data.photo,
    ReferredBy: request.data.refferedBy,
    RefferalsOnThisName: 0,
    ReferPoints:0,
    DateOfBirth: "",
    Email: "",
    Gender: "",
    OriginalName: "",
    Transactions: [],
    BankAccount: {
      AccountNumber: '',
      Name: '',
      IFSC: ''
    }
  })
  if(request.data.Id)
    await firestore.collection('users').doc(request.data.Id).update({
      RefferalsOnThisName:FieldValue.increment(1),
      ReferPoints:FieldValue.increment(1)
    })
  return null;
})


exports.ContestEliminatorViaDeadline = onDocumentWritten({maxInstances:10 ,document:"AllMatches/Match1/LiveScores/LiveScores"},async (event)=>{
  const LiveScores = event.data.after.data().LiveScores;
  const length = LiveScores.length;
  if(((length-1)%6)==0){
    const dbref = firestore.collection('AllMatches').doc('Match1').collection('4oversContests');//
    const checkOver = ((length-1)/6)+3;
    await dbref.where('Overs','==',[checkOver,checkOver+3]).get().then(QuerySnapshot=>{
      QuerySnapshot.forEach(async documentShot=>{
        const Type = documentShot.data().Type;
        const FilledSpots = documentShot.data().FilledSpots;
        const MaximumSpots = documentShot.data().MaximumSpots;
        if((Type=="Head To Head" && FilledSpots==1) || ((Type=="High Entry=High Rewards"||Type=="Winner Takes All") && FilledSpots<MaximumSpots)){
          const Entry = parseInt((documentShot.data().Entry).match(/\d+/)[0]);
          await dbref.doc(documentShot.id).collection('Participants').get().then((QuerySnapshot)=>{
            QuerySnapshot.forEach(async documentSnapshot=>{
              await dbref.doc(documentShot.id).update({ Refunded:true })
              let time = new Date().getTime();
              const uid = documentSnapshot.data().uid;
              await firestore.collection('users').doc(uid).update({
                AddedAmount:FieldValue.increment(Entry),
                Transactions:FieldValue.arrayUnion({
                  Amount:Entry,
                  Context:'Refund (Contest Not Filled)', //To be changed in every match
                  Time:time,
                  To:'Winnings Wallet',
                  Type:'Credit'
                })
              })
            })
          })
        }
        else if(FilledSpots<MaximumSpots){
          await firestore.collection('AllMatches').doc('Match1').collection('ToBeUpdated').doc('ToBeUpdated').set({//
            ToBeUpdated:FieldValue.arrayUnion(documentShot.id)
          },{merge:true})
        }
        await dbref.doc(documentShot.id).update({
          ContestStatus:'Live'
        })
      })
    })
  }
})

exports.OnMatchLiveElimination = onDocumentWritten({maxInstances:10 ,document:"AllMatches/Match1"},async (event)=>{//
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  if (beforeData.Status === 'Upcoming' && afterData.Status === 'Live') {
    const dbref = firestore.collection('AllMatches').doc('Match1').collection('4oversContests');//
    await dbref.where('Overs','array-contains-any', [1,2,3,4]).get().then(QuerySnapshot=>{
      QuerySnapshot.forEach(async documentShot=>{
        const Type = documentShot.data().Type;
        const FilledSpots = documentShot.data().FilledSpots;
        const MaximumSpots = documentShot.data().MaximumSpots;
        if((Type=="Head To Head" && FilledSpots==1) || ((Type=="High Entry=High Rewards"||Type=="Winner Takes All") && FilledSpots<MaximumSpots)){
          const Entry = parseInt((documentShot.data().Entry).match(/\d+/)[0]);
          await dbref.doc(documentShot.id).collection('Participants').get().then((QuerySnapshot)=>{
            QuerySnapshot.forEach(async documentSnapshot=>{
              await dbref.doc(documentShot.id).update({ Refunded:true })
              let time = new Date().getTime();
              const uid = documentSnapshot.data().uid;
              await firestore.collection('users').doc(uid).update({
                AddedAmount:FieldValue.increment(Entry),
                Transactions:FieldValue.arrayUnion({
                  Amount:Entry,
                  Context:'Refund (Contest Not Filled)',
                  Time:time,
                  To:'Winnings Wallet',
                  Type:'Credit'
                })
              })
            })
          })
        }
        else if(FilledSpots<MaximumSpots){
          await firestore.collection('AllMatches').doc('Match1').collection('ToBeUpdated').doc('ToBeUpdated').set({//
            ToBeUpdated:FieldValue.arrayUnion(documentShot.id)
          },{merge:true})
        }
        await dbref.doc(documentShot.id).update({
          ContestStatus:'Live'
        })
      })
    })
  }
})


exports.assignPoints = onDocumentWritten({ maxInstances: 10, document: "AllMatches/Match1/LiveScores/LiveScores" },async (event) => {
  const helper = {'00': 10,'11': 12,'22': 15,'33': 18,'44': 22,'55': 25,'66': 30,'WW': 35,'1WD1WD': 30,'1NB1NB': 35,};
  const LiveScores = event.data.after.data();
  const length = Object.keys(LiveScores).length;
  const QuerySnapshot = await firestore.collection('AllMatches').doc('Match1').collection('4oversContests').where('Refunded', '!=', true).where('ContestStatus', '==', 'Live').get();
  for (const documentSnapshot of QuerySnapshot.docs) {
    if (documentSnapshot.data().Overs <= length) {
      const LiveArray = LiveScores[documentSnapshot.data().Overs];
      const winnings = documentSnapshot.data().Winning;
      const lastWinningIndex = winnings[winnings.length - 1].End;
      const dbref = firestore.collection('AllMatches').doc('Match1').collection('4oversContests').doc(documentSnapshot.id.toString()).collection('Participants');
      const QuerySnapshot = await dbref.get();
      const batch = firestore.batch();
      for (const documentSnap of QuerySnapshot.docs) {
        const SetName = documentSnap.data().SetNumber;
        const uid = documentSnap.data().uid;
        const documentShot = await firestore.collection('AllMatches').doc('Match1').collection('ParticipantsWithTheirSets').doc(uid).get();
        const Set = documentShot.data()[SetName];
        const PointsArray = [];
        for (let i = 0; i < 6; i++) {
          const SetItem = Set[i];
          const LiveItem = LiveArray[i];
          for (let j = 0; j < Object.keys(LiveItem).length; j++) {
            if (SetItem[j] != LiveItem[j]) {
              PointsArray.push(j === 0 ? 0 : j === 1 ? 0 : 0);
              break;
            }
            PointsArray.push(helper[SetItem[j] + LiveItem[j]] || 0);
          }
        }
        batch.update(documentSnap.ref, { Points: PointsArray, PointsNumber: PointsArray.reduce((acc, current) => acc + current, 0),});
      }
      await batch.commit();
      let prevData,rank = 0,rankCounter = 1;
      const participantsSnapshot = await dbref.orderBy('PointsNumber', 'desc').get();
      const rankUpdateBatch = firestore.batch();
      for (const doc of participantsSnapshot.docs) {
        const data = doc.data();
        const winningMessage = rank <= lastWinningIndex ? 'In Winning Zone' : 'Not In Winning Zone';
        if (prevData && prevData[0] === data.PointsNumber) rankCounter++;
        else { rank += rankCounter; rankCounter = 1;}
        prevData = [data.PointsNumber, rank];
        rankUpdateBatch.update(doc.ref, { Rank: rank, WinningMessage: winningMessage });
      }
      await rankUpdateBatch.commit();
    }
  }
  return null;
});


exports.assignWonAmount = onDocumentWritten({maxInstances:10 ,document:"AllMatches/Match1"},async (event)=> {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  if (beforeData.Status === 'Live' && afterData.Status === 'Completed') {
    const querySnapshot = await firestore.collection('AllMatches').doc('Match1').collection('4oversContests').where('Refunded', '!=', true).get();
    querySnapshot.forEach(async (documentSnapshot) => {
      if (documentSnapshot.id === '4Contest1') {
      const winnings = documentSnapshot.data().Winning;
      const lastRank = winnings[winnings.length - 1].End;
      const participantSnapshot = await firestore.collection('AllMatches').doc('Match1').collection('4oversContests').doc(documentSnapshot.id.toString()).collection('Participants').orderBy('Rank', 'asc').where('Rank', '<=', lastRank).get();
      const ranks = [] , rankDistribution = {};        
      participantSnapshot.forEach((documentSnapshot) => {
        const rank = documentSnapshot.data().Rank;
        ranks.push(rank);
        if (!rankDistribution[rank]) rankDistribution[rank] = [];
        rankDistribution[rank].push(documentSnapshot.ref);
      });
      const uniqueRanks = Array.from(new Set(ranks));
      uniqueRanks.forEach((rank) => {
        const prizeMoney = winnings.find(item => item.Start < rank && item.End >= rank).PrizeMoney;
        const sameRankDocs = rankDistribution[rank];   
        const winningAmount = sameRankDocs.length > 1 ? prizeMoney / sameRankDocs.length : prizeMoney;
        sameRankDocs.forEach(async (docRef) => {
          await docRef.update({
            WinningAmount: winningAmount.toFixed(2)
          });
        });
      });
    }
    });
  }
});

// exports.distributeWonAmount = onDocumentWritten({maxInstances:10},"Distribution/{Match1}",async (event)=>{//
//   await firestore.collection('AllMatches').doc('Match1').collection('4oversContests').where('Refunded','!=',true).get().then(QuerySnapshot=>{//
//     QuerySnapshot.forEach(async documentSnapshot=>{
//       if(documentSnapshot.id == '4Contest1' || documentSnapshot.id == '4Contest2'){//
//         let time = new Date().getTime();
//         await firestore.collection('AllMatches').doc('Match1').collection('4oversContests').doc(documentSnapshot.id.toString()).collection('Participants').where('WinningAmount','!=',null).get().then(QuerySnapshot=>{//
//           QuerySnapshot.forEach(async documentSnapshot => {
//             const WinningAmount = documentSnapshot.request.data().WinningAmount;
//             await firestore.collection('users').doc(documentSnapshot.request.data().uid).update({
//               WinningAmount:FieldValue.increment(+WinningAmount),
//               Transactions:FieldValue.arrayUnion({
//                 Amount:WinningAmount,
//                 Context:'Won in MI vs RCB', //To be changed in every match
//                 Time:time,
//                 To:'Winnings Wallet',
//                 Type:'Credit'
//               })
//             })
//           })
//         })
//       }
//     })
//   })
// })


exports.ContestParticipationNewUserAskForSet = onCall({maxInstances:10},async (request)=>{
  try{
    const {uid, Name, ProfileImage, MatchId, MatchKey, SetName, TeamCode1, TeamCode2} = request.data;
    const dbref = firestore.collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey);
    const documentSnap = await dbref.get();
    if(documentSnap.data().ContestStatus!='Upcoming') return "Status";
    if (documentSnap.data().FilledSpots + SetName.length > documentSnap.data().MaximumSpots) return "Spots";
    const dref = firestore.collection('users').doc(uid).collection('MyContests').doc(MatchId);
    const def = firestore.collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets');
    const db = firestore.collection('users').doc(uid);
    const Transactions = [{
      Amount: 'Free 🎁',
      Type: 'Debit',
      Context: `Participated - ${TeamCode1} vs ${TeamCode2}`,
      To: 'Wallet',
      Time: new Date().getTime()
    }];
    const batch = firestore.batch();
    batch.update(dbref, { FilledSpots: FieldValue.increment(SetName.length) });
    batch.update(db, {
      Transactions: FieldValue.arrayUnion(...Transactions),
      Contest:true
    });
    batch.set(dref, { ContestCount: FieldValue.arrayUnion(MatchKey) }, { merge: true });
    batch.set(dref.collection('Contests').doc(MatchKey), {Count: FieldValue.increment(SetName.length)}, { merge: true });
    await batch.commit();
    const a = async () => {
      const setBatch = firestore.batch();
      for (let i = 0; i < SetName.length; i++) {
        setBatch.update(def.doc(uid), {
          LockedStatus: FieldValue.arrayUnion({
            Name: SetName[i],
            LockedFor: MatchKey
          })
        });
        const participantDocRef = dbref.collection('Participants').doc();
        setBatch.set(participantDocRef, {
          uid: uid,
          Name: Name,
          ProfileImage: ProfileImage,
          SetNumber: SetName[i],
          PointsNumber: 0,
          Points: [],
        }, { merge: true });
      }
      await setBatch.commit();
    };
    await a();
    return null;
  }
  catch(e){return 'Error';}
})

exports.ContestParticipationOldUserJZeroAskForSet = onCall({ maxInstances: 10 }, async (request) => {
  try{    
    const {uid, Name, ProfileImage, MatchId, MatchKey, MoneyToBeDeducted, DBCashBonusUsable, SetName, TeamCode1, TeamCode2} = request.data;
    const db = firestore.collection('users').doc(uid);
    const dbref = firestore.collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey);
    const documentSnap = await dbref.get();
    if(documentSnap.data().ContestStatus!='Upcoming') return "Status";
    if (documentSnap.data().FilledSpots + SetName.length > documentSnap.data().MaximumSpots) return "Spots";
    const dref = firestore.collection('users').doc(uid).collection('MyContests').doc(MatchId);
    const def = firestore.collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets');
    const document = await db.get();
    const {AddedAmount, WinningAmount, DBCashBonus} = document.data();
    let AddedAmountFinal = AddedAmount;
    let WinningAmountFinal = WinningAmount;
    const Transactions = [{
      Amount: `₹${MoneyToBeDeducted}${DBCashBonusUsable !== 0 ? ` + ${DBCashBonusUsable} cash bonus` : ''}`,
      Type: 'Debit',
      Context: `Participated - ${TeamCode1} vs ${TeamCode2}`,
      To: 'Wallet',
      Time: new Date().getTime()
    }];
    if (AddedAmount >= MoneyToBeDeducted) AddedAmountFinal -= MoneyToBeDeducted;
    else if (AddedAmount + WinningAmount >= MoneyToBeDeducted){
      WinningAmountFinal -= MoneyToBeDeducted - AddedAmount;
      AddedAmountFinal = 0;
    }
    else return "Funds";
    const batch = firestore.batch();
    batch.update(dbref, { FilledSpots: FieldValue.increment(SetName.length) });
    batch.update(db, {
      Transactions: FieldValue.arrayUnion(...Transactions),
      AddedAmount: parseFloat(AddedAmountFinal.toFixed(2)),
      WinningAmount: parseFloat(WinningAmountFinal.toFixed(2)),
      DBCashBonus: parseFloat((DBCashBonus - DBCashBonusUsable).toFixed(2))
    });
    batch.set(dref, { ContestCount: FieldValue.arrayUnion(MatchKey) }, { merge: true });
    batch.set(dref.collection('Contests').doc(MatchKey), {Count: FieldValue.increment(SetName.length)}, { merge: true });
    await batch.commit();
    const a = async () => {
      const setBatch = firestore.batch();
      for (let i = 0; i < SetName.length; i++) {
        setBatch.update(def.doc(uid), {
          LockedStatus: FieldValue.arrayUnion({
            Name: SetName[i],
            LockedFor: MatchKey
          })
        });
        const participantDocRef = dbref.collection('Participants').doc();
        setBatch.set(participantDocRef, {
          uid: uid,
          Name: Name,
          ProfileImage: ProfileImage,
          SetNumber: SetName[i],
          PointsNumber: 0,
          Points: [],
        }, { merge: true });
      }
      await setBatch.commit();
    };
    await a();
    return null;
  }
  catch(e){return 'Error';}
});

exports.ContestParticipationNewUser = onCall({maxInstances:10},async (request)=>{
  try{
    const {uid, Name, ProfileImage, MatchId, MatchKey, UniqueSetNumber, selectedScores, TeamCode1, TeamCode2} = request.data;
    const db = firestore.collection('users').doc(uid);
    const dbref = firestore.collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey);
    const documentSnap = await dbref.get();
    if(documentSnap.data().ContestStatus!='Upcoming') return "Status";
    if(documentSnap.data().FilledSpots+1 > documentSnap.data().MaximumSpots) return "Spots";
    const dref = firestore.collection('users').doc(uid).collection('MyContests').doc(MatchId);
    const def = firestore.collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets');
    const Transactions = [{
      Amount: 'Free 🎁',
      Type: 'Debit',
      Context: `Participated - ${TeamCode1} vs ${TeamCode2}`,
      To: 'Wallet',
      Time: new Date().getTime()
    }];
    const batch = firestore.batch();
    batch.update(dbref,{ FilledSpots:FieldValue.increment(1) });
    batch.update(db,{
      Transactions: FieldValue.arrayUnion(...Transactions),
      Contest:true
    });
    batch.set(dref,{ ContestCount: FieldValue.arrayUnion(MatchKey) },{merge:true});
    batch.set(dref.collection('Contests').doc(MatchKey),{Count: FieldValue.increment(1)}, { merge: true });
    batch.set(def.doc(uid),{
      Count:UniqueSetNumber,
      ['S'+UniqueSetNumber]:selectedScores,
      LockedStatus:FieldValue.arrayUnion({
        Name:'S'+UniqueSetNumber,
        LockedFor:MatchKey
      })
    },{merge:true});
    batch.set(dbref.collection('Participants').doc(),{
      uid: uid,
      Name: Name,
      ProfileImage: ProfileImage,
      SetNumber:('S'+UniqueSetNumber),
      PointsNumber: 0,
      Points: [],
    }, { merge: true });
    await batch.commit();
    return null;
  }
  catch(e){return 'Error';}
})

exports.ContestParticipationOldUserJZero = onCall({maxInstances:10},async (request) => {
  try{
    const {uid, Name, ProfileImage, MatchId, MatchKey, MoneyToBeDeducted, DBCashBonusUsable, UniqueSetNumber, selectedScores, TeamCode1, TeamCode2} = request.data;
    const db = firestore.collection('users').doc(uid);
    const dbref = firestore.collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey);
    const documentSnap = await dbref.get();
    if(documentSnap.data().ContestStatus!='Upcoming') return "Status";
    if(documentSnap.data().FilledSpots+1 > documentSnap.data().MaximumSpots) return "Spots";
    const dref = firestore.collection('users').doc(uid).collection('MyContests').doc(MatchId);
    const def = firestore.collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets');
    const document = await db.get();
    const {AddedAmount, WinningAmount, DBCashBonus} = document.data();
    let AddedAmountFinal = AddedAmount;
    let WinningAmountFinal = WinningAmount;
    const Transactions = [{
      Amount: `₹${MoneyToBeDeducted}${DBCashBonusUsable !== 0 ? ` + ${DBCashBonusUsable} cash bonus` : ''}`,
      Type: 'Debit',
      Context: `Participated - ${TeamCode1} vs ${TeamCode2}`,
      To: 'Wallet',
      Time: new Date().getTime()
    }];
    if (AddedAmount >= MoneyToBeDeducted) AddedAmountFinal -= MoneyToBeDeducted
    else if(AddedAmount+WinningAmount >= MoneyToBeDeducted){
      WinningAmountFinal -= MoneyToBeDeducted - AddedAmount;
      AddedAmountFinal = 0;
    }
    else return "Funds";
    const batch = firestore.batch();
    batch.update(dbref,{ FilledSpots:FieldValue.increment(1) });
    batch.update(db,{
      Transactions: FieldValue.arrayUnion(...Transactions),
      AddedAmount: parseFloat(AddedAmountFinal.toFixed(2)),
      WinningAmount: parseFloat(WinningAmountFinal.toFixed(2)),
      DBCashBonus: parseFloat((DBCashBonus - DBCashBonusUsable).toFixed(2))
    });
    batch.set(dref,{ ContestCount: FieldValue.arrayUnion(MatchKey) },{merge:true});
    batch.set(dref.collection('Contests').doc(MatchKey),{Count: FieldValue.increment(1)}, { merge: true });
    batch.set(def.doc(uid),{
      Count:UniqueSetNumber,
      ['S'+UniqueSetNumber]:selectedScores,
      LockedStatus:FieldValue.arrayUnion({
        Name:'S'+UniqueSetNumber,
        LockedFor:MatchKey
      })
    },{merge:true});
    batch.set(dbref.collection('Participants').doc(),{
      uid: uid,
      Name: Name,
      ProfileImage: ProfileImage,
      SetNumber:('S'+UniqueSetNumber),
      PointsNumber: 0,
      Points: [],
    }, { merge: true });
    await batch.commit();
    return null;
  }
  catch(e){return 'Error';}
});


// exports.DeployContests = onDocumentWritten({maxInstances:10,document:"DeployContests/{Deploy}"},async (event)=>{
//   firestore.collection('AllMatches').doc('Match10').set({
//     Image1:'https://i.postimg.cc/d1d38St9/Mumbai.png',
//     Image2:'https://i.postimg.cc/g223pdNL/Bangalore.png',
//     LeagueName:'Mumbai Indians vs Royal Challengers Banglore',
//     MatchId:'Match10',
//     MatchTime:'',
//     MegaPrize:'5 Lakhs',
//     Status:'Upcoming',
//     Team1:'Mumbai',
//     Team2:'Bangalore',
//     TeamCode1:'MI',
//     TeamCode2:'RCB',
//     OpenToParticipate:false
//   })
//   firestore.collection('AllMatches').doc('Match1').set({
//     Image1:'https://i.postimg.cc/d1d38St9/Mumbai.png',
//     Image2:'https://i.postimg.cc/g223pdNL/Bangalore.png',
//     LeagueName:'Mumbai Indians vs Royal Challengers Banglore',
//     MatchId:'Match1',
//     MatchTime:'',
//     MegaPrize:'5 Lakhs',
//     Status:'Upcoming',
//     Team1:'Mumbai',
//     Team2:'Bangalore',
//     TeamCode1:'MI',
//     TeamCode2:'RCB',
//     OpenToParticipate:false
//   })
//   firestore.collection('AllMatches').doc('Match2').set({
//     Image1:'https://i.postimg.cc/bwZdLvmg/Chennai.png',
//     Image2:'https://i.postimg.cc/d1d38St9/Mumbai.png',
//     LeagueName:'Chennai Super Kings vs Mumbai Indians',
//     MatchId:'Match2',
//     MatchTime:'',
//     MegaPrize:'5 Lakhs',
//     Status:'Upcoming',
//     Team1:'Chennai',
//     Team2:'Mumbai',
//     TeamCode1:'CSK',
//     TeamCode2:'MI',
//     OpenToParticipate:false

//   })
//   firestore.collection('AllMatches').doc('Match3').set({
//     Image1:'https://i.postimg.cc/8P9Tpmbd/kindpng-1929235-1.png',
//     Image2:'https://i.postimg.cc/hjPkbXrP/flag-3d-round-250-1.png',
//     LeagueName:'India vs Pakistan',
//     MatchId:'Match3',
//     MatchTime:'',
//     MegaPrize:'5 Lakhs',
//     Status:'Upcoming',
//     Team1:'Mumbai',
//     Team2:'Bangalore',
//     TeamCode1:'MI',
//     TeamCode2:'RCB',
//     OpenToParticipate:false

//   })
//   firestore.collection('AllMatches').doc('Match4').set({
//     Image1:'https://i.postimg.cc/d1d38St9/Mumbai.png',
//     Image2:'https://i.postimg.cc/g223pdNL/Bangalore.png',
//     LeagueName:'Mumbai Indians vs Royal Challengers Banglore',
//     MatchId:'Match4',
//     MatchTime:'',
//     MegaPrize:'5 Lakhs',
//     Status:'Upcoming',
//     Team1:'Mumbai',
//     Team2:'Bangalore',
//     TeamCode1:'MI',
//     TeamCode2:'RCB',
//     OpenToParticipate:false

//   })
//   firestore.collection('AllMatches').doc('Match5').set({
//     Image1:'https://i.postimg.cc/d1d38St9/Mumbai.png',
//     Image2:'https://i.postimg.cc/g223pdNL/Bangalore.png',
//     LeagueName:'Mumbai Indians vs Royal Challengers Banglore',
//     MatchId:'Match5',
//     MatchTime:'',
//     MegaPrize:'5 Lakhs',
//     Status:'Upcoming',
//     Team1:'Mumbai',
//     Team2:'Bangalore',
//     TeamCode1:'MI',
//     TeamCode2:'RCB',
//     OpenToParticipate:false

//   })
//   firestore.collection('AllMatches').doc('Match6').set({
//     Image1:'https://i.postimg.cc/d1d38St9/Mumbai.png',
//     Image2:'https://i.postimg.cc/g223pdNL/Bangalore.png',
//     LeagueName:'Mumbai Indians vs Royal Challengers Banglore',
//     MatchId:'Match6',
//     MatchTime:'',
//     MegaPrize:'5 Lakhs',
//     Status:'Upcoming',
//     Team1:'Mumbai',
//     Team2:'Bangalore',
//     TeamCode1:'MI',
//     TeamCode2:'RCB',
//     OpenToParticipate:false

//   })
//   firestore.collection('AllMatches').doc('Match7').set({
//     Image1:'https://i.postimg.cc/d1d38St9/Mumbai.png',
//     Image2:'https://i.postimg.cc/g223pdNL/Bangalore.png',
//     LeagueName:'Mumbai Indians vs Royal Challengers Banglore',
//     MatchId:'Match7',
//     MatchTime:'',
//     MegaPrize:'5 Lakhs',
//     Status:'Upcoming',
//     Team1:'Mumbai',
//     Team2:'Bangalore',
//     TeamCode1:'MI',
//     TeamCode2:'RCB',
//     OpenToParticipate:false

//   })
//   firestore.collection('AllMatches').doc('Match8').set({
//     Image1:'https://i.postimg.cc/d1d38St9/Mumbai.png',
//     Image2:'https://i.postimg.cc/g223pdNL/Bangalore.png',
//     LeagueName:'Mumbai Indians vs Royal Challengers Banglore',
//     MatchId:'Match8',
//     MatchTime:'',
//     MegaPrize:'5 Lakhs',
//     Status:'Upcoming',
//     Team1:'Mumbai',
//     Team2:'Bangalore',
//     TeamCode1:'MI',
//     TeamCode2:'RCB',
//     OpenToParticipate:false

//   })
//   firestore.collection('AllMatches').doc('Match9').set({
//     Image1:'https://i.postimg.cc/d1d38St9/Mumbai.png',
//     Image2:'https://i.postimg.cc/g223pdNL/Bangalore.png',
//     LeagueName:'Mumbai Indians vs Royal Challengers Banglore',
//     MatchId:'Match9',
//     MatchTime:'',
//     MegaPrize:'5 Lakhs',
//     Status:'Upcoming',
//     Team1:'Mumbai',
//     Team2:'Bangalore',
//     TeamCode1:'MI',
//     TeamCode2:'RCB',
//     OpenToParticipate:false

//   })

//   const documents = [
//     //##### MEGA CONTEST #######################################################################################################################
//     {
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest1",
//     Entry: "₹30",
//     FilledSpots: 0 ,
//     FirstPosition: "4000",
//     MaximumSpots: 2200 ,
//     PrizePool: "50000",
//     Type: "Mega Contest",
//     WinnersPercentage: "58%" ,
//     Overs:[16,19],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 4000,Spot: "1",Start: 1 },
//       {End: 2,PrizeMoney: 1000,Spot: "2",Start: 2 },
//       {End: 3,PrizeMoney: 600 ,Spot: "3",Start: 3 },
//       {End: 4,PrizeMoney: 400 ,Spot: "4",Start: 4 },
//       {End: 10,PrizeMoney: 200,Spot: "5-10",Start: 5 },
//       {End: 25,PrizeMoney: 100,Spot: "11-25",Start: 11 },
//       {End: 60,PrizeMoney: 70,Spot: "26-60",Start: 26 },
//       {End: 120,PrizeMoney: 60,Spot: "61-120",Start: 61 },
//       {End: 204,PrizeMoney: 40,Spot: "121-204",Start: 121 },
//       {End: 1267,PrizeMoney: 30,Spot: "204-1267",Start: 204 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest2",
//     Entry: "₹1",
//     FilledSpots: 0 ,
//     FirstPosition: "500",
//     MaximumSpots: 13333 ,
//     PrizePool: "10000",
//     Type: "Mega Contest",
//     WinnersPercentage: "260 Winners" ,
//     Overs:[17,20],
//     Refunded:false,
//     Winning:[
//       {End: 10,PrizeMoney: 500,Spot: "1-10",Start: 1 },
//       {End: 260,PrizeMoney: 20,Spot: "11-260",Start: 11 },
//     ]
//   },
//   //##### TRENDING NOW #######################################################################################################################
//   {
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest3",
//     Entry: "₹6",
//     FilledSpots: 0 ,
//     FirstPosition: "300",
//     MaximumSpots: 350 ,
//     PrizePool: "1500",
//     Type: "Trending Now",
//     WinnersPercentage: "5 Winners" ,
//     Overs:[17,20],
//     Refunded:false,
//     Winning:[
//       {End: 5,PrizeMoney: 300,Spot: "1-5",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest4",
//     Entry: "₹29",
//     FilledSpots: 0 ,
//     FirstPosition: "500",
//     MaximumSpots: 140 ,
//     PrizePool: "3000",
//     Type: "Trending Now",
//     WinnersPercentage: "46%" ,
//     Overs:[1,4],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 500,Spot: "1",Start: 1 },
//       {End: 2,PrizeMoney: 300,Spot: "2",Start: 2 },
//       {End: 4,PrizeMoney: 150 ,Spot: "3-4",Start: 3 },
//       {End: 7,PrizeMoney: 100 ,Spot: "5-7",Start: 5 },
//       {End: 11,PrizeMoney: 75,Spot: "8-11",Start: 8 },
//       {End: 22,PrizeMoney: 40,Spot: "12-22",Start: 12 },
//       {End: 65,PrizeMoney: 20,Spot: "23-65",Start: 23 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest5",
//     Entry: "₹24",
//     FilledSpots: 0 ,
//     FirstPosition: "100",
//     MaximumSpots: 20 ,
//     PrizePool: "400",
//     Type: "Trending Now",
//     WinnersPercentage: "50%" ,
//     Overs:[4,7],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 100,Spot: "1",Start: 1 },
//       {End: 2,PrizeMoney: 70,Spot: "2",Start: 2 },
//       {End: 3,PrizeMoney: 50 ,Spot: "3",Start: 3 },
//       {End: 4,PrizeMoney: 40 ,Spot: "4",Start: 4 },
//       {End: 6,PrizeMoney: 30,Spot: "5-6",Start: 5 },
//       {End: 10,PrizeMoney: 24,Spot: "7-20",Start: 7 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest6",
//     Entry: "₹9",
//     FilledSpots: 0 ,
//     FirstPosition: "70",
//     MaximumSpots: 25 ,
//     PrizePool: "160",
//     Type: "Trending Now",
//     WinnersPercentage: "28%" ,
//     Overs:[10,13],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 70,Spot: "1",Start: 1 },
//       {End: 7,PrizeMoney: 15,Spot: "2-7",Start: 2 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest7",
//     Entry: "₹16",
//     FilledSpots: 0 ,
//     FirstPosition: "26",
//     MaximumSpots: 10 ,
//     PrizePool: "130",
//     Type: "Trending Now",
//     WinnersPercentage: "50%" ,
//     Overs:[17,20],
//     Refunded:false,
//     Winning:[
//       {End: 5,PrizeMoney: 26,Spot: "1-5",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest8",
//     Entry: "₹75",
//     FilledSpots: 0 ,
//     FirstPosition: "250",
//     MaximumSpots: 4,
//     PrizePool: "44",
//     Type: "Trending Now",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[6,9],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 250,Spot: "1",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest9",
//     Entry: "₹20",
//     FilledSpots: 0 ,
//     FirstPosition: "80",
//     MaximumSpots: 1500,
//     PrizePool: "21,600",
//     Type: "Trending Now",
//     WinnersPercentage: "270 Winners" ,
//     Overs:[17,20],
//     Refunded:false,
//     Winning:[
//       {End: 270,PrizeMoney: 80,Spot: "1-270",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest10",
//     Entry: "₹25",
//     FilledSpots: 0 ,
//     FirstPosition: "2500",
//     MaximumSpots: 1577,
//     PrizePool: "31,540",
//     Type: "Trending Now",
//     WinnersPercentage: "1020 Winners" ,
//     Overs:[12,15],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 2500,Spot: "1",Start: 1 },
//       {End: 2,PrizeMoney: 710,Spot: "2",Start: 2 },
//       {End: 3,PrizeMoney: 500 ,Spot: "3",Start: 3 },
//       {End: 5,PrizeMoney: 150 ,Spot: "4-5",Start: 4 },
//       {End: 7,PrizeMoney: 100,Spot: "6-7",Start: 6 },
//       {End: 15,PrizeMoney: 80,Spot: "11-15",Start: 11 },            
//       {End: 20,PrizeMoney: 75,Spot: "16-20",Start: 16 },            
//       {End: 40,PrizeMoney: 50,Spot: "21-40",Start: 21 },            
//       {End: 80,PrizeMoney: 40,Spot: "41-80",Start: 41 },            
//       {End: 100,PrizeMoney: 35,Spot: "81-100",Start: 81 },
//       {End: 1020,PrizeMoney: 25,Spot: "101-1020",Start: 101 },
//     ]
//   },
//   //##### ONLY FOR BEGINNERS ##################################################################################################################
//   {
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest11",
//     Entry: "₹13",
//     FilledSpots: 0 ,
//     FirstPosition: "100",
//     MaximumSpots: 100 ,
//     PrizePool: "1000",
//     Type: "Only For Beginners",
//     WinnersPercentage: "42%" ,
//     Overs:[1,4],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 100,Spot: "1",Start: 1 },
//       {End: 2,PrizeMoney: 50,Spot: "2",Start: 2 },
//       {End: 27,PrizeMoney: 25 ,Spot: "3",Start: 3 },
//       {End: 42,PrizeMoney: 15 ,Spot: "4",Start: 28 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest12",
//     Entry: "₹17",
//     FilledSpots: 0 ,
//     FirstPosition: "44",
//     MaximumSpots: 3,
//     PrizePool: "44",
//     Type: "Only For Beginners",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[10,13],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 44,Spot: "1",Start: 1 },
//     ]
//   },
//   //##### HIGH ENTRY = HIGH REWARDS ##################################################################################################################
  
//   {
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest13",
//     Entry: "₹5250",
//     FilledSpots: 0 ,
//     FirstPosition: "10000",
//     MaximumSpots: 2 ,
//     PrizePool: "10000",
//     Type: "High Entry=High Rewards",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[17,20],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 10000,Spot: "1",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest14",
//     Entry: "₹2700",
//     FilledSpots: 0 ,
//     FirstPosition: "10000",
//     MaximumSpots: 4 ,
//     PrizePool: "10000",
//     Type: "High Entry=High Rewards",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[17,20],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 10000,Spot: "1",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest15",
//     Entry: "₹2700",
//     FilledSpots: 0 ,
//     FirstPosition: "10000",
//     MaximumSpots: 4 ,
//     PrizePool: "10000",
//     Type: "High Entry=High Rewards",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[17,20],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 10000,Spot: "1",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest16",
//     Entry: "₹2850",
//     FilledSpots: 0 ,
//     FirstPosition: "10000",
//     MaximumSpots: 3 ,
//     PrizePool: "10000",
//     Type: "High Entry=High Rewards",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[10,13],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 10000,Spot: "1",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest17",
//     Entry: "₹1789",
//     FilledSpots: 0 ,
//     FirstPosition: "6000",
//     MaximumSpots: 4 ,
//     PrizePool: "6000",
//     Type: "High Entry=High Rewards",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[8,11],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 6000,Spot: "1",Start: 1 },
//     ]
//   },
//   //##### HEAD TO HEAD #######################################################################################################################
//   {
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest18",
//     Entry: "₹11",
//     FilledSpots: 0 ,
//     FirstPosition: "19",
//     MaximumSpots: 2,
//     PrizePool: "19",
//     Type: "Head To Head",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[17,20],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 19,Spot: "1",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest19",
//     Entry: "₹15",
//     FilledSpots: 0 ,
//     FirstPosition: "27",
//     MaximumSpots: 2,
//     PrizePool: "27",
//     Type: "Head To Head",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[4,27],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 27,Spot: "1",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest20",
//     Entry: "₹15",
//     FilledSpots: 0 ,
//     FirstPosition: "27",
//     MaximumSpots: 2,
//     PrizePool: "27",
//     Type: "Head To Head",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[1,4],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 27,Spot: "1",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest21",
//     Entry: "₹77",
//     FilledSpots: 0 ,
//     FirstPosition: "135",
//     MaximumSpots: 2,
//     PrizePool: "135",
//     Type: "Head To Head",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[1,4],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 135,Spot: "1",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest22",
//     Entry: "₹155",
//     FilledSpots: 0 ,
//     FirstPosition: "290",
//     MaximumSpots: 2,
//     PrizePool: "290",
//     Type: "Head To Head",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[17,20],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 290,Spot: "1",Start: 1 },
//     ]
//   },
//   //##### WINNER TAKES ALL #######################################################################################################################
//   {
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest23",
//     Entry: "₹230",
//     FilledSpots: 0 ,
//     FirstPosition: "600",
//     MaximumSpots: 3,
//     PrizePool: "600",
//     Type: "Winner Takes All",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[17,20],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 600,Spot: "1",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest24",
//     Entry: "₹179",
//     FilledSpots: 0 ,
//     FirstPosition: "600",
//     MaximumSpots: 4,
//     PrizePool: "179",
//     Type: "Winner Takes All",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[17,20],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 600,Spot: "1",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest25",
//     Entry: "₹550",
//     FilledSpots: 0 ,
//     FirstPosition: "1500",
//     MaximumSpots: 4,
//     PrizePool: "1500",
//     Type: "Winner Takes All",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[1,4],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 1500,Spot: "1",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest26",
//     Entry: "₹6",
//     FilledSpots: 0 ,
//     FirstPosition: "20",
//     MaximumSpots: 4,
//     PrizePool: "20",
//     Type: "Winner Takes All",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[16,19],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 20,Spot: "1",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest27",
//     Entry: "₹35",
//     FilledSpots: 0 ,
//     FirstPosition: "90",
//     MaximumSpots: 3,
//     PrizePool: "90",
//     Type: "Winner Takes All",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[15,18],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 90,Spot: "1",Start: 1 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest28",
//     Entry: "₹3",
//     FilledSpots: 0 ,
//     FirstPosition: "140",
//     MaximumSpots: 50,
//     PrizePool: "140",
//     Type: "Winner Takes All",
//     WinnersPercentage: "1 Winner" ,
//     Overs:[17,20],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 140,Spot: "1",Start: 1 },
//     ]
//   },
//   //LOW ENTRY CONTESTS #######################################################################################################################
//   {
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest29",
//     Entry: "₹1",
//     FilledSpots: 0 ,
//     FirstPosition: "1000",
//     MaximumSpots: 2000,
//     PrizePool: "1800",
//     Type: "Low Entry Contests",
//     WinnersPercentage: "5 Winners" ,
//     Overs:[17,20],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 1000,Spot: "1",Start: 1 },
//       {End: 5,PrizeMoney: 200,Spot: "2-5",Start: 2 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest30",
//     Entry: "₹2",
//     FilledSpots: 0 ,
//     FirstPosition: "500",
//     MaximumSpots: 500,
//     PrizePool: "900",
//     Type: "Low Entry Contests",
//     WinnersPercentage: "5 Winners" ,
//     Overs:[1,4],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 500,Spot: "1",Start: 1 },
//       {End: 5,PrizeMoney: 100,Spot: "2-5",Start: 2 },
//     ]
//   },{
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest31",
//     Entry: "₹5",
//     FilledSpots: 0 ,
//     FirstPosition: "500",
//     MaximumSpots: 200,
//     PrizePool: "900",
//     Type: "Low Entry Contests",
//     WinnersPercentage: "5 Winners" ,
//     Overs:[17,20],
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 500,Spot: "1",Start: 1 },
//       {End: 5,PrizeMoney: 100,Spot: "2-5",Start: 2 },
//     ]
//   }]

//   for(i=1 ; i<=10 ; i++){
//     documents.forEach(doc => {
//       const MatchId = 'Match'+i
//       firestore.collection('AllMatches').doc(MatchId).collection('4oversContests').doc(doc.DocumentId).set(doc,{merge:true})
//     });
//   }
// })

exports.DeployContests = onDocumentWritten({maxInstances:10,document:"DeployContests/{Deploy}"}, async (event) => {
  // const documents = [
  //   //##### MEGA CONTEST #######################################################################################################################
  //   {
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest1",
  //   Entry: "₹30",
  //   FilledSpots: 0 ,
  //   FirstPosition: "4000",
  //   MaximumSpots: 2200 ,
  //   PrizePool: "50000",
  //   Type: "Mega Contest",
  //   WinnersPercentage: "58%" ,
  //   Overs:[16,19],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 4000,Spot: "1",Start: 1 },
  //     {End: 2,PrizeMoney: 1000,Spot: "2",Start: 2 },
  //     {End: 3,PrizeMoney: 600 ,Spot: "3",Start: 3 },
  //     {End: 4,PrizeMoney: 400 ,Spot: "4",Start: 4 },
  //     {End: 10,PrizeMoney: 200,Spot: "5-10",Start: 5 },
  //     {End: 25,PrizeMoney: 100,Spot: "11-25",Start: 11 },
  //     {End: 60,PrizeMoney: 70,Spot: "26-60",Start: 26 },
  //     {End: 120,PrizeMoney: 60,Spot: "61-120",Start: 61 },
  //     {End: 204,PrizeMoney: 40,Spot: "121-204",Start: 121 },
  //     {End: 1267,PrizeMoney: 30,Spot: "204-1267",Start: 204 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest2",
  //   Entry: "₹1",
  //   FilledSpots: 0 ,
  //   FirstPosition: "500",
  //   MaximumSpots: 13333 ,
  //   PrizePool: "10000",
  //   Type: "Mega Contest",
  //   WinnersPercentage: "260 Winners" ,
  //   Overs:[17,20],
  //   Refunded:false,
  //   Winning:[
  //     {End: 10,PrizeMoney: 500,Spot: "1-10",Start: 1 },
  //     {End: 260,PrizeMoney: 20,Spot: "11-260",Start: 11 },
  //   ]
  // },
  // //##### TRENDING NOW #######################################################################################################################
  // {
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest3",
  //   Entry: "₹6",
  //   FilledSpots: 0 ,
  //   FirstPosition: "300",
  //   MaximumSpots: 350 ,
  //   PrizePool: "1500",
  //   Type: "Trending Now",
  //   WinnersPercentage: "5 Winners" ,
  //   Overs:[17,20],
  //   Refunded:false,
  //   Winning:[
  //     {End: 5,PrizeMoney: 300,Spot: "1-5",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest4",
  //   Entry: "₹29",
  //   FilledSpots: 0 ,
  //   FirstPosition: "500",
  //   MaximumSpots: 140 ,
  //   PrizePool: "3000",
  //   Type: "Trending Now",
  //   WinnersPercentage: "46%" ,
  //   Overs:[1,4],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 500,Spot: "1",Start: 1 },
  //     {End: 2,PrizeMoney: 300,Spot: "2",Start: 2 },
  //     {End: 4,PrizeMoney: 150 ,Spot: "3-4",Start: 3 },
  //     {End: 7,PrizeMoney: 100 ,Spot: "5-7",Start: 5 },
  //     {End: 11,PrizeMoney: 75,Spot: "8-11",Start: 8 },
  //     {End: 22,PrizeMoney: 40,Spot: "12-22",Start: 12 },
  //     {End: 65,PrizeMoney: 20,Spot: "23-65",Start: 23 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest5",
  //   Entry: "₹24",
  //   FilledSpots: 0 ,
  //   FirstPosition: "100",
  //   MaximumSpots: 20 ,
  //   PrizePool: "400",
  //   Type: "Trending Now",
  //   WinnersPercentage: "50%" ,
  //   Overs:[4,7],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 100,Spot: "1",Start: 1 },
  //     {End: 2,PrizeMoney: 70,Spot: "2",Start: 2 },
  //     {End: 3,PrizeMoney: 50 ,Spot: "3",Start: 3 },
  //     {End: 4,PrizeMoney: 40 ,Spot: "4",Start: 4 },
  //     {End: 6,PrizeMoney: 30,Spot: "5-6",Start: 5 },
  //     {End: 10,PrizeMoney: 24,Spot: "7-20",Start: 7 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest6",
  //   Entry: "₹9",
  //   FilledSpots: 0 ,
  //   FirstPosition: "70",
  //   MaximumSpots: 25 ,
  //   PrizePool: "160",
  //   Type: "Trending Now",
  //   WinnersPercentage: "28%" ,
  //   Overs:[10,13],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 70,Spot: "1",Start: 1 },
  //     {End: 7,PrizeMoney: 15,Spot: "2-7",Start: 2 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest7",
  //   Entry: "₹16",
  //   FilledSpots: 0 ,
  //   FirstPosition: "26",
  //   MaximumSpots: 10 ,
  //   PrizePool: "130",
  //   Type: "Trending Now",
  //   WinnersPercentage: "50%" ,
  //   Overs:[17,20],
  //   Refunded:false,
  //   Winning:[
  //     {End: 5,PrizeMoney: 26,Spot: "1-5",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest8",
  //   Entry: "₹75",
  //   FilledSpots: 0 ,
  //   FirstPosition: "250",
  //   MaximumSpots: 4,
  //   PrizePool: "44",
  //   Type: "Trending Now",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[6,9],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 250,Spot: "1",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest9",
  //   Entry: "₹20",
  //   FilledSpots: 0 ,
  //   FirstPosition: "80",
  //   MaximumSpots: 1500,
  //   PrizePool: "21,600",
  //   Type: "Trending Now",
  //   WinnersPercentage: "270 Winners" ,
  //   Overs:[17,20],
  //   Refunded:false,
  //   Winning:[
  //     {End: 270,PrizeMoney: 80,Spot: "1-270",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest10",
  //   Entry: "₹25",
  //   FilledSpots: 0 ,
  //   FirstPosition: "2500",
  //   MaximumSpots: 1577,
  //   PrizePool: "31,540",
  //   Type: "Trending Now",
  //   WinnersPercentage: "1020 Winners" ,
  //   Overs:[12,15],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 2500,Spot: "1",Start: 1 },
  //     {End: 2,PrizeMoney: 710,Spot: "2",Start: 2 },
  //     {End: 3,PrizeMoney: 500 ,Spot: "3",Start: 3 },
  //     {End: 5,PrizeMoney: 150 ,Spot: "4-5",Start: 4 },
  //     {End: 7,PrizeMoney: 100,Spot: "6-7",Start: 6 },
  //     {End: 15,PrizeMoney: 80,Spot: "11-15",Start: 11 },            
  //     {End: 20,PrizeMoney: 75,Spot: "16-20",Start: 16 },            
  //     {End: 40,PrizeMoney: 50,Spot: "21-40",Start: 21 },            
  //     {End: 80,PrizeMoney: 40,Spot: "41-80",Start: 41 },            
  //     {End: 100,PrizeMoney: 35,Spot: "81-100",Start: 81 },
  //     {End: 1020,PrizeMoney: 25,Spot: "101-1020",Start: 101 },
  //   ]
  // },
  // //##### ONLY FOR BEGINNERS ##################################################################################################################
  // {
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest11",
  //   Entry: "₹13",
  //   FilledSpots: 0 ,
  //   FirstPosition: "100",
  //   MaximumSpots: 100 ,
  //   PrizePool: "1000",
  //   Type: "Only For Beginners",
  //   WinnersPercentage: "42%" ,
  //   Overs:[1,4],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 100,Spot: "1",Start: 1 },
  //     {End: 2,PrizeMoney: 50,Spot: "2",Start: 2 },
  //     {End: 27,PrizeMoney: 25 ,Spot: "3",Start: 3 },
  //     {End: 42,PrizeMoney: 15 ,Spot: "4",Start: 28 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest12",
  //   Entry: "₹17",
  //   FilledSpots: 0 ,
  //   FirstPosition: "44",
  //   MaximumSpots: 3,
  //   PrizePool: "44",
  //   Type: "Only For Beginners",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[10,13],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 44,Spot: "1",Start: 1 },
  //   ]
  // },
  // //##### HIGH ENTRY = HIGH REWARDS ##################################################################################################################
  
  // {
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest13",
  //   Entry: "₹5250",
  //   FilledSpots: 0 ,
  //   FirstPosition: "10000",
  //   MaximumSpots: 2 ,
  //   PrizePool: "10000",
  //   Type: "High Entry=High Rewards",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[17,20],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 10000,Spot: "1",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest14",
  //   Entry: "₹2700",
  //   FilledSpots: 0 ,
  //   FirstPosition: "10000",
  //   MaximumSpots: 4 ,
  //   PrizePool: "10000",
  //   Type: "High Entry=High Rewards",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[17,20],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 10000,Spot: "1",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest15",
  //   Entry: "₹2700",
  //   FilledSpots: 0 ,
  //   FirstPosition: "10000",
  //   MaximumSpots: 4 ,
  //   PrizePool: "10000",
  //   Type: "High Entry=High Rewards",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[17,20],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 10000,Spot: "1",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest16",
  //   Entry: "₹2850",
  //   FilledSpots: 0 ,
  //   FirstPosition: "10000",
  //   MaximumSpots: 3 ,
  //   PrizePool: "10000",
  //   Type: "High Entry=High Rewards",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[10,13],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 10000,Spot: "1",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest17",
  //   Entry: "₹1789",
  //   FilledSpots: 0 ,
  //   FirstPosition: "6000",
  //   MaximumSpots: 4 ,
  //   PrizePool: "6000",
  //   Type: "High Entry=High Rewards",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[8,11],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 6000,Spot: "1",Start: 1 },
  //   ]
  // },
  // //##### HEAD TO HEAD #######################################################################################################################
  // {
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest18",
  //   Entry: "₹11",
  //   FilledSpots: 0 ,
  //   FirstPosition: "19",
  //   MaximumSpots: 2,
  //   PrizePool: "19",
  //   Type: "Head To Head",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[17,20],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 19,Spot: "1",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest19",
  //   Entry: "₹15",
  //   FilledSpots: 0 ,
  //   FirstPosition: "27",
  //   MaximumSpots: 2,
  //   PrizePool: "27",
  //   Type: "Head To Head",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[4,27],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 27,Spot: "1",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest20",
  //   Entry: "₹15",
  //   FilledSpots: 0 ,
  //   FirstPosition: "27",
  //   MaximumSpots: 2,
  //   PrizePool: "27",
  //   Type: "Head To Head",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[1,4],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 27,Spot: "1",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest21",
  //   Entry: "₹77",
  //   FilledSpots: 0 ,
  //   FirstPosition: "135",
  //   MaximumSpots: 2,
  //   PrizePool: "135",
  //   Type: "Head To Head",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[1,4],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 135,Spot: "1",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest22",
  //   Entry: "₹155",
  //   FilledSpots: 0 ,
  //   FirstPosition: "290",
  //   MaximumSpots: 2,
  //   PrizePool: "290",
  //   Type: "Head To Head",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[17,20],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 290,Spot: "1",Start: 1 },
  //   ]
  // },
  // //##### WINNER TAKES ALL #######################################################################################################################
  // {
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest23",
  //   Entry: "₹230",
  //   FilledSpots: 0 ,
  //   FirstPosition: "600",
  //   MaximumSpots: 3,
  //   PrizePool: "600",
  //   Type: "Winner Takes All",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[17,20],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 600,Spot: "1",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest24",
  //   Entry: "₹179",
  //   FilledSpots: 0 ,
  //   FirstPosition: "600",
  //   MaximumSpots: 4,
  //   PrizePool: "179",
  //   Type: "Winner Takes All",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[17,20],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 600,Spot: "1",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest25",
  //   Entry: "₹550",
  //   FilledSpots: 0 ,
  //   FirstPosition: "1500",
  //   MaximumSpots: 4,
  //   PrizePool: "1500",
  //   Type: "Winner Takes All",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[1,4],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 1500,Spot: "1",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest26",
  //   Entry: "₹6",
  //   FilledSpots: 0 ,
  //   FirstPosition: "20",
  //   MaximumSpots: 4,
  //   PrizePool: "20",
  //   Type: "Winner Takes All",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[16,19],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 20,Spot: "1",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest27",
  //   Entry: "₹35",
  //   FilledSpots: 0 ,
  //   FirstPosition: "90",
  //   MaximumSpots: 3,
  //   PrizePool: "90",
  //   Type: "Winner Takes All",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[15,18],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 90,Spot: "1",Start: 1 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest28",
  //   Entry: "₹3",
  //   FilledSpots: 0 ,
  //   FirstPosition: "140",
  //   MaximumSpots: 50,
  //   PrizePool: "140",
  //   Type: "Winner Takes All",
  //   WinnersPercentage: "1 Winner" ,
  //   Overs:[17,20],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 140,Spot: "1",Start: 1 },
  //   ]
  // },
  // //LOW ENTRY CONTESTS #######################################################################################################################
  // {
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest29",
  //   Entry: "₹1",
  //   FilledSpots: 0 ,
  //   FirstPosition: "1000",
  //   MaximumSpots: 2000,
  //   PrizePool: "1800",
  //   Type: "Low Entry Contests",
  //   WinnersPercentage: "5 Winners" ,
  //   Overs:[17,20],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 1000,Spot: "1",Start: 1 },
  //     {End: 5,PrizeMoney: 200,Spot: "2-5",Start: 2 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest30",
  //   Entry: "₹2",
  //   FilledSpots: 0 ,
  //   FirstPosition: "500",
  //   MaximumSpots: 500,
  //   PrizePool: "900",
  //   Type: "Low Entry Contests",
  //   WinnersPercentage: "5 Winners" ,
  //   Overs:[1,4],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 500,Spot: "1",Start: 1 },
  //     {End: 5,PrizeMoney: 100,Spot: "2-5",Start: 2 },
  //   ]
  // },{
  //   ContestStatus:'Upcoming',
  //   DocumentId: "4Contest31",
  //   Entry: "₹5",
  //   FilledSpots: 0 ,
  //   FirstPosition: "500",
  //   MaximumSpots: 200,
  //   PrizePool: "900",
  //   Type: "Low Entry Contests",
  //   WinnersPercentage: "5 Winners" ,
  //   Overs:[17,20],
  //   Refunded:false,
  //   Winning:[
  //     {End: 1,PrizeMoney: 500,Spot: "1",Start: 1 },
  //     {End: 5,PrizeMoney: 100,Spot: "2-5",Start: 2 },
  //   ]
  // }]

  // const matchIds = ['Match1', 'Match2', 'Match3', 'Match4', 'Match5', 'Match6', 'Match7', 'Match8', 'Match9', 'Match10'];

  // const batch = firestore.batch();

  return await firestore.collection('AllMatches').doc('Match1').collection('4oversContests').get().then(QuerySnapshot=>{
    const min = 1;
    const max = 50;
    QuerySnapshot.forEach(documentSnapshot=>{
      documentSnapshot.ref.set({
        Overs:Math.floor(Math.random() * (max - min + 1)) + min,
        ContestStatus:'Upcoming'
      },{merge:true})
    })
  })
  
  // matchIds.forEach(matchId => {
  //   documents.forEach(doc => {
  //     const contestRef = firestore.collection('AllMatches').doc(matchId).collection('4oversContests').doc(doc.DocumentId);
  //     batch.set(contestRef, doc, { merge: true });
  //   });
  // });

  // await batch.commit();
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request.data, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


// exports.VpaValidate = onCall({maxInstances:10},async(request)=>{
//   const eventPayload = {
//       merchantId: "BALL24ONLINE",
//       vpa: request.data.upi
//   };
//   const encodedPayload = Buffer.from(JSON.stringify(eventPayload)).toString("base64");
//   const saltKey = "7ec7141f-5344-4d33-aa84-a536da2cb075";
//   const saltIndex = 1;
//   const string = encodedPayload + "/pg/v1/vpa/validate" + saltKey;
//   const sha256 = crypto.createHash("sha256").update(string).digest("hex");
//   const finalXHeader = sha256 + "###" + saltIndex;
//   const headers = {
//       "Content-Type": "application/json",
//       "X-VERIFY": finalXHeader,
//   };
//   const phonePayUrl = "https://api.phonepe.com/apis/hermes/pg/v1/vpa/validate";
//   const response = await fetch(phonePayUrl, {
//       method: "POST",
//       body: JSON.stringify({ request: encodedPayload }),
//       headers: headers,
//   });
//   const data = await response.json();
//   return data;
//   })
  
//   exports.TransactionViaUpi = onCall({ maxInstances: 10 }, async (request) => {
//     const amount = parseFloat(request.data.amount) * 100;
//     const eventPayload = {
//       merchantId: "BALL24ONLINE",
//       merchantTransactionId: "B24" + Date.now(),
//       merchantUserId: "MUID123898",
//       amount: amount,
//       callbackUrl: "https://ball24.in",
//       mobileNumber: "7017141121",
//       paymentInstrument: {
//           type: "UPI_COLLECT",
//           vpa: request.data.upi,
//       }
//     };
  
//     const encodedPayload = Buffer.from(JSON.stringify(eventPayload)).toString("base64");
//     const saltKey = "7ec7141f-5344-4d33-aa84-a536da2cb075";
//     const saltIndex = 1;
//     const string = encodedPayload + "/pg/v1/pay" + saltKey;
//     const sha256 = crypto.createHash("sha256").update(string).digest("hex");
//     const finalXHeader = sha256 + "###" + saltIndex;
  
//     const headers = {
//       "Content-Type": "application/json",
//       "X-VERIFY": finalXHeader,
//     };
  
//     const phonePayUrl = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
//     const response = await fetch(phonePayUrl, {
//       method: "POST",
//       body: JSON.stringify({ request: encodedPayload }),
//       headers: headers,
//     });
  
//     const data = await response.json();
//     return data;
//   });
  
  
  
//   exports.TransactionUpiIntent = onCall({ maxInstances: 10 }, async (request) => {
//     const amount = parseFloat(request.data.amount) * 100;
//     const eventPayload = 
//     {
//         merchantId: "BALL24ONLINE",
//         merchantTransactionId: "B24"+Date.now(),
//         merchantUserId: "MUID123",
//         amount: amount,
//         callbackUrl: "https://ball24.in",
//         mobileNumber: "9999999999",
//         paymentInstrument: {
//             type: "UPI_INTENT",
//             targetApp: request.data.packageName
//         },
//         deviceContext: {
//             deviceOS: "ANDROID"
//         }
//     };
//     const base64 = Buffer.from(JSON.stringify(eventPayload)).toString("base64");
//     const sha256 = crypto.createHash("sha256").update(base64 + "/pg/v1/pay" + "7ec7141f-5344-4d33-aa84-a536da2cb075").digest("hex");
//     const finalXHeader = sha256 + "###" + 1;
//     return {request:base64,checksum:finalXHeader};
//   });