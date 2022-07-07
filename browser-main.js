const puppeteer = require('puppeteer-extra')

const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

var data=require("/home/hello/Videos/webautoma-backend/data.json");

proxy=data.proxy_data;

if(proxy.use_proxy==='yes'){
    proxy_url=proxy.proxy_url;
    var args={ args: [`--proxy-server=${proxy_url}`], headless: false }
    var p_username= proxy.proxy_username;
    var p_password= proxy.proxy_password;
    console.log('Using Proxy....');
}else{
    var args={headless: false }
}


console.log("args: "+ JSON.stringify(args));

// process.exit();
puppeteer.launch(args).then(async browser => {
    console.log('Running tests..')
    const page = await browser.newPage();
    if(proxy.is_proxy_auth==='yes'){
        
        await page.authenticate({ p_username, p_password });
        console.log('Authenticated!!!');
    }
    await page.goto(data.project_url,{
        waitUntil: 'networkidle2',
      })
    // await page.waitForTimeout();
    for(let d of data.task_data){
        await page.waitForTimeout(100);

        switch (d.selector_type) {
            case 'input':
                await page.type(d.selector, d.value).catch(err => console.error(err));;
                break;
            case 'submit':
                await page.click(d.selector);
                break;
            case 'checkbox':
                await page.click(d.selector, {clickCount:1});
                break;
            case 'radiobtn':
                await page.click(d.selector,{clickCount:1});
                break;
            case 'select':
                await page.select(d.selector, d.value);
                break;
            case 'button':
                await page.click(d.selector);
                break;
        }
    }
    // data.task_data.forEach(async d=>{
    //     console.log(d);

    //     await page.waitForTimeout(100);
    //     switch (d.selector_type) {
    //         case 'input':
    //             await page.type(d.selector, d.value);
    //             break;
    //         case 'submit':
    //             await page.click(d.selector);
    //             break;
    //         case 'checkbox':
    //             await page.click(d.selector, {clickCount:1});
    //             break;
    //         case 'radiobtn':
    //             await page.click(d.selector,{clickCount:1});
    //             break;
    //         case 'select':
    //             await page.select(d.selector, d.value);
    //             break;
    //         case 'button':
    //             await page.click(d.selector);
    //             break;
    //         default:
    //             break;
    //     }

    // });
    await page.waitForTimeout(5000)
    await page.screenshot({ path: 'lbpvng.png', fullPage: true })
    
  //   await page.type(".whsOnd.zHQkBf", "ch.saif109@gmail.com");
  //   await page.keyboard.press('Enter');
  //   await page.waitForTimeout(2000)
  
  //   await page.type(".whsOnd.zHQkBf", "sara@7310sm");
  //   await page.keyboard.press('Enter');
  
  
  //   await page.screenshot({ path: 'testresult1.png', fullPage: true })
    await browser.close()
    console.log(`All done, check the screenshot. ✨`)
  })