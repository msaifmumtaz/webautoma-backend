const puppeteer = require("puppeteer-extra");
const userAgentLib = require("user-agents");
const axios = require("axios");
const proxyChain = require("proxy-chain");
// const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
// Dynamic strategy.
const {
  setIntervalAsync,
  clearIntervalAsync,
} = require("set-interval-async/dynamic");

// Fixed strategy.
// const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async/fixed');
const access_token = "d0c6e78050da4f11b85bc92aeb21887d";
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const apiurl = "https://webautoma.com/api/";
const maxWorker = 4;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const env = "local"; // set local for testing in local or live for production server

// ****************************
// User Agent Method
// ****************************

/**
 * Get Random User Agent
 * @returns {string} Random UserAgent
 */
function getUserAgent() {
  const deviceTypes = Array("mobile", "desktop");
  Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
  };
  var device_category = deviceTypes.random();
  user = new userAgentLib({
    deviceCategory: device_category,
  });

  return { user_ag: user.toString(), device_type: device_category };
}

// **************************
// Project Methods
// **************************

/**
 * Get Active Project Return Project Data of Currently
 * Processing Status.
 * @param {string} access_token_use
 * @returns {object} Project Data
 */
async function getActiveProject(access_token_use, apiurl) {
  try {
    const response = await axios.post(apiurl + "project/get", {
      access_token: access_token_use,
    });
    // console.log(response.data);
    //   var response;
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Get Active Project Task Data
 * @param {int} project_id
 * @param {string} access_token_use
 * @returns {object} Task Data Object
 */

async function getTaskData(project_id, access_token_use, apiurl) {
  try {
    const response = await axios.post(apiurl + "project/getTask", {
      access_token: access_token_use,
      project_id: project_id,
    });
    // console.log(response.data);s
    return response.data;
    //   var response;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Update Task Status Method
 * @param {string} access_token_use
 * @param {string} status
 * @param {string} log_msg
 * @param {int|string} task_id
 * @returns {object} Update Status Message Got from Server
 */
async function updateTaskStatus(
  access_token_use,
  status,
  log_msg,
  page_msg,
  task_id,
  apiurl
) {
  try {
    const response = await axios.post(apiurl + "project/updateTaskStatus", {
      access_token: access_token_use,
      task_id: task_id,
      task_status: status,
      logs: log_msg,
      page_message: page_msg,
    });
    console.log(response.data);
    return response.data;
    //   var response;
  } catch (error) {
    console.error(error);
  }
}

/**
 *
 * @param {string} access_token_use Access token for api auithorization
 * @param {int|string} project_id Project ID
 * @param {string} apiurl api url
 * @returns
 */
async function getTotalTasks(access_token_use, project_id, apiurl) {
  try {
    const response = await axios.post(apiurl + "project/getTotalTasks", {
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

// ****************************
// Proxy Methods
// ****************************

/**
 * Get Proxy Data from Server.
 * @param {string} access_token_use
 * @returns {object} Proxy Data Object
 */
async function getproxy(access_token_use, project_id_use, apiurl) {
  try {
    const response = await axios.post(apiurl + "proxy/get", {
      access_token: access_token_use,
      project_id: project_id_use,
    });
    console.log("proxy", response.data);
    return response.data;
    //   var response;
  } catch (error) {
    console.error(error);
  }
}

// async function getProjectstoData() {
//   projectList = await getActiveProject(access_token, apiurl);
//   let jsonData = JSON.stringify(projectList);

//   fs.writeFile("data.json", jsonData, (err) => {
//     if (err) throw err;
//     console.log("The file has been saved!");
//   });
// }
// setIntervalAsync(async () => {
//   projectList = await getActiveProject(access_token, apiurl);
//   let jsonData = JSON.stringify(projectList);

//   fs.writeFile("data.json", jsonData, (err) => {
//     if (err) throw err;
//     console.log("The file has been saved!");
//   });
// }, 5000);

// function readListFromFile(filePath) {
//   let jsonData = fs.readFileSync(filePath);
//   let data = JSON.parse(jsonData);
//   return data;
// }

async function taskProcess(task, access_token, proxy_url, args, apiurl) {
  if (task) {
    let puperr;
    const browser = await puppeteer.launch(args).catch((err) => {
      puperr = err;
    });
    if (puperr) {
      var logs = await updateTaskStatus(
        access_token,
        "error",
        puperr.toString(),
        "",
        task.task_id,
        apiurl
      );
    }
    try {
      console.log("Running Task Of Project..");
      var ua_obj = getUserAgent();
      const page = await browser.newPage();
      await page.setUserAgent(ua_obj.user_ag);
      await page.goto(task.project_url, {
        waitUntil: "networkidle2",
      });
      // await page.waitForTimeout();
      // console.log(task.task_data);
      var errors;
      var pageMessage;
      var m;
      await page.click("body");
      await page.waitForSelector(task.task_data[0].selector, {
        visible: true,
      });
      for (let d of task.task_data) {
        // console.log(d);
        await page.waitForTimeout(2000);
        if (d.device_type == ua_obj.device_type || d.device_type == "both") {
          switch (d.input_type) {
            case "input":
              // console.log(d.selector_type);
              await page.type(d.selector, d.value).catch((err) => {
                errors = d.input_select_name+err;
              });
              console.log("input", d.input_select_name);
              await page.waitForTimeout(1000);
              break;
            case "submit":
              await page.click(d.selector).catch((err) => {
                errors = d.input_select_name+err;
              });
              console.log("submit", d.input_select_name);
              await page.waitForTimeout(1000);
              break;
            case "checkbox":
              await page
                .click(d.selector, {
                  clickCount: 1,
                })
                .catch((err) => {
                  errors = d.input_select_name+err;
                });
              console.log("checkbox", d.input_select_name);
              await page.waitForTimeout(1000);
              break;
            case "radiobtn":
              await page
                .click(d.selector, {
                  clickCount: 1,
                })
                .catch((err) => {
                  errors = d.input_select_name+err;
                });
              console.log("radiobtn", d.input_select_name);
              await page.waitForTimeout(1000);
              break;
            case "select":
              await page.select(d.selector, d.value).catch((err) => {
                errors = d.input_select_name+err;
              });
              console.log("select", d.input_select_name);
              await page.waitForTimeout(1000);
              break;
            case "button":
              await page.click(d.selector).catch((err) => {
                errors = d.input_select_name+err;
              });
              console.log("button", d.input_select_name);
              await page.waitForTimeout(1000);
              break;
            case "message":
              await page.waitForTimeout(15000);
              m = await page.waitForSelector(d.selector, {
                visible: true,
              });
              pageMessage = await m.evaluate((el) => el.textContent);
            //Alert Handling Code.
            // page.on('dialog', async dialog => {
            //     console.log(dialog.message());
            //     await dialog.dismiss();
            //     });
          }
        }
        if (errors) {
          console.log("Log Error BREAK.");
          break;
        }
      }
      if (errors) {
        var logs = await updateTaskStatus(
          access_token,
          "error",
          errors.toString(),
          "Task Completed With Errors.",
          task.task_id,
          apiurl
        );
        // var log=await Promise.all(logser);
      } else {
        var logs = await updateTaskStatus(
          access_token,
          "completed",
          "Task Completed Successfully.",
          pageMessage,
          task.task_id,
          apiurl
        );
      }
      await page.waitForTimeout(5000);
      // await page.screenshot({
      //     path: task.task_id + '.png',
      //     fullPage: true
      // })

      // console.log(logs);
      await browser.close();
      await proxyChain.closeAnonymizedProxy(proxy_url, true);
      return logs;
      // console.log(`All done, check the screenshot. ✨`)
    } catch (error) {
      var logs = await updateTaskStatus(
        access_token,
        "error",
        error.toString(),
        task.task_id,
        apiurl
      );
      return logs;
    }
  }
}

async function mainWorker(access_token, project, proxy, apiurl) {
  if (project != null || project != "" || project != 0) {
    // var proxy = await getproxy();
    // console.log(proxy);
    if (proxy) {
      if (proxy.use_proxy === "yes") {
        var proxy_url = proxy.proxy_url;
        var p_username = proxy.proxy_username;
        var p_password = proxy.proxy_password;
        if (proxy.is_proxy_auth === "yes") {
          var orproxyurl = `http://${p_username}:${p_password}@${proxy_url}`;
          proxy_url = await proxyChain.anonymizeProxy(orproxyurl);
        } else {
          proxy_url = await proxyChain.anonymizeProxy(proxy_url);
        }
        var args = {
          args: [`--proxy-server=${proxy_url}`, `--no-sandbox`],
          headless: true,
        };
        console.log("Using Proxy....");
      } else {
        var args = {
          args: [`--no-sandbox`],
          headless: true,
        };
      }
      var task = await getTaskData(project, access_token, apiurl);
      if(task){
        let task_logs = await taskProcess(
          task,
          access_token,
          proxy_url,
          args,
          apiurl
        );
        return task_logs;
      }

    }
  }
}

let runningProjects= new Set();
async function runProject(project) {
    if( runningProjects.has(project.id)){
      console.log('starting project')
      var [minDelay, maxDelay] = project.task_delay.split("-");
      minDelay = parseInt(minDelay) * 1000;
      maxDelay = parseInt(maxDelay) * 1000;
      var task_delay = Math.floor(
          Math.random() * (maxDelay - minDelay + 1) + minDelay
      );
      var proxy = await getproxy(access_token, project.id, apiurl);
      if (proxy && proxy != "error") {
          await mainWorker(access_token, project.id, proxy, apiurl);
          setTimeout(() => runProject(project), task_delay);
      }
    }else{
      return;
    }

}


(async () => {
  while (true) {
    // getProjectstoData();
    // let projectsData = readListFromFile("data.json");
    let projectsData =await getActiveProject(access_token, apiurl);
    if (projectsData) {
        console.log('got project data');
      // Keep track of the number of active workers
      let newProjects = new Set(projectsData.map(project => project.id));
      

      runningProjects.forEach(proID => {
        if (!newProjects.has(proID)) {
            runningProjects.delete(proID);
        }
      });

      for (let project of projectsData) {
        console.log("lopping Project")
        if(!runningProjects.has(project.id)){
          console.log("iside project")
          runningProjects.add(project.id);
          runProject(project);
        }
        console.log(runningProjects)
      }
      await delay(1000);
      // Wait for all the promises to resolve
    }else{
      runningProjects.clear();
    }
  }
})();
