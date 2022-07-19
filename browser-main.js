const puppeteer = require('puppeteer-extra');
const axios = require('axios');
// const Queue = require('bull');
const access_token = 'd0c6e78050da4f11b85bc92aeb21887d';
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// let queue=new Queue('webautoma');

// console.log('1');
async function getActiveProject(access_token_use) {
    try {
        const response = await axios.post('http://webautoma.pk/api/project/get', {
            access_token: access_token_use
        });
        console.log(response.data + 'project');
        //   var response;
        return response.data;
    } catch (error) {
        console.error(error);
    }
}


async function getTaskData(project_id, access_token_use) {
    try {
        const response = await axios.post('http://webautoma.pk/api/project/getTask', {
            access_token: access_token_use,
            project_id: project_id
        });
        // console.log(response.data);
        return response.data;
        //   var response;
    } catch (error) {
        console.error(error);
    }
}
async function getproxy(access_token_use) {
    try {
        const response = await axios.post('http://webautoma.pk/api/proxy/get', {
            access_token: access_token_use
        });
        console.log(response.data);
        return response.data;
        //   var response;
    } catch (error) {
        console.error(error);
    }
}

async function updateTaskStatus(access_token_use, status, log_msg, task_id) {
    try {
        const response = await axios.post('http://webautoma.pk/api/project/updateTaskStatus', {
            access_token: access_token_use,
            task_id: task_id,
            task_status: status,
            logs: log_msg
        });
        console.log(response.data);
        return response.data;
        //   var response;
    } catch (error) {
        console.error(error);
    }
}

async function getTotalTasks(access_token_use, project_id) {
    try {
        const response = await axios.post('http://webautoma.pk/api/project/getTotalTasks', {
            access_token: access_token_use,
            project_id: project_id,
        });
        console.log(response.data);
        return response.data.total;
        //   var response;
    } catch (error) {
        console.error(error);
    }
}
// async function updateProjectStatus(access_token, project_id, status) {

//     }

// const interval = setInterval(async () => {
//     var project= await getActiveProject(access_token);
//     if(project != null || project !=0){
//         var job= await getTaskData(project,access_token);
//         if(job){
//             console.log(job);
//             queue.add(job);
//         }
//     }

//   }, 3000);

// queue.process(async (job)=>{

// })

async function main(access_token) {
    var project = await getActiveProject(access_token);
    if (project != null || project != '' || project != 0) {
        // var proxy = await getproxy();
        var proxy = await getproxy(access_token);
        // console.log(proxy);
        if (proxy) {
            if (proxy.use_proxy === 'yes') {
                proxy_url = proxy.proxy_url;
                var args = {
                    args: [`--proxy-server=${proxy_url}`],
                    headless: false
                }
                var p_username = proxy.proxy_username;
                var p_password = proxy.proxy_password;
                console.log('Using Proxy....');
            } else {
                var args = {
                    headless: false
                }
            }
            var task = await getTaskData(project, access_token);
            // console.log(task);
            // var puperr='Puppeter Error Contact your Developer';
            if (task) {
                puppeteer.launch(args).then(async browser => {
                    console.log('Running tests..')
                    const page = await browser.newPage();
                    if (proxy.is_proxy_auth === 'yes') {

                        await page.authenticate({
                            p_username,
                            p_password
                        });
                        console.log('Authenticated!!!');
                    }
                    await page.goto(task.project_url, {
                        waitUntil: 'networkidle2',
                    })
                    // await page.waitForTimeout();
                    // console.log(task.task_data);
                    var errors;
                    for (let d of task.task_data) {
                        // console.log(d);
                        await page.waitForTimeout(1000);

                        switch (d.input_type) {
                            case 'input':
                                // console.log(d.selector_type);
                                await page.type(d.selector, d.value).catch(err => {
                                    errors = err;
                                });
                                break;
                            case 'submit':
                                await page.click(d.selector).catch(err => {
                                    errors = err;
                                });
                                break;
                            case 'checkbox':
                                await page.click(d.selector, {
                                    clickCount: 1
                                }).catch(err => {
                                    errors = err;
                                });
                                break;
                            case 'radiobtn':
                                await page.click(d.selector, {
                                    clickCount: 1
                                }).catch(err => {
                                    errors = err;
                                });
                                break;
                            case 'select':
                                await page.select(d.selector, d.value).catch(err => {
                                    errors = err;
                                });
                                break;
                            case 'button':
                                await page.click(d.selector).catch(err => {
                                    errors = err;
                                });
                                break;
                        }
                        if (errors) {
                            console.log('Log Error BREAK.');
                            break;
                        }
                    }
                    if (errors) {
                        var logs = await updateTaskStatus(access_token, 'error', errors.toString(), task.task_id);

                    } else {
                        var logs = await updateTaskStatus(access_token, 'completed', 'Task Completed Successfully.', task.task_id);
                    }
                    // console.log(logs);
                    await browser.close()
                    // console.log(`All done, check the screenshot. ✨`)

                })
                // var logs = await updateTaskStatus(access_token, 'error', puperr.toString(), task.task_id);

            }
            // process.exit();

            // console.log(taskdata);
        }

    }
}

(async () => {
    while (true) {
        var maincall = await main(access_token);
    }
    var logs=await Promise.all(maincall);
    // var totalTasks = await getTotalTasks(access_token, project);
    // // console
    // for (let index = 0; index < totalTasks; index++) {
    //     if(totalTasks==0){
    //         break;
    //     }
    // }

})()
// (async () => {
//     var project = await getActiveProject(access_token);
//     if (project != null || project != '' || project!=0) {
//         // var proxy = await getproxy();
//         var totalTasks = await getTotalTasks(access_token, project);
//         // console
//         for (let index = 0; index < totalTasks; index++) {
//             if(totalTasks==0){
//                 break;
//             }
//             var proxy = await getproxy(access_token);
//             // console.log(proxy);
//             if (proxy) {
//                 if (proxy.use_proxy === 'yes') {
//                     proxy_url = proxy.proxy_url;
//                     var args = {
//                         args: [`--proxy-server=${proxy_url}`],
//                         headless: false
//                     }
//                     var p_username = proxy.proxy_username;
//                     var p_password = proxy.proxy_password;
//                     console.log('Using Proxy....');
//                 } else {
//                     var args = {
//                         headless: false
//                     }
//                 }
//                 var task = await getTaskData(project, access_token);
//                 // console.log(task);
//                 // var puperr='Puppeter Error Contact your Developer';
//                 if (task) {
//                     puppeteer.launch(args).then(async browser => {
//                         console.log('Running tests..')
//                         const page = await browser.newPage();
//                         if (proxy.is_proxy_auth === 'yes') {

//                             await page.authenticate({
//                                 p_username,
//                                 p_password
//                             });
//                             console.log('Authenticated!!!');
//                         }
//                         await page.goto(task.project_url, {
//                             waitUntil: 'networkidle2',
//                         })
//                         // await page.waitForTimeout();
//                         // console.log(task.task_data);
//                         var errors;
//                         for (let d of task.task_data) {
//                             // console.log(d);
//                             await page.waitForTimeout(1000);

//                             switch (d.input_type) {
//                                 case 'input':
//                                     // console.log(d.selector_type);
//                                     await page.type(d.selector, d.value).catch(err => {
//                                         errors = err;
//                                     });
//                                     break;
//                                 case 'submit':
//                                     await page.click(d.selector).catch(err => {
//                                         errors = err;
//                                     });
//                                     break;
//                                 case 'checkbox':
//                                     await page.click(d.selector, {
//                                         clickCount: 1
//                                     }).catch(err => {
//                                         errors = err;
//                                     });
//                                     break;
//                                 case 'radiobtn':
//                                     await page.click(d.selector, {
//                                         clickCount: 1
//                                     }).catch(err => {
//                                         errors = err;
//                                     });
//                                     break;
//                                 case 'select':
//                                     await page.select(d.selector, d.value).catch(err => {
//                                         errors = err;
//                                     });
//                                     break;
//                                 case 'button':
//                                     await page.click(d.selector).catch(err => {
//                                         errors = err;
//                                     });
//                                     break;
//                             }
//                             if (errors) {
//                                 console.log('Log Error BREAK.');
//                                 break;
//                             }
//                         }
//                         if (errors) {
//                             var logs = await updateTaskStatus(access_token, 'error', errors.toString(), task.task_id);

//                         } else {
//                             var logs = await updateTaskStatus(access_token, 'completed', 'Task Completed Successfully.', task.task_id);
//                         }
//                         // console.log(logs);
//                         await browser.close()
//                         // console.log(`All done, check the screenshot. ✨`)

//                     })
//                     // var logs = await updateTaskStatus(access_token, 'error', puperr.toString(), task.task_id);

//                 }
//                 // process.exit();

//                 // console.log(taskdata);
//             }
//         }

//     }

//     //   const users = await asyncExample()
//     // console.log(users)
// })()
// console.log(project);
// var d=getproxy();


// var data=require("/home/hello/Videos/webautoma-backend/data.json");

// proxy=data.proxy_data;




// console.log("args: "+ JSON.stringify(args));

// // process.exit();
// puppeteer.launch(args).then(async browser => {
//     console.log('Running tests..')
//     const page = await browser.newPage();
//     if(proxy.is_proxy_auth==='yes'){

//         await page.authenticate({ p_username, p_password });
//         console.log('Authenticated!!!');
//     }
//     await page.goto(data.project_url,{
//         waitUntil: 'networkidle2',
//       })
//     // await page.waitForTimeout();
//     for(let d of data.task_data){
//         await page.waitForTimeout(100);

//         switch (d.selector_type) {
//             case 'input':
//                 await page.type(d.selector, d.value).catch(err => console.error(err));;
//                 break;
//             case 'submit':
//                 await page.click(d.selector);
//                 break;
//             case 'checkbox':
//                 await page.click(d.selector, {clickCount:1});
//                 break;
//             case 'radiobtn':
//                 await page.click(d.selector,{clickCount:1});
//                 break;
//             case 'select':
//                 await page.select(d.selector, d.value);
//                 break;
//             case 'button':
//                 await page.click(d.selector);
//                 break;
//         }
//     }
//     // data.task_data.forEach(async d=>{
//     //     console.log(d);

//     //     await page.waitForTimeout(100);
//     //     switch (d.selector_type) {
//     //         case 'input':
//     //             await page.type(d.selector, d.value);
//     //             break;
//     //         case 'submit':
//     //             await page.click(d.selector);
//     //             break;
//     //         case 'checkbox':
//     //             await page.click(d.selector, {clickCount:1});
//     //             break;
//     //         case 'radiobtn':
//     //             await page.click(d.selector,{clickCount:1});
//     //             break;
//     //         case 'select':
//     //             await page.select(d.selector, d.value);
//     //             break;
//     //         case 'button':
//     //             await page.click(d.selector);
//     //             break;
//     //         default:
//     //             break;
//     //     }

//     // });
//     await page.waitForTimeout(5000)
//     await page.screenshot({ path: 'lbpvng.png', fullPage: true })

//   //   await page.type(".whsOnd.zHQkBf", "ch.saif109@gmail.com");
//   //   await page.keyboard.press('Enter');
//   //   await page.waitForTimeout(2000)

//   //   await page.type(".whsOnd.zHQkBf", "sara@7310sm");
//   //   await page.keyboard.press('Enter');


//   //   await page.screenshot({ path: 'testresult1.png', fullPage: true })
//     await browser.close()
//     console.log(`All done, check the screenshot. ✨`)
//   })