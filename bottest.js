const puppeteer = require('puppeteer-extra')
const userAgentLib = require("user-agents");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

function getUserAgent(){
  const deviceTypes=Array('mobile','desktop');
  Array.prototype.random = function () {
      return this[Math.floor((Math.random()*this.length))];
    }
  var device_category= deviceTypes.random();
  user = new userAgentLib({ 
      deviceCategory: device_category 
  });

  return user.toString();
}

// puppeteer usage as normal
puppeteer.launch({ headless: false }).then(async browser => {
  console.log('Running tests..')
  const page = await browser.newPage()
  usera=getUserAgent();
  console.log(usera);
  await page.setUserAgent(usera);
  await page.goto('https://bot.sannysoft.com')
  await page.waitForTimeout(5000)
  await page.screenshot({ path: 'testresult.png', fullPage: true })
  await browser.close()
  console.log(`All done, check the screenshot. ✨`)
})