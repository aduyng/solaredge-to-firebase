const firebase = require("./firebase");

module.exports = async ({ dailyGenerationReads }) => {
  const db = firebase.firestore();

  const batch = db.batch();
  const dailyRef = db
    .collection(process.env.FIREBASE_DAYLY_USAGE_COLLECTION_NAME)
    .doc(dailyGenerationReads.date.format("YYYYMMDD"));
  batch.set(dailyRef, {
    timestamp: dailyGenerationReads.date.valueOf(),
    date: dailyGenerationReads.date.toDate(),
    total: dailyGenerationReads.total,
    readAt: new Date()
  });

  dailyGenerationReads.fifteenMinuteReads.forEach(fifteenMinuteRead => {
    const fifteenMinuteRef = dailyRef
      .collection(process.env.FIREBASE_FIFTEEN_MINUTE_READ_COLLECTION_NAME)
      .doc(fifteenMinuteRead.timestamp.format("YYYYMMDDHHmm"));
    batch.set(fifteenMinuteRef, {
      timestamp: fifteenMinuteRead.timestamp.valueOf(),
      date: fifteenMinuteRead.timestamp.toDate(),
      generation: fifteenMinuteRead.value
    });
  });

  return batch.commit();
};
