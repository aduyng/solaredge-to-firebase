const moment = require("moment");
const crawl = require("./crawl");
const saveToFirestore = require("./saveToFirestore");

module.exports = async () => {
  const executionStarted = moment();
  const consoleLabel = executionStarted.toString();
  console.time(consoleLabel);
  const dailyUsage = await crawl(process.env);
  console.log("daily usage:", dailyUsage);
  await saveToFirestore({ dailyUsage });
  console.log("updated to firestore");
  console.timeEnd(consoleLabel);
  return true;
};
