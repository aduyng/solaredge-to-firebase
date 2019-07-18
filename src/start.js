const moment = require("moment");
const request = require("request-promise");
const { attempt, isError, get, filter, map, sumBy } = require("lodash");
const saveToFirestore = require("./saveToFirestore");

module.exports = async () => {
  const executionStarted = moment();
  const consoleLabel = executionStarted.toString();
  console.time(consoleLabel);
  const today = moment();
  const url = `${process.env.SOLAREDGE_API_BASE_URL}site/${process.env.SOLAREDGE_SITE_ID}/power`;
  const startTime = today.format("YYYY-MM-DD") + " 00:00:00";
  const endTime = today.format("YYYY-MM-DD") + " 23:59:59";
  const qs = {
    startTime,
    endTime,
    // eslint-disable-next-line camelcase
    api_key: process.env.SOLAREDGE_API_KEY,
    format: "json"
  };

  const response = await request({ url, qs });

  const json = attempt(JSON.parse, response);
  const values = get(json, "power.values");
  const entries = filter(values, value => value.value > 0);
  const fifteenMinuteReads = map(entries, entry => ({
    timestamp: moment(entry.date),
    value: entry.value / 1000
  }));
  const total = sumBy(fifteenMinuteReads, "value");
  console.log("fifteenMinuteReads", fifteenMinuteReads);
  await saveToFirestore({
    dailyGenerationReads: { fifteenMinuteReads, total, date: today }
  });
  console.log("updated to firestore");
  console.timeEnd(consoleLabel);
  return true;
};
