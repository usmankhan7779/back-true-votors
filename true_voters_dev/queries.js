
const xlsx = require("xlsx")//npm install xlsx
const fs = require("fs")//npm install fs
const Pool = require('pg').Pool
// const pool = new Pool({
//   user: 'ali_tahir',
//   host: 'localhost',
//   database: 'testing_api',
//   password: '12345',
//   port: 5432,
// })

const pool = new Pool({
    user: 'postgres',
    host: 'PGSERVER',
    //host: '0.tcp.ngrok.io',
    database: 'ARC',
    password: '123',
    port: 5432
    //port: 11351,
  })

function add_query(query_){
  pool.query(query_, (error, results) => {
    if (error) {
      throw error
    }
  //  response.status(200).json(results.rows)
  })
}

function createExcelFile(results)
{
  // var rawFile = fs.readFileSync("./datas.json")//dir of your json file as param
  // var raw = JSON.parse(rawFile)
  console.log('Creating Excel File ...')
  var raw = results
  var files  = []
  for (each in raw){
      files.push(raw[each])
      }  
    var obj = files.map((e) =>{
          return e
        })

    var newWB = xlsx.utils.book_new()

    var newWS = xlsx.utils.json_to_sheet(obj)

    xlsx.utils.book_append_sheet(newWB,newWS,"name")//workbook name as param
    const uuidv4 = require('uuid/v4'); // I chose v4 ‒ you can select others
    var filename = uuidv4();
    filename = filename+".xlsx"
    xlsx.writeFile(newWB,filename)//file name as param
 console.log('excel file created!');
 return filename
}
// Host Name: PGSERVER
// Port Number: 5432
// Username: postgres
// Password: 123

// Database: ARC
// Data Table Name: voter
// Metadata Table Name: voter_metadata

const getQuerylog = (request, response) => {
  pool.query('SELECT * FROM user_activity_log', (error, results) => {
    if (error) {
      response.status(400).json("Error: "+error.message);
    }
    response.status(200).json(results.rows)
  })
}

const getDataTypes = (request, response) => {
  pool.query('SELECT * FROM voter_metadata', (error, results) => {
    if (error) {
      response.status(400).json("Error: "+error.message);
    }
    response.status(200).json(results.rows)
  })
}

const getVoters = (request, response) => {
  pool.query('SELECT * FROM voter LIMIT 100', (error, results) => {
    if (error) {
      response.status(400).json("Error: "+error.message);
    }
    response.status(200).json(results.rows)
  })
}

// const getUserById = (request, response) => {
//   const id = parseInt(request.params.id)

//   pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
//     if (error) {
//       throw error
//     }
//     response.status(200).json(results.rows)
//   })
// }

const getQueryData = (request, response) => {
  try{
    let { query, page , limit } = request.body;
    page = parseInt(page);
    limit = parseInt(limit);

    const startIndex = (page - 1 ) * limit;
    const endIndex = page * limit;
    if (query == null){
      console.log("yup have query!")
      response.status(400).json("Error: query parameter not found in json body!")
    }
    
    
  // GET TOTAL NO OF RECORDS IN DB
  // let rows_count = 0
  let StartTime = null;
  let EndTime = null;
    pool.query('SELECT COUNT(*) FROM ( '+query+' ) as a', (error, total_rows) => {
      if (error) {
        // throw error
        console.log(error)
        response.status(400).json("Error: "+error.message)
      }
      else{
        total_rows = total_rows.rows[0].count
        // total_pages = parseInt(total_rows/limit)
        query = 'SELECT * FROM ( '+query+' ) as a LIMIT '+limit+' OFFSET '+startIndex;
          // fetch voters
          
          let ts = Date.now();
          let date_ob = new Date(ts);
          StartTime = date_ob;
          console.log(date_ob);
          // date_ob = new Date('2020-03-16T19:00:00.000Z');
          // console.log('Date : '+date_ob)
      pool.query(query, (error, voters) => {
        if (error) {
          // throw error
          console.log(error)
          response.status(400).json("Error: "+error.message)
        }
        else{
          let ts = Date.now();
          let date_ob = new Date(ts);
          EndTime = date_ob;
          console.log('start : '+StartTime+' | End : '+EndTime);
          console.log(StartTime);
          let user_id = 'temp123'
          var queryString = "INSERT INTO user_activity_log (user_id , query , execution_start_time , execution_end_time ) VALUES (" + "'" + [user_id, query, StartTime.toISOString(), EndTime.toISOString()].join("','") + "'" + ")";
          add_query(queryString)
        let results = {}
        console.log('endindex : ',endIndex)
        console.log('startindex : ',startIndex)
        console.log('total rows : ',total_rows)
        if (endIndex < total_rows){
        results.next = {
          page:page + 1,
          limit:limit
        }}

        if (startIndex > 0){
        results.previous = {
          page:page - 1,
          limit:limit
        }}
        results.total_rows = total_rows
        results.voters = voters.rows
        response.status(201).json(results)
      }}
    )

    }}
  )

  }
  catch(e){
    // [Error: Uh oh!]
    response.status(400).json("Error: query parameter not found in json body!")
  }
}

// GET Query Data Excel File
const getQueryDataFile = (request, response) => {
  try{
    let { query } = request.body;
    if (query == null){
      console.log("yup have query!")
      response.status(400).json("Error: query parameter not found in json body!")
    }
    
    
  // GET TOTAL NO OF RECORDS IN DB
    pool.query(query, (error, voters) => {
      if (error) {
        // throw error
        console.log(error)
        response.status(400).json("Error: "+error.message)
      }
      else{
        // console.log( request.protocol + '://' + request.get('host') + request.originalUrl)
        console.log( request.protocol + '://' + request.get('host'))
        filename = createExcelFile(voters.rows)
        var temp_response = {}
        temp_response.file_url = request.protocol + '://' + request.get('host') + '/' + filename
        response.status(201).json(temp_response)
      }
    }
  )

  }
  catch(e){
    // [Error: Uh oh!]
    response.status(400).json("Error: query parameter not found in json body!")
  }
}


// End here
module.exports = {
  getQuerylog,
    getVoters,
    getQueryDataFile,
    getQueryData,
    getDataTypes
}