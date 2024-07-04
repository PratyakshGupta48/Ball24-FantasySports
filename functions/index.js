const {initializeApp} = require("firebase-admin/app");
initializeApp();
const {onRequest} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onDocumentWritten} = require("firebase-functions/v2/firestore");
const {onCall} = require("firebase-functions/v2/https");
const {getFirestore,FieldValue} = require("firebase-admin/firestore");
const firestore = getFirestore();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const fetch = require("node-fetch");
const {setGlobalOptions} = require("firebase-functions/v2");
setGlobalOptions({maxInstances: 10});

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

exports.sendEmail = onCall(async (request)=>{
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

exports.AddEmail = onCall(async (request)=>{
  await firestore.collection('users').doc(request.data.uid).update({
    Email:request.data.email
  })
  return null;
})

exports.GenerateReferCode = onCall(async (request)=>{
  const existingReferCode = await generateUniqueReferCode();
  await firestore.collection('users').doc(request.data.uid).update({
    ReferCode: existingReferCode,
  });
  return { referCode: existingReferCode };
})

exports.RedeemFifty = onCall( async (request) => {
  try {
    const uid = request.data.uid;
    const dbref = firestore.collection('users').doc(uid);
    const documentSnapshot = await dbref.get();
    if (documentSnapshot.data().ReferPoints < 10) return "Funds";
    const time = new Date().getTime();
    await dbref.update({
      ReferPoints: FieldValue.increment(-10),
      AddedAmount: FieldValue.increment(50),
      Transactions: FieldValue.arrayUnion({
        type:'Deposit',
        context:'Refer And Win',
        Extra:'Redeemed 10 Refer Points',
        tid:"RW"+time,
        time:time,
        To:'Added Amount',
        From:null,
        status:'success',
        Amount: '₹' + 50,
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

exports.RedeemPrize = onCall(async (request) => {
  try{
    const {uid,Point,Prize,Email,Mobile} = request.data;
    const dbref = firestore.collection('users').doc(uid);
    const documentSnapshot = await dbref.get();
    if (documentSnapshot.data().ReferPoints < Point) return "Funds";
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
});

exports.ProfileImage = onCall(async (request)=>{
  await firestore.collection('users').doc(request.data.uid).update({
    ProfileImage:request.data.url
  }).then(()=>{
    return null;
  })
})

exports.Feedback = onCall(async (request)=>{
  await firestore.collection('Feedback').doc(request.data.uid).set({
    uid:request.data.uid,
    Feedback:request.data.Feedback
  }).then(()=>{
    return null;
  })
})

exports.NameEnteredCreateDoc = onCall(async (request)=>{
  const dbref = firestore.collection('users').doc(request.data.uid);
  await dbref.set({
    Name: request.data.name,
    PhoneNumber: request.data.phoneNumber,
    AddedAmount: 0,
    WinningAmount: 0,
    Contest:false,
    DBCashBonus: 100,
    ProfileImage: request.data.photo,
    ReferredBy: request.data.refferedBy,
    RefferalsOnThisName: 0,
    ReferPoints:0,
    DateOfBirth: "",
    Email: "",
    Gender: "",
    OriginalName: "",
    Transactions: [],
    BankAccount: null,
    upi:null,
    Pan:'Not Verified'  //Pending // Verified
  })
  if(request.data.Id)
    await firestore.collection('users').doc(request.data.Id).update({
      RefferalsOnThisName:FieldValue.increment(1),
      ReferPoints:FieldValue.increment(1)
    })
  return null;
})



exports.EditSet = onCall(async (request)=>{
  await firestore.collection('AllMatches').doc(request.data.MatchId).collection('ParticipantsWithTheirSets').doc(request.data.uid).update({
    [request.data.SetName]:request.data.Set
  }).then(()=>{
    return null;
  })
})

exports.EditSetMain = onCall(async(request)=>{
  return firestore.collection('AllMatches').doc(request.data.MatchId).collection('ParticipantsWithTheirSets').doc(request.data.uid).update({
    [request.data.SetName]:request.data.Set
  })
})

exports.SetCreator = onCall(async(request)=>{
  const def = firestore.collection('AllMatches').doc(request.data.MatchId).collection('ParticipantsWithTheirSets');
  def.doc(request.data.uid).set({
    Count:request.data.UniqueSetNumber,
    ['S'+request.data.UniqueSetNumber]:request.data.selectedScores,
  },{merge:true})
})

exports.SwapSets = onCall(async(request)=>{
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




exports.VerifyPan = onCall(async(request)=>{
  let time = new Date().getTime();
  await firestore.collection('users').doc(request.data.uid).update({
    Pan:"Pending",
    PanCard:request.data.Pan,
    OriginalName:request.data.name
  })
  await firestore.collection('Verify pan').doc(new Date().toDateString()+request.data.uid+time).set({
    uid:request.data.uid,
    Name:request.data.name,
    Pan:request.data.Pan,
    date:request.data.date,
    image:request.data.image,
    flat:request.data.flat,
    area:request.data.area,
    Pincode:request.data.Pincode,
    city:request.data.city,
    state:request.data.state,
    time:time,
    status:'Pending'
  }).then(()=>{
    return null;
  })
})

exports.Withdraw = onCall(async(request)=>{
  let time = new Date();
  const timeStamp = time.getTime()
  const amount = request.data.Amount;
  const financialYear = time.getMonth() >= 3 ? time.getFullYear() : time.getFullYear() - 1;
  const depositsDocRef = firestore.collection('users').doc(request.data.uid).collection(`FinancialYear${financialYear}`);
  const tds = firestore.collection('30TDS').doc(time.toLocaleString('en-US', { month: 'long' })+time.getFullYear());
  await Promise.all([
    depositsDocRef.doc('PreviousNetWinnings').set({
      NetWinningsAggregate: FieldValue.increment(Number(request.data.netWinning))
    },{merge:true}),
    depositsDocRef.doc('PreviousNetWinnings').collection('Details').doc("WA"+timeStamp).set({
      TotalWithdraw:amount,
      netWinning:request.data.netWinning,
      tds:request.data.tds,
      tid:"WA"+timeStamp
    }),
    depositsDocRef.doc('Withdraw').set({
      WithdrawAggregate: FieldValue.increment(Number(amount)),
    },{ merge: true }),
    depositsDocRef.doc('Withdraw').collection('Withdraw Details').doc("WA"+timeStamp).set({
      time: timeStamp,
      Amount: amount,
      tid: "WA"+timeStamp,
    }),
    tds.set({
      TDSAggregate: FieldValue.increment(Number(request.data.tds))
    },{merge:true}),
    tds.collection('Details').doc("TDS"+timeStamp).set({
      time: timeStamp,
      TDS: request.data.tds,
      tid: "WA"+timeStamp,
      AmountWithdrawn:amount,
      Pan:request.data.pan,
      uid:request.data.uid,
      Name:request.data.OriginalName,
      Email:request.data.Email
    }),
    firestore.collection('users').doc(request.data.uid).update({
      WinningAmount:FieldValue.increment(-Number(amount)),
      Transactions: FieldValue.arrayUnion({
        type:'Debit',
        context:'Withdraw',
        Extra:'Withdraw to '+request.data.mode,
        tid:"WA"+timeStamp,
        time:timeStamp,
        To:null,
        From:'Winnings Amount',
        status:'Pending',
        Amount:'₹'+(amount-request.data.tds),
      },{
        type:'Debit',
        context:'TDS',
        Extra:'TDS Deducted',
        tid:"TDS"+timeStamp,
        time:timeStamp,
        To:null,
        From:'Winnings Amount',
        status:'Pending',
        Amount:'₹'+request.data.tds,
      })
    }),
    firestore.collection('Withdrawal Requests').doc(request.data.uid+"WA"+time.toString()).set({
      uid:request.data.uid,
      Pan:request.data.pan,
      WithdrawAmount:amount,
      CreditAmount:amount-request.data.tds,
      tds:request.data.tds,
      Name:request.data.Name,
      AccountNumber:request.data.AccountNumber,
      IFSCCode:request.data.IFSC,
      Index:request.data.index,
      upi:request.data.upi,
      To:request.data.To,
      time:timeStamp,
      tid:"WA"+timeStamp,
      status:'Pending'
    })
  ])
  return null;
})

exports.Transaction = onCall(async(request)=>{
  const amount = parseFloat(request.data.amount) * 100;
  const date = Date.now();
  const eventPayload = {
      merchantId: "BALL24ONLINE",
      merchantTransactionId: "B24"+date,
      merchantUserId: request.data.uid,
      amount: amount,
      callbackUrl: `https://us-central1-ball-24.cloudfunctions.net/callbackResponse?uid=${request.data.uid}&amount=${request.data.amount}&tid=${"B24"+date}`,
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

exports.callbackResponse = onRequest( async (req, res) => {
  const amount = req.query.amount;
  if (req.method === 'POST') {
    const jsonResponse = JSON.parse(Buffer.from(req.body.response, 'base64').toString('utf-8'));
    if (jsonResponse.code === 'PAYMENT_SUCCESS') {
      const amount = jsonResponse.data.amount / 100
      const time = new Date();
      const financialYear = time.getMonth() >= 3 ? time.getFullYear() : time.getFullYear() - 1;
      const userDocRef = firestore.collection('users').doc(req.query.uid);
      const depositsDocRef = userDocRef.collection(`FinancialYear${financialYear}`).doc('Deposits');
      const gst = firestore.collection('28GST').doc(time.toLocaleString('en-US', { month: 'long' })+time.getFullYear());
      await depositsDocRef.set({
        DepositsAggregate: FieldValue.increment(amount),
      },{ merge: true });
      await gst.set({
        GSTAggregate: FieldValue.increment(Math.ceil((0.21875) * (amount) * 100) / 100)
      },{merge:true})
      const batch = firestore.batch();
      batch.update(userDocRef, {
        AddedAmount: FieldValue.increment(amount),
        Transactions: FieldValue.arrayUnion({
          type: 'Deposit',
          context: 'Deposit',
          Extra: null,
          tid: req.query.tid,
          time: time.getTime(),
          To: 'Added Amount',
          From: null,
          status: 'success',
          Amount: amount,
        }),
      });
      batch.set(depositsDocRef.collection('Deposits Details').doc(req.query.tid), {
        time: time.getTime(),
        Amount: amount,
        tid: req.query.tid,
      });
      batch.set(gst.collection('Details').doc(req.query.tid),{
        time: time.toLocaleString(),
        GST: Math.ceil((0.21875) * (amount) * 100) / 100,
        tid: req.query.tid,
        AmountDeposited:amount
      })
      await batch.commit();
      res.status(200).send('Payment success');
    }
    else if (jsonResponse.code) {
      await firestore.collection('users').doc(req.query.uid).update({
        Transactions: FieldValue.arrayUnion({
          type: 'Deposit',
          context: 'Deposit',
          Extra: null,
          tid: req.query.tid,
          time: new Date().getTime(),
          To: 'Added Amount',
          From: null,
          status: 'failed',
          Amount: amount,
        }),
      });
      res.status(200).send('Payment Hold (Failed)');
    } 
    else res.status(400).send('Bad Request');
  } 
  else res.status(405).send('Method Not Allowed');
});

exports.AddUpiBank = onCall(async (request)=>{
  const dbref = firestore.collection('users').doc(request.data.uid)
  if(request.data.bank==null)
    await dbref.update({
      upi:request.data.upi
    })
  else if(request.data.upi==null)
    await dbref.update({
      BankAccount:{
        AccountHolder:request.data.AccountHolder,
        IfscCode:request.data.IfscCode,
        AccountNumber:request.data.AccountNumber
      }
    })
  return null;
})

async function checkAndSetVariable(docRef, field, variable) {
  const docSnapshot = await docRef.get();
  if (docSnapshot.exists) variable = docSnapshot.data()[field] || 0;
  return variable;
}

exports.OpeningClosingBalance = onSchedule('0 0 1 4 *',async ()=>{
  let time = new Date();
  const timeStamp = time.getTime()
  const presentFinancialYear = time.getFullYear(); 
  const pastFinancialYear = presentFinancialYear-1;
  const db = firestore.collection('users');
  const tds = firestore.collection('30TDS').doc(time.toLocaleString('en-US', { month: 'long' })+time.getFullYear());
  db.get().then(async QuerySnapshot=>{ 
    // QuerySnapshot.forEach(async documentSnapshot=>{
    for (const documentSnapshot of QuerySnapshot.docs) {
      let AggregateDeposits = 0;
      let AggregateWithdrawal = 0;
      let OpeningBalance = 0;
      let AggregateNetWinnings = 0;
      let WinningAmount;
      // Check if Winning Amount is greater than 0 for the user
      const userDoc = await db.doc(documentSnapshot.id).get();
      WinningAmount = userDoc.data().WinningAmount;
      if(WinningAmount>0){
        let NetWinnings;
        await  Promise.all([
          checkAndSetVariable(db.doc(documentSnapshot.id).collection(`FinancialYear${pastFinancialYear}`).doc('Deposits'), 'DepositsAggregate', AggregateDeposits),
          checkAndSetVariable(db.doc(documentSnapshot.id).collection(`FinancialYear${pastFinancialYear}`).doc('Withdraw'), 'WithdrawAggregate', AggregateWithdrawal),
          checkAndSetVariable(db.doc(documentSnapshot.id).collection(`FinancialYear${pastFinancialYear}`).doc('PreviousNetWinnings'), 'NetWinningsAggregate', AggregateNetWinnings),
          checkAndSetVariable(db.doc(documentSnapshot.id).collection(`FinancialYear${pastFinancialYear}`).doc('OpeningBalance'), 'OpeningBalance', OpeningBalance),
        ]).then(()=>{
          //Deducting TDS and calculating Opening Balance of each user at the end of financial year
          //At the end of the year adding the remaining amount after TDS to deposit amount so that TDS on it does not deduct again
          //and making the Winning Amount 0
          NetWinnings = (AggregateWithdrawal + WinningAmount)-(AggregateDeposits+OpeningBalance+AggregateNetWinnings);
          if(NetWinnings>0){
            let TDS = 0.30*NetWinnings;
            tds.update({
              TDSAggregate: FieldValue.increment(Number(TDS))
            },{merge:true})
            tds.collection('Details').doc("TDS"+timeStamp+documentSnapshot.id+'END').set({
              time: timeStamp,
              TDS: TDS,
              tid: "WA"+timeStamp,
              AmountWithdrawn:WinningAmount,
              Pan:documentSnapshot.data().PanCard,
              uid:documentSnapshot.id,
              Name:documentSnapshot.data().OriginalName,
              Email:documentSnapshot.data().Email,
              End:'End of Financial Year'
            })
            db.doc(documentSnapshot.id).update({
              WinningAmount:FieldValue.increment(-Number(TDS)),
              Transactions: FieldValue.arrayUnion({
                type:'Debit',
                context:'TDS (End of Financial Year)',
                Extra:'TDS Deducted',
                tid:"TDS"+timeStamp,
                time:timeStamp,
                To:null,
                From:'Winnings Amount',
                status:'Pending',
                Amount:'₹'+TDS,
              })
            })
            db.doc(documentSnapshot.id).collection(`FinancialYear${presentFinancialYear}`).doc('OpeningBalance').set({
              OpeningBalance:WinningAmount-TDS
            },{merge:true})
          }
        })
      }
    }
  })
})




exports.ContestEliminatorViaDeadline = onDocumentWritten({document:"AllMatches/Match1/LiveScores/LiveScores"},async (event)=>{
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
                  type:'Deposit',
                  context:'Refund',
                  Extra:'Spots not filled', //To be changed in every match
                  tid:"RB"+time,
                  time:time,
                  To:'Winnings Amount',
                  From:null,
                  status:'success',
                  Amount: Entry,
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

exports.OnMatchLiveElimination = onDocumentWritten({document:"AllMatches/Match1"},async (event)=>{//
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  if (beforeData.Status === 'Upcoming' && afterData.Status === 'Live') {
    const dbref = firestore.collection('AllMatches').doc('Match1').collection('4oversContests');//
    await dbref.where('Overs','==', 1).get().then(QuerySnapshot=>{
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
                  type:'Deposit',
                  context:'Refund',
                  Extra:'Spots not filled', //To be changed in every match
                  tid:"RB"+time,
                  time:time,
                  To:'Winnings Amount',
                  From:null,
                  status:'success',
                  Amount: Entry,
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


exports.assignPoints = onDocumentWritten({document: "AllMatches/{MatchId}/LiveScores/LiveScores" },async (event) => {//
  console.log('aa')
  const helper = {
  '00':10,
  '11':12,'11LB':12,'11B':12,'11WD':6,'11NB':6,
  '22':15,'22LB':15,'22B':15,'22WD':8,'22NB':8,
  '33':18,'33LB':18,'33B':18,'33WD':9,'33NB':9,
  '44':22,'44LB':22,'44B':22,'44WD':11,'44NB':11,
  '55':25,'55LB':25,'55B':25,'55WD':13,'55NB':13,
  '66':30,'66LB':30,'66B':30,'66WD':15,'66NB':15,
  'WW':35,
  'WD1WD':30,'WD2WD':30,'WD3WD':30,'WD4WD':30,'WD5WD':30,'WD6WD':30,'WD7WD':30,
  'NB1NB':35,'NB2NB':35,'NB3NB':35,'NB4NB':35,'NB5NB':35,'NB6NB':35,'NB7NB':35,
  '0#0':20,
  '1#1':24,'1#1LB':24,'1#1B':24,'1#1WD':12,'1#1NB':12,
  '2#2':30,'2#2LB':30,'2#2B':30,'2#2WD':16,'2#2NB':16,
  '3#3':36,'3#3LB':36,'3#3B':36,'3#3WD':18,'3#3NB':18,
  '4#4':44,'4#4LB':44,'4#4B':44,'4#4WD':22,'4#4NB':22,
  '5#5':50,'5#5LB':50,'5#5B':50,'5#5WD':26,'5#5NB':26,
  '6#6':60,'6#6LB':60,'6#6B':60,'6#6WD':30,'6#6NB':30,
  'W#W':70,
  'WD#1WD':60,'WD#2WD':60,'WD#3WD':60,'WD#4WD':60,'WD#5WD':60,'WD#6WD':60,'WD#7WD':60,
  'NB#1NB':70,'NB#2NB':70,'NB#3NB':70,'NB#4NB':70,'NB#5NB':70,'NB#6NB':70,'NB#7NB':70,
  '0*0':15,
  '1*1':18,'1*1LB':18,'1*1B':18,'1*1WD':9,'1*1NB':9,
  '2*2':22.5,'2*2LB':22.5,'2*2B':22.5,'2*2WD':12,'2*2NB':12,
  '3*3':27,'3*3LB':27,'3*3B':27,'3*3WD':13.5,'3*3NB':13.5,
  '4*4':33,'4*4LB':33,'4*4B':33,'4*4WD':16.5,'4*4NB':16.5,
  '5*5':37.5,'5*5LB':37.5,'5*5B':37.5,'5*5WD':19.6,'5*5NB':19.6,
  '6*6':45,'6*6LB':45,'6*6B':45,'6*6WD':22.5,'6*6NB':22.5,
  'W*W':52.5,
  'WD*1WD':45,'WD*2WD':45,'WD*3WD':45,'WD*4WD':45,'WD*5WD':45,'WD*6WD':45,'WD*7WD':45,
  'NB*1NB':52.5,'NB*2NB':52.5,'NB*3NB':52.5,'NB*4NB':52.5,'NB*5NB':52.5,'NB*6NB':52.5,'NB*7NB':52.5,
  };
  const LiveScores = event.data.after.data();
  const length = Object.keys(LiveScores).length;
  const QuerySnapshot = await firestore.collection('AllMatches').doc('Match4').collection('4oversContests').where('Refunded', '!=', true).where('ContestStatus', '==', 'Live').get();//
  for (const documentSnapshot of QuerySnapshot.docs) {
    if (documentSnapshot.data().Overs <= length) {
      const LiveArray = LiveScores[documentSnapshot.data().Overs];
      const winnings = documentSnapshot.data().Winning;
      const lastWinningIndex = winnings[winnings.length - 1].End;
      const dbref = firestore.collection('AllMatches').doc('Match4').collection('4oversContests').doc(documentSnapshot.id.toString()).collection('Participants');//
      const QuerySnapshot = await dbref.get();
      const batch = firestore.batch();
      for (const documentSnap of QuerySnapshot.docs) {
        const SetName = documentSnap.data().SetNumber;
        const uid = documentSnap.data().uid;
        const documentShot = await firestore.collection('AllMatches').doc('Match4').collection('ParticipantsWithTheirSets').doc(uid).get();//
        const Set = documentShot.data()[SetName];
        const PointsArray = [];
        for (let i = 0; i < 6; i++) {
          const SetItem = Set[i];
          const LiveItem = LiveArray[i];
          for (let j = 0; j < Object.keys(LiveItem).length; j++) {
            if (SetItem[j] != LiveItem[j]) {
              PointsArray.push(0);
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



exports.assignPoints4 = onDocumentWritten({document: "AllMatches/Match4/LiveScores/LiveScores" },async (event) => {//
  console.log('aa')
  const helper = {
  '00':10,
  '11':12,'11LB':12,'11B':12,'11WD':6,'11NB':6,
  '22':15,'22LB':15,'22B':15,'22WD':8,'22NB':8,
  '33':18,'33LB':18,'33B':18,'33WD':9,'33NB':9,
  '44':22,'44LB':22,'44B':22,'44WD':11,'44NB':11,
  '55':25,'55LB':25,'55B':25,'55WD':13,'55NB':13,
  '66':30,'66LB':30,'66B':30,'66WD':15,'66NB':15,
  'WW':35,
  'WD1WD':30,'WD2WD':30,'WD3WD':30,'WD4WD':30,'WD5WD':30,'WD6WD':30,'WD7WD':30,
  'NB1NB':35,'NB2NB':35,'NB3NB':35,'NB4NB':35,'NB5NB':35,'NB6NB':35,'NB7NB':35,
  '0#0':20,
  '1#1':24,'1#1LB':24,'1#1B':24,'1#1WD':12,'1#1NB':12,
  '2#2':30,'2#2LB':30,'2#2B':30,'2#2WD':16,'2#2NB':16,
  '3#3':36,'3#3LB':36,'3#3B':36,'3#3WD':18,'3#3NB':18,
  '4#4':44,'4#4LB':44,'4#4B':44,'4#4WD':22,'4#4NB':22,
  '5#5':50,'5#5LB':50,'5#5B':50,'5#5WD':26,'5#5NB':26,
  '6#6':60,'6#6LB':60,'6#6B':60,'6#6WD':30,'6#6NB':30,
  'W#W':70,
  'WD#1WD':60,'WD#2WD':60,'WD#3WD':60,'WD#4WD':60,'WD#5WD':60,'WD#6WD':60,'WD#7WD':60,
  'NB#1NB':70,'NB#2NB':70,'NB#3NB':70,'NB#4NB':70,'NB#5NB':70,'NB#6NB':70,'NB#7NB':70,
  '0*0':15,
  '1*1':18,'1*1LB':18,'1*1B':18,'1*1WD':9,'1*1NB':9,
  '2*2':22.5,'2*2LB':22.5,'2*2B':22.5,'2*2WD':12,'2*2NB':12,
  '3*3':27,'3*3LB':27,'3*3B':27,'3*3WD':13.5,'3*3NB':13.5,
  '4*4':33,'4*4LB':33,'4*4B':33,'4*4WD':16.5,'4*4NB':16.5,
  '5*5':37.5,'5*5LB':37.5,'5*5B':37.5,'5*5WD':19.6,'5*5NB':19.6,
  '6*6':45,'6*6LB':45,'6*6B':45,'6*6WD':22.5,'6*6NB':22.5,
  'W*W':52.5,
  'WD*1WD':45,'WD*2WD':45,'WD*3WD':45,'WD*4WD':45,'WD*5WD':45,'WD*6WD':45,'WD*7WD':45,
  'NB*1NB':52.5,'NB*2NB':52.5,'NB*3NB':52.5,'NB*4NB':52.5,'NB*5NB':52.5,'NB*6NB':52.5,'NB*7NB':52.5,
  };
  const LiveScores = event.data.after.data();
  const length = Object.keys(LiveScores).length;
  const QuerySnapshot = await firestore.collection('AllMatches').doc('Match4').collection('4oversContests').where('Refunded', '!=', true).where('ContestStatus', '==', 'Live').get();//
  for (const documentSnapshot of QuerySnapshot.docs) {
    if (documentSnapshot.data().Overs <= length) {
      const LiveArray = LiveScores[documentSnapshot.data().Overs];
      const winnings = documentSnapshot.data().Winning;
      const lastWinningIndex = winnings[winnings.length - 1].End;
      const dbref = firestore.collection('AllMatches').doc('Match4').collection('4oversContests').doc(documentSnapshot.id.toString()).collection('Participants');//
      const QuerySnapshot = await dbref.get();
      const batch = firestore.batch();
      for (const documentSnap of QuerySnapshot.docs) {
        const SetName = documentSnap.data().SetNumber;
        const uid = documentSnap.data().uid;
        const documentShot = await firestore.collection('AllMatches').doc('Match4').collection('ParticipantsWithTheirSets').doc(uid).get();//
        const Set = documentShot.data()[SetName];
        const PointsArray = [];
        for (let i = 0; i < 6; i++) {
          const SetItem = Set[i];
          const LiveItem = LiveArray[i];
          for (let j = 0; j < Object.keys(LiveItem).length; j++) {
            if (SetItem[j] != LiveItem[j]) {
              PointsArray.push(0);
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

exports.assignWonAmount = onDocumentWritten({document:"AllMatches/Match1"},async (event)=> {
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


exports.distributeWonAmount = onDocumentWritten( "Distribution/{Match1}", async (event) => {//
  const batch = firestore.batch();
  const contestsRef = firestore.collection('AllMatches').doc('Match1').collection('4oversContests');
  const usersRef = firestore.collection('users');
  try {
    const contestsSnapshot = await contestsRef.where('Refunded', '!=', true).get();
    contestsSnapshot.forEach(async (contestDoc) => {
      const contestId = contestDoc.id;
      const participantsRef = contestsRef.doc(contestId).collection('Participants');
      const contestWinnersSnapshot = await participantsRef.where('WinningAmount', '!=', null).get();
      contestWinnersSnapshot.forEach((winnerDoc) => {
        const winnerData = winnerDoc.data();
        const uid = winnerData.uid;
        const winningAmount = winnerData.WinningAmount;
        // Update user's winning amount and add transaction to batch
        const userRef = usersRef.doc(uid);
        batch.update(userRef, {
          WinningAmount: FieldValue.increment(winningAmount),
          Transactions: FieldValue.arrayUnion({
            type: 'Deposit',
            context: 'Winning',
            Extra: 'Won in CSK vs RCB',//
            tid: "WN" + winnerDoc.id,
            time: FieldValue.serverTimestamp(),
            To: 'Winning Amount',
            From: null,
            status: 'success',
            Amount: '₹' + winningAmount,
          })
        });
      });
    });
    await batch.commit();
  } catch (error) {console.error('Error distributing winning amounts:', error);}
});


exports.ContestParticipationNewUserAskForSet = onCall(async (request)=>{
  try{
    const {uid, Name, ProfileImage, MatchId, MatchKey, SetName, TeamCode1, TeamCode2} = request.data;
    const dbref = firestore.collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey);
    const documentSnap = await dbref.get();
    if(documentSnap.data().ContestStatus!='Upcoming') return "Status";
    if (documentSnap.data().FilledSpots + SetName.length > documentSnap.data().MaximumSpots) return "Spots";
    const dref = firestore.collection('users').doc(uid).collection('MyContests').doc(MatchId);
    const def = firestore.collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets');
    const db = firestore.collection('users').doc(uid);
    const time = new Date().getTime();
    const Transactions = [{
      type:'Debit',
      context:'Entry Paid',
      Extra:`${TeamCode1} vs ${TeamCode2}`,
      tid:"FCP"+time,
      time:time,
      To:null,
      From:"Wallet",
      status:'success',
      Amount: 'Free ',
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

exports.ContestParticipationOldUserJZeroAskForSet = onCall( async (request) => {
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
    const time = new Date().getTime();
    const Transactions = [{
      type:'Debit',
      context:'Entry Paid',
      Extra:`${TeamCode1} vs ${TeamCode2}`,
      tid:"CP"+time,
      time:time,
      To:null,
      From:"Wallet",
      status:'success',
      Amount: `₹${MoneyToBeDeducted}${DBCashBonusUsable !== 0 ? ` + ${DBCashBonusUsable}` : ''}`,
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

exports.ContestParticipationNewUser = onCall(async (request)=>{
  try{
    const {uid, Name, ProfileImage, MatchId, MatchKey, UniqueSetNumber, selectedScores, TeamCode1, TeamCode2} = request.data;
    const db = firestore.collection('users').doc(uid);
    const dbref = firestore.collection('AllMatches').doc(MatchId).collection('4oversContests').doc(MatchKey);
    const documentSnap = await dbref.get();
    if(documentSnap.data().ContestStatus!='Upcoming') return "Status";
    if(documentSnap.data().FilledSpots+1 > documentSnap.data().MaximumSpots) return "Spots";
    const dref = firestore.collection('users').doc(uid).collection('MyContests').doc(MatchId);
    const def = firestore.collection('AllMatches').doc(MatchId).collection('ParticipantsWithTheirSets');
    const time = new Date().getTime();
    const Transactions = [{
      type:'Debit',
      context:'Entry Paid',
      Extra:`${TeamCode1} vs ${TeamCode2}`,
      tid:"FCP"+time,
      time:time,
      To:null,
      From:"Wallet",
      status:'success',
      Amount: 'Free ', 
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

exports.ContestParticipationOldUserJZero = onCall(async (request) => {
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
    const time = new Date().getTime();
    const Transactions = [{
      type:'Debit',
      context:'Entry Paid',
      Extra:`${TeamCode1} vs ${TeamCode2}`,
      tid:"CP"+time,
      time:time,
      To:null,
      From:"Wallet",
      status:'success',
      Amount: `₹${MoneyToBeDeducted}${DBCashBonusUsable !== 0 ? ` + ${DBCashBonusUsable}` : ''}`,
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


// exports.distributeWonAmount = onDocumentWritten("Distribution/{Match1}",async (event)=>{//
//   const dbref = firestore.collection('AllMatches').doc('Match1').collection('4oversContests');
//   const db = firestore.collection('users');
//   await dbref.where('Refunded','!=',true).get().then(QuerySnapshot=>{//
//     QuerySnapshot.forEach(async documentSnapshot=>{
//       // if(documentSnapshot.id == '4Contest1' || documentSnapshot.id == '4Contest2'){//
//         let time = new Date().getTime();
//         await dbref.doc(documentSnapshot.id.toString()).collection('Participants').where('WinningAmount','!=',null).get().then(QuerySnapshot=>{//
//           QuerySnapshot.forEach(async documentSnapshot => {
//             const WinningAmount = documentSnapshot.data().WinningAmount;
//             await db.doc(documentSnapshot.data().uid).update({
//               WinningAmount:FieldValue.increment(+WinningAmount),
//               Transactions: FieldValue.arrayUnion({
//                 type:'Deposit',
//                 context:'Winning',
//                 Extra:'Won in CSK vs RCB',
//                 tid:"WN"+time,
//                 time:time,
//                 To:'Winning Amount',
//                 From:null,
//                 status:'success',
//                 Amount: '₹' + WinningAmount,
//               }),
//             })
//           })
//         })
//       // }//
//     })
//   })
// })

exports.DeployContests = onDocumentWritten({document:"DeployContests/{Deploy}"},async (event)=>{
  const matchesData = [
    {
      LeagueName: 'Chennai Super Kings vs Royal Challengers Bengaluru',
      MatchId: 'Match1',
      MatchTime: new Date('2024-03-22T20:00:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Chennai Super Kings',
      Team2: 'Royal Challengers Bengaluru',
      TeamCode1: 'CSK',
      TeamCode2: 'RCB',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/chennai-super-kings.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/royal-challengers-bangalore.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Punjab Kings vs Delhi Capitals',
      MatchId: 'Match2',
      MatchTime: new Date('2024-03-23T15:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Punjab Kings',
      Team2: 'Delhi Capitals',
      TeamCode1: 'PBKS',
      TeamCode2: 'DC',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/kings-xi-punjab.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/delhi-daredevils.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Kolkata Knight Riders vs Sunrisers Hyderabad',
      MatchId: 'Match3',
      MatchTime: new Date('2024-03-23T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Kolkata Knight Riders',
      Team2: 'Sunrisers Hyderabad',
      TeamCode1: 'KKR',
      TeamCode2: 'SRH',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/kolkata-knight-riders.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/sunrisers-hyderabad.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Rajasthan Royals vs Lucknow Super Giants',
      MatchId: 'Match4',
      MatchTime: new Date('2024-03-24T15:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Rajasthan Royals',
      Team2: 'Lucknow Super Giants',
      TeamCode1: 'RR',
      TeamCode2: 'LSG',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/rajasthan-royals.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/lucknow-super-giants.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Gujarat Titans vs Mumbai Indians',
      MatchId: 'Match5',
      MatchTime: new Date('2024-03-24T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Gujarat',
      Team2: 'Mumbai',
      TeamCode1: 'GT',
      TeamCode2: 'MI',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/gujarat-titans.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/mumbai-indians.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Royal Challengers Bengaluru vs Punjab Kings',
      MatchId: 'Match6',
      MatchTime: new Date('2024-03-25T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Bengaluru',
      Team2: 'Punjab',
      TeamCode1: 'RCB',
      TeamCode2: 'PBKS',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/royal-challengers-bangalore.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/kings-xi-punjab.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Chennai Super Kings vs Gujarat Titans',
      MatchId: 'Match7',
      MatchTime: new Date('2024-03-26T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Chennai',
      Team2: 'Gujarat',
      TeamCode1: 'CSK',
      TeamCode2: 'GT',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/chennai-super-kings.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/gujarat-titans.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Sunrisers Hyderabad vs Mumbai Indians',
      MatchId: 'Match8',
      MatchTime: new Date('2024-03-27T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Hyderabad',
      Team2: 'Mumbai',
      TeamCode1: 'SRH',
      TeamCode2: 'MI',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/sunrisers-hyderabad.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/mumbai-indians.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Rajasthan Royals vs Delhi Capitals',
      MatchId: 'Match9',
      MatchTime: new Date('2024-03-28T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Rajasthan Royals',
      Team2: 'Delhi Capitals',
      TeamCode1: 'RR',
      TeamCode2: 'DC',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/rajasthan-royals.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/delhi-daredevils.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Royal Challengers Bengaluru vs Kolkata Knight Riders',
      MatchId: 'Match10',
      MatchTime: new Date('2024-03-29T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Bengaluru',
      Team2: 'Kolkata Knight Riders',
      TeamCode1: 'RCB',
      TeamCode2: 'KKR',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/royal-challengers-bangalore.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/kolkata-knight-riders.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Lucknow Super Giants vs Punjab Kings',
      MatchId: 'Match11',
      MatchTime: new Date('2024-03-30T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Lucknow Super Giants',
      Team2: 'Punjab Kings',
      TeamCode1: 'LSG',
      TeamCode2: 'PBKS',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/lucknow-super-giants.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/kings-xi-punjab.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Gujarat Titans vs Sunrisers Hyderabad',
      MatchId: 'Match12',
      MatchTime: new Date('2024-03-31T15:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Gujarat Titans',
      Team2: 'Sunrisers Hyderabad',
      TeamCode1: 'GT',
      TeamCode2: 'SRH',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/gujarat-titans.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/sunrisers-hyderabad.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Delhi Capitals vs Chennai Super Kings',
      MatchId: 'Match13',
      MatchTime: new Date('2024-03-31T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Delhi Capitals',
      Team2: 'Chennai Super Kings',
      TeamCode1: 'DC',
      TeamCode2: 'CSK',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/delhi-daredevils.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/chennai-super-kings.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Mumbai Indians vs Rajasthan Royals',
      MatchId: 'Match14',
      MatchTime: new Date('2024-04-01T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Mumbai Indians',
      Team2: 'Rajasthan Royals',
      TeamCode1: 'MI',
      TeamCode2: 'RR',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/mumbai-indians.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/rajasthan-royals.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Royal Challengers Bengaluru vs Lucknow Super Giants',
      MatchId: 'Match15',
      MatchTime: new Date('2024-04-02T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Royal Challengers Bengaluru',
      Team2: 'Lucknow Super Giants',
      TeamCode1: 'RCB',
      TeamCode2: 'LSG',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/royal-challengers-bangalore.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/lucknow-super-giants.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Delhi Capitals vs Kolkata Knight Riders',
      MatchId: 'Match16',
      MatchTime: new Date('2024-04-03T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Delhi Capitals',
      Team2: 'Kolkata Knight Riders',
      TeamCode1: 'DC',
      TeamCode2: 'KKR',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/delhi-daredevils.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/kolkata-knight-riders.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Gujarat Titans vs Punjab Kings',
      MatchId: 'Match17',
      MatchTime: new Date('2024-04-04T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Gujarat Titans',
      Team2: 'Punjab Kings',
      TeamCode1: 'GT',
      TeamCode2: 'PBKS',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/gujarat-titans.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/kings-xi-punjab.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Sunrisers Hyderabad vs Chennai Super Kings',
      MatchId: 'Match18',
      MatchTime: new Date('2024-04-05T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Sunrisers Hyderabad',
      Team2: 'Chennai Super Kings',
      TeamCode1: 'SRH',
      TeamCode2: 'CSK',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/sunrisers-hyderabad.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/chennai-super-kings.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Rajasthan Royals vs Royal Challengers Bengaluru',
      MatchId: 'Match19',
      MatchTime: new Date('2024-04-06T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Rajasthan Royals',
      Team2: 'Royal Challengers Bengaluru',
      TeamCode1: 'RR',
      TeamCode2: 'RCB',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/rajasthan-royals.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/royal-challengers-bangalore.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Mumbai Indians vs Delhi Capitals',
      MatchId: 'Match20',
      MatchTime: new Date('2024-04-07T15:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Mumbai Indians',
      Team2: 'Delhi Capitals',
      TeamCode1: 'MI',
      TeamCode2: 'DC',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/mumbai-indians.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/delhi-daredevils.png?w=108',
      OpenToParticipate: true
    },
    {
      LeagueName: 'Lucknow Super Giants vs Gujarat Titans',
      MatchId: 'Match21',
      MatchTime: new Date('2024-04-07T19:30:00+05:30'), // Add the appropriate timestamp here
      MegaPrize: '5 Lakhs',
      Status: 'Upcoming',
      Team1: 'Lucknow Super Giants',
      Team2: 'Gujarat Titans',
      TeamCode1: 'LSG',
      TeamCode2: 'GT',
      Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/lucknow-super-giants.png?w=108',
      Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/gujarat-titans.png?w=108',
      OpenToParticipate: true
    }
  ];
  // const matchesData= [
  //   {
  //     LeagueName: 'Chennai Super Kings vs Royal Challengers Bengaluru',
  //     MatchId: 'Match1',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Chennai',
  //     Team2: 'Bengaluru',
  //     TeamCode1: 'CSK',
  //     TeamCode2: 'RCB',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/chennai-super-kings.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/royal-challengers-bangalore.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Punjab Kings vs Delhi Capitals',
  //     MatchId: 'Match2',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Punjab',
  //     Team2: 'Delhi',
  //     TeamCode1: 'PBKS',
  //     TeamCode2: 'DC',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/kings-xi-punjab.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/delhi-daredevils.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Kolkata Knight Riders vs Sunrisers Hyderabad',
  //     MatchId: 'Match3',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Kolkata Knight Riders',
  //     Team2: 'Sunrisers Hyderabad',
  //     TeamCode1: 'KKR',
  //     TeamCode2: 'SRH',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/kolkata-knight-riders.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/sunrisers-hyderabad.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Rajasthan Royals vs Lucknow Super Giants',
  //     MatchId: 'Match4',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Rajasthan Royals',
  //     Team2: 'Lucknow Super Giants',
  //     TeamCode1: 'RR',
  //     TeamCode2: 'LSG',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/rajasthan-royals.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/lucknow-super-giants.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Gujarat Titans vs Mumbai Indians',
  //     MatchId: 'Match5',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Gujarat',
  //     Team2: 'Mumbai',
  //     TeamCode1: 'GT',
  //     TeamCode2: 'MI',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/gujarat-titans.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/mumbai-indians.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Royal Challengers Bengaluru vs Punjab Kings',
  //     MatchId: 'Match6',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Bengaluru',
  //     Team2: 'Punjab',
  //     TeamCode1: 'RCB',
  //     TeamCode2: 'PBKS',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/royal-challengers-bangalore.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/kings-xi-punjab.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Chennai Super Kings vs Gujarat Titans',
  //     MatchId: 'Match7',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Chennai',
  //     Team2: 'Gujarat',
  //     TeamCode1: 'CSK',
  //     TeamCode2: 'GT',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/chennai-super-kings.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/gujarat-titans.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Sunrisers Hyderabad vs Mumbai Indians',
  //     MatchId: 'Match8',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Hyderabad',
  //     Team2: 'Mumbai',
  //     TeamCode1: 'SRH',
  //     TeamCode2: 'MI',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/sunrisers-hyderabad.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/mumbai-indians.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Rajasthan Royals vs Delhi Capitals',
  //     MatchId: 'Match9',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Rajasthan',
  //     Team2: 'Delhi',
  //     TeamCode1: 'RR',
  //     TeamCode2: 'DC',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/rajasthan-royals.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/delhi-daredevils.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Royal Challengers Bengaluru vs Kolkata Knight Riders',
  //     MatchId: 'Match10',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Bengaluru',
  //     Team2: 'Kolkata Knight Riders',
  //     TeamCode1: 'RCB',
  //     TeamCode2: 'KKR',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/royal-challengers-bangalore.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/kolkata-knight-riders.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Lucknow Super Giants vs Punjab Kings',
  //     MatchId: 'Match11',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Lucknow',
  //     Team2: 'Punjab',
  //     TeamCode1: 'LSG',
  //     TeamCode2: 'PBKS',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/lucknow-super-giants.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/kings-xi-punjab.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Gujarat Titans vs Sunrisers Hyderabad',
  //     MatchId: 'Match12',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Gujarat',
  //     Team2: 'Hyderabad',
  //     TeamCode1: 'GT',
  //     TeamCode2: 'SRH',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/gujarat-titans.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/sunrisers-hyderabad.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Delhi Capitals vs Chennai Super Kings',
  //     MatchId: 'Match13',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Delhi',
  //     Team2: 'Chennai',
  //     TeamCode1: 'DC',
  //     TeamCode2: 'CSK',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/delhi-daredevils.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/chennai-super-kings.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Mumbai Indians vs Rajasthan Royals',
  //     MatchId: 'Match14',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Mumbai',
  //     Team2: 'Rajasthan',
  //     TeamCode1: 'MI',
  //     TeamCode2: 'RR',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/mumbai-indians.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/rajasthan-royals.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Royal Challengers Bengaluru vs Lucknow Super Giants',
  //     MatchId: 'Match15',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Bengaluru',
  //     Team2: 'Lucknow',
  //     TeamCode1: 'RCB',
  //     TeamCode2: 'LSG',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/royal-challengers-bangalore.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/lucknow-super-giants.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Delhi Capitals vs Kolkata Knight Riders',
  //     MatchId: 'Match16',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Delhi',
  //     Team2: 'Kolkata Knight Riders',
  //     TeamCode1: 'DC',
  //     TeamCode2: 'KKR',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/delhi-daredevils.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/kolkata-knight-riders.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Gujarat Titans vs Punjab Kings',
  //     MatchId: 'Match17',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Gujarat',
  //     Team2: 'Punjab',
  //     TeamCode1: 'GT',
  //     TeamCode2: 'PBKS',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/gujarat-titans.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/kings-xi-punjab.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Sunrisers Hyderabad vs Chennai Super Kings',
  //     MatchId: 'Match18',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Hyderabad',
  //     Team2: 'Chennai',
  //     TeamCode1: 'SRH',
  //     TeamCode2: 'CSK',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/sunrisers-hyderabad.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/chennai-super-kings.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Rajasthan Royals vs Royal Challengers Bengaluru',
  //     MatchId: 'Match19',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Rajasthan',
  //     Team2: 'Bengaluru',
  //     TeamCode1: 'RR',
  //     TeamCode2: 'RCB',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/rajasthan-royals.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/royal-challengers-bangalore.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Mumbai Indians vs Delhi Capitals',
  //     MatchId: 'Match20',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Mumbai',
  //     Team2: 'Delhi',
  //     TeamCode1: 'MI',
  //     TeamCode2: 'DC',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/mumbai-indians.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/delhi-daredevils.png?w=108',
  //     OpenToParticipate: true
  //   },
  //   {
  //     LeagueName: 'Lucknow Super Giants vs Gujarat Titans',
  //     MatchId: 'Match21',
  //     MatchTime: '',
  //     MegaPrize: '5 Lakhs',
  //     Status: 'Upcoming',
  //     Team1: 'Lucknow',
  //     Team2: 'Gujarat',
  //     TeamCode1: 'LSG',
  //     TeamCode2: 'GT',
  //     Image1: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/lucknow-super-giants.png?w=108',
  //     Image2: 'https://staticg.sportskeeda.com/skm/assets/team-logos/cricket/gujarat-titans.png?w=108',
  //     OpenToParticipate: true
  //   }
  // ]
  matchesData.forEach(item=>{
    firestore.collection('AllMatches').doc(item.MatchId).set(item)
  })
})

 
// exports.DeployContests = onDocumentWritten({document:"DeployContests/{Deploy}"}, async (event) => {
//   const documents = [
//     //##### MEGA CONTEST #######################################################################################################################
//     {
//     ContestStatus:'Upcoming',
//     DocumentId: "4Contest1",
//     Entry: "₹30",
//     FilledSpots: 0 ,
//     FirstPosition: "4000",
//     Inning:1,
//     MaximumSpots: 2200 ,
//     Overs:1,
//     PrizePool: "50000",
//     Refunded:false,
//     Type: "Mega Contest",
//     WinnersPercentage: "58%" ,
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
//     Inning:1,
//     MaximumSpots: 13333 ,
//     PrizePool: "10000",
//     Type: "Mega Contest",
//     WinnersPercentage: "260 Winners" ,
//     Overs:1,
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
//     Inning:2,
//     MaximumSpots: 350 ,
//     PrizePool: "1500",
//     Type: "Trending Now",
//     WinnersPercentage: "5 Winners" ,
//     Overs:2,
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
//     Inning:2,
//     MaximumSpots: 140 ,
//     PrizePool: "3000",
//     Type: "Trending Now",
//     WinnersPercentage: "46%" ,
//     Overs:4,
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
//     Inning:2,
//     MaximumSpots: 20 ,
//     PrizePool: "400",
//     Type: "Trending Now",
//     WinnersPercentage: "50%" ,
//     Overs:5,
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
//     Inning:1,
//     MaximumSpots: 25 ,
//     PrizePool: "160",
//     Type: "Trending Now",
//     WinnersPercentage: "28%" ,
//     Overs:8,
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
//     Inning:2,
//     MaximumSpots: 10 ,
//     PrizePool: "130",
//     Type: "Trending Now",
//     WinnersPercentage: "50%" ,
//     Overs:9,
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
//     Inning:1,
//     MaximumSpots: 4,
//     PrizePool: "44",
//     Type: "Trending Now",
//     WinnersPercentage: "1 Winner" ,
//     Overs:1,
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
//     Inning:1,
//     MaximumSpots: 1500,
//     PrizePool: "21,600",
//     Type: "Trending Now",
//     WinnersPercentage: "270 Winners" ,
//     Overs:10,
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
//     Inning:3,
//     MaximumSpots: 1577,
//     PrizePool: "31,540",
//     Type: "Trending Now",
//     WinnersPercentage: "1020 Winners" ,
//     Overs:23,
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
//     Inning:2,
//     MaximumSpots: 100 ,
//     PrizePool: "1000",
//     Type: "Only For Beginners",
//     WinnersPercentage: "42%" ,
//     Overs:12,
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
//     Inning:2,
//     MaximumSpots: 3,
//     PrizePool: "44",
//     Type: "Only For Beginners",
//     WinnersPercentage: "1 Winner" ,
//     Overs:44,
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
//     Inning:1,
//     MaximumSpots: 2 ,
//     PrizePool: "10000",
//     Type: "High Entry=High Rewards",
//     WinnersPercentage: "1 Winner" ,
//     Overs:9,
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
//     Inning:1,
//     MaximumSpots: 4 ,
//     PrizePool: "10000",
//     Type: "High Entry=High Rewards",
//     WinnersPercentage: "1 Winner" ,
//     Overs:6,
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
//     Inning:2,
//     MaximumSpots: 4 ,
//     PrizePool: "10000",
//     Type: "High Entry=High Rewards",
//     WinnersPercentage: "1 Winner" ,
//     Overs:1,
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
//     Inning:2,
//     MaximumSpots: 3 ,
//     PrizePool: "10000",
//     Type: "High Entry=High Rewards",
//     WinnersPercentage: "1 Winner" ,
//     Overs:20,
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
//     Inning:2,
//     MaximumSpots: 4 ,
//     PrizePool: "6000",
//     Type: "High Entry=High Rewards",
//     WinnersPercentage: "1 Winner" ,
//     Overs:2,
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
//     Inning:1,
//     MaximumSpots: 2,
//     PrizePool: "19",
//     Type: "Head To Head",
//     WinnersPercentage: "1 Winner" ,
//     Overs:2,
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
//     Inning:2,
//     MaximumSpots: 2,
//     PrizePool: "27",
//     Type: "Head To Head",
//     WinnersPercentage: "1 Winner" ,
//     Overs:5,
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
//     Inning:1,
//     MaximumSpots: 2,
//     PrizePool: "27",
//     Type: "Head To Head",
//     WinnersPercentage: "1 Winner" ,
//     Overs:1,
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
//     Inning:2,
//     MaximumSpots: 2,
//     PrizePool: "135",
//     Type: "Head To Head",
//     WinnersPercentage: "1 Winner" ,
//     Overs:16,
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
//     Inning:2,
//     MaximumSpots: 2,
//     PrizePool: "290",
//     Type: "Head To Head",
//     WinnersPercentage: "1 Winner" ,
//     Overs:19,
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
//     Inning:1,
//     MaximumSpots: 3,
//     PrizePool: "600",
//     Type: "Winner Takes All",
//     WinnersPercentage: "1 Winner" ,
//     Overs:7,
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
//     Inning:1,
//     MaximumSpots: 4,
//     PrizePool: "179",
//     Type: "Winner Takes All",
//     WinnersPercentage: "1 Winner" ,
//     Overs:4,
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
//     Inning:1,
//     MaximumSpots: 4,
//     PrizePool: "1500",
//     Type: "Winner Takes All",
//     WinnersPercentage: "1 Winner" ,
//     Overs:3,
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
//     Inning:1,
//     MaximumSpots: 4,
//     PrizePool: "20",
//     Type: "Winner Takes All",
//     WinnersPercentage: "1 Winner" ,
//     Overs:12,
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
//     Inning:2,
//     MaximumSpots: 3,
//     PrizePool: "90",
//     Type: "Winner Takes All",
//     WinnersPercentage: "1 Winner" ,
//     Overs:11,
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
//     Inning:2,
//     MaximumSpots: 50,
//     PrizePool: "140",
//     Type: "Winner Takes All",
//     WinnersPercentage: "1 Winner" ,
//     Overs:9,
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
//     Inning:1,
//     MaximumSpots: 2000,
//     PrizePool: "1800",
//     Type: "Low Entry Contests",
//     WinnersPercentage: "5 Winners" ,
//     Overs:6,
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
//     Inning:1,
//     MaximumSpots: 500,
//     PrizePool: "900",
//     Type: "Low Entry Contests",
//     WinnersPercentage: "5 Winners" ,
//     Overs:2,
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
//     Inning:2,
//     MaximumSpots: 200,
//     PrizePool: "900",
//     Type: "Low Entry Contests",
//     WinnersPercentage: "5 Winners" ,
//     Overs:13,
//     Refunded:false,
//     Winning:[
//       {End: 1,PrizeMoney: 500,Spot: "1",Start: 1 },
//       {End: 5,PrizeMoney: 100,Spot: "2-5",Start: 2 },
//     ]
//   }]

//   const matchIds = ['Match1', 'Match2', 'Match3', 'Match4', 'Match5', 'Match6', 'Match7', 'Match8', 'Match9', 'Match10'];

//   const batch = firestore.batch();

//   // return await firestore.collection('AllMatches').doc('Match1').collection('4oversContests').get().then(QuerySnapshot=>{
//   //   const min = 1;
//   //   const max = 50;
//   //   QuerySnapshot.forEach(documentSnapshot=>{
//   //     documentSnapshot.ref.set({
//   //       Overs:Math.floor(Math.random() * (max - min + 1)) + min,
//   //       ContestStatus:'Upcoming'
//   //     },{merge:true})
//   //   })
//   // })
  
//   matchIds.forEach(matchId => {
//     documents.forEach(doc => {
//       const contestRef = firestore.collection('AllMatches').doc(matchId).collection('4oversContests').doc(doc.DocumentId);
//       batch.set(contestRef, doc);
//     });
//   });

//   await batch.commit();
// });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request.data, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
















// exports.VpaValidate = onCall(async(request)=>{
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
  
//   exports.TransactionViaUpi = onCall( async (request) => {
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
  
  
  
//   exports.TransactionUpiIntent = onCall( async (request) => {
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



// exports.callbackResponse = onRequest(async (req, res) => {
//   const amount = req.query.amount;
//   if (req.method === 'POST') {
//     const jsonResponse = JSON.parse(Buffer.from(req.body.response, 'base64').toString('utf-8'));
//     if (jsonResponse.code === 'PAYMENT_SUCCESS') {
//       const time = new Date();
//       const financialYear = time.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1; 
//       await firestore.collection('users').doc(req.query.uid).update({
//         AddedAmount:FieldValue.increment(jsonResponse.data.amount/100),
//         Transactions:FieldValue.arrayUnion({
//           type:'Deposit',
//           context:'Deposit',
//           Extra:null,
//           tid:req.query.tid,
//           time:time.getTime(),
//           To:'Added Amount',
//           From:null,
//           status:'success',
//           Amount: amount
//         })
//       })
//       const db = firestore.collection('users').doc(req.query.uid).collection(`FinancialYear${financialYear}`).doc('Deposits');
//       await db.update({
//         DepositsAggregate:FieldValue.increment(amount)
//       })
//       await db.collection('Deposits Details').doc(req.query.tid).set({
//         time:time.getTime(),
//         Amount:amount,
//         tid:req.query.tid
//       })
//       res.status(200).send('Payment success');
//     }
//     else if(jsonResponse.code){
//       await firestore.collection('users').doc(req.query.uid).update({
//         Transactions:FieldValue.arrayUnion({
//           type:'Deposit',
//           context:'Deposit',
//           Extra:null,
//           tid:req.query.tid,
//           time:new Date().getTime(),
//           To:'Added Amount',
//           From:null,
//           status:'failed',
//           Amount: amount
//         })
//       })
//       res.status(200).send('Payment Hold (Failed)');
//     }
//     else res.status(400).send('Bad Request');
//   } 
//   else res.status(405).send('Method Not Allowed');
// });