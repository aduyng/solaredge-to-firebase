const puppeteer = require("puppeteer");
const moment = require("moment");
const signIn = require("./signIn");

module.exports = async ({
  SMART_METER_TEXAS_LOGIN_PAGE = "https://www.smartmetertexas.com/smt/tPartyAgreementsLogin/public/smt_login.jsp",
  SMART_METER_TEXAS_USERNAME,
  SMART_METER_TEXAS_PASSWORD,
  NODE_ENV
}) => {
  try {
    const browser = await puppeteer.launch({
      headless: NODE_ENV !== "development",
      devtools: NODE_ENV === "development",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    console.log("browser instance has been created");
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36"
    );
    await page.setViewport({ width: 1024, height: 768 });
    console.log("browser page has been created");
    await signIn({
      page,
      SMART_METER_TEXAS_LOGIN_PAGE,
      SMART_METER_TEXAS_USERNAME,
      SMART_METER_TEXAS_PASSWORD
    });

    const latestEndOfDateReadSpan = await page.$('[name="ler_date"]');
    const dateRead = await (await latestEndOfDateReadSpan.getProperty(
      "innerText"
    )).jsonValue();
    const dateReadValue = moment(dateRead, "MM/DD/YYYY");

    const latestEndOfDateMeterReadSpan = await page.$('[name="ler_read"]');
    const meterRead = parseFloat(
      await (await latestEndOfDateMeterReadSpan.getProperty(
        "innerText"
      )).jsonValue()
    );
    console.log(`meterRead ${meterRead}`);

    const dateInfo = {
      meterRead,
      date: dateReadValue,
      fifteenMinuteReads: []
    };

    const detailRowsNodeList = await page.$$(
      'tr[name="DataContainer"][class^="TCP_Row"]'
    );
    for (var row of detailRowsNodeList) {
      const [
        ignoredFromSpan,
        toSpan,
        consumptionSpan,
        typeSpan,
        generationSpan
      ] = await row.$$('[name="ColumnData"]>span');

      const to = moment(
        await (await toSpan.getProperty("innerText")).jsonValue(),
        "hh:mm a"
      );
      console.log(`to ${to.format("HHmm")}`);

      const consumption = parseFloat(
        await (await consumptionSpan.getProperty("innerText")).jsonValue()
      );
      console.log(`usage ${consumption}`);

      const generation = parseFloat(
        await (await generationSpan.getProperty("innerText")).jsonValue()
      );
      console.log(`usage ${generation}`);

      const type = await (await typeSpan.getProperty("innerText")).jsonValue();
      console.log(`type ${type}`);
      const dateWithTime = dateReadValue.clone().set({
        hour: to.get("hour"),
        minute: to.get("minute"),
        second: 0
      });

      dateInfo.fifteenMinuteReads.push({
        timestamp: dateWithTime,
        consumption,
        generation
      });
    }

    await browser.close();
    console.log("browser instance has been destroyed");

    return dateInfo;
  } catch (error) {
    console.error(`error occurred while requesting for meter usage: ${error}`);
    return undefined;
  }
};
