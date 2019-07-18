module.exports = async ({
  page,
  SMART_METER_TEXAS_LOGIN_PAGE,
  SMART_METER_TEXAS_USERNAME,
  SMART_METER_TEXAS_PASSWORD
}) => {
  await page.goto(SMART_METER_TEXAS_LOGIN_PAGE);
  console.log(`navigated to ${SMART_METER_TEXAS_LOGIN_PAGE}`);

  await page.type("#username", SMART_METER_TEXAS_USERNAME, { delay: 100 });
  console.log("filled in username");
  await page.type("#txtPassword", SMART_METER_TEXAS_PASSWORD, { delay: 100 });
  console.log("filled in password");

  const loginNavigationPromise = page.waitForNavigation();
  console.log("clicked submit button to sign in");
  await page.click('input[type="submit"]');
  await loginNavigationPromise;
  console.log("landed on home page");
  return page;
};
