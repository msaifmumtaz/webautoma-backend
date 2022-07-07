const puppeteer = require('puppeteer-extra')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
var proxy = '34.224.3.158:3128';
// puppeteer usage as normal
puppeteer.launch({args: [`--proxy-server=${proxy}`], headless: false }).then(async browser => {
  console.log('Running tests..')
  const page = await browser.newPage()
  await page.goto('https://ifconfig.io')
  await page.waitForTimeout(25000)
  await page.screenshot({ path: 'testresult10.png', fullPage: true })

//   await page.type(".whsOnd.zHQkBf", "ch.saif109@gmail.com");
//   await page.keyboard.press('Enter');
//   await page.waitForTimeout(2000)

//   await page.type(".whsOnd.zHQkBf", "sara@7310sm");
//   await page.keyboard.press('Enter');


//   await page.screenshot({ path: 'testresult1.png', fullPage: true })
  await browser.close()
  console.log(`All done, check the screenshot. ✨`)
})

// const puppeteer = require('puppeteer')
//     async function main(){
//     const browser = await puppeteer.launch({
//       headless:false,
//       slowMo:100
//     })
//     const page = await browser.newPage()
//     await page.goto("https://devexpress.github.io/testcafe/example/");

//     //Enter value in the input
//     await page.type(".whsOnd .zHQkBf", "Annymous test");

//     //Click to check box
//     await page.click("#tried-test-cafe", {clickCount:1});

//     //Select value from dropdown
//     await page.select("#preferred-interface", "JavaScript API");

//     //Clicl to radio button
//     await page.click("#windows",{clickCount:1});

//     //Enter comment..
//     await page.type("#comments","This is puppeteer end to end example");

//     //Click to submit button
//     await page.click("#submit-button");

//     //Wait for 5000 seconds
//     await page.waitForTimeout(15000);
//    await page.close();
// }
// main();