const firebase = require("./firebase");

module.exports = async ({ dailyUsage }) => {
  const db = firebase.firestore();

  const batch = db.batch();
  const dailyRef = db
    .collection(process.env.FIREBASE_DAYLY_USAGE_COLLECTION_NAME)
    .doc(dailyUsage.date.format("YYYYMMDD"));
  batch.set(dailyRef, {
    timestamp: dailyUsage.date.valueOf(),
    date: dailyUsage.date.toDate(),
    meterRead: dailyUsage.meterRead,
    readAt: new Date()
  });

  dailyUsage.fifteenMinuteReads.forEach(fifteenMinuteRead => {
    const fifteenMinuteRef = dailyRef
      .collection(process.env.FIREBASE_FIFTEEN_MINUTE_READ_COLLECTION_NAME)
      .doc(fifteenMinuteRead.timestamp.format("YYYYMMDDHHmm"));
    batch.set(fifteenMinuteRef, {
      timestamp: fifteenMinuteRead.timestamp.valueOf(),
      date: fifteenMinuteRead.timestamp.toDate(),
      consumption: fifteenMinuteRead.consumption,
      generation: fifteenMinuteRead.generation
    });
  });

  return batch.commit();
};
