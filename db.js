// open the database
let db = new sqlite3.Database('mydatabase.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the mydatabase database.');
  });
  
  // create a table
  db.run(`CREATE TABLE IF NOT EXISTS projects (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             project TEXT NOT NULL
           )`,
    (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Table created successfully');
    }
  );
  
  // insert some data
  let sql = `INSERT INTO users (name, age)
             VALUES (?, ?)`;
  let values = ['John', 25];
  
  db.run(sql, values, function(err) {
    if (err) {
      console.error(err.message);
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);
  });
  
  // retrieve the data
  db.all(`SELECT * FROM users`, (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    rows.forEach((row) => {
      console.log(row);
    });
  });
  
  // close the database
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });



setIntervalAsync(async () => {
    projectList = await getActiveProject(access_token, apiurl);
    let jsonData = JSON.stringify(projectList);
  
    fs.writeFile('data.json', jsonData, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
    
    // console.log(projectList);
    // let binaryData = Buffer.from(JSON.stringify(projectList));
    // console.log(binaryData);
    // // Delete Previous Projects
    // db.run(`DELETE FROM projects WHERE 1`, (err) => {
    //   if (err) {
    //     console.error(err.message);
    //   }
    // });
  
    // let sql = `INSERT INTO projects (data)
    //   VALUES (?)`;
    // let values = binaryData;
  
    // db.run(sql, values, function (err) {
    //   if (err) {
    //     console.error(err.message);
    //   }
    // });
  }, 5000);
  