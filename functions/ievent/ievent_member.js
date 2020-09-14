//'use strict';



// require the AWS SDK
import { RDSDataService } from 'aws-sdk';
const rdsDataService = new RDSDataService()


const data = require('data-api-client')({
  secretArn: process.env.SECRETS_ARN,
  resourceArn: process.env.DB_ARN,
  database: process.env.DB_NAME // default database
})

// axios
import axios from 'axios';


export function getmember(event, context, callback) {

  const config = {
    method: 'get',
    url: process.env.URL, //Need the actual endpoint. well use https://jsonplaceholder.typicode.com/todos/ for now.
    params: {
      id: JSON.parse(event.body).id  //Are we sending id as query variable? path variable? or no params?
    },
    responseType: 'json',
    headers: { 'Authorization': 'AUTH_TOKEN' }, //we need a token?
    auth: {           //We need some kind of auth?
      username: '',
      password: ''
    }

  }

  
  

  // prepare SQL command
  let sqlParams = {
    secretArn: process.env.SECRETS_ARN,
    resourceArn: process.env.DB_ARN,
    sql: 'SHOW TABLES;',
    database: process.env.DB_NAME,
    includeResultMetadata: true
  }



  getMember = async (config) => {

    try {
      const resp = await axios.get(config)

      checkDbUser(resp.data);

    }
    catch(error){
      console.error(error);

    }

}


  processDbUser = async (user) => {
    
    try {
      let dest_id = await data.query(
      `select destination_id from source_map where source_id = :id`,
      {id: user.id}
      )

      if (dest_id == 0)
      { 
        let result = await data.transaction()
          .query('insert into member (member_type) values(: member_type)', {member_type: 'child'})
          .query((r) => ['insert into source_map (source_id, source_name, destination_id, destination_name)'+
          'values(:source_id, :source_name, :destination_id, :destination_name)', 
          { source_id: user.id, source_name: 'ievents', destination_id: r.insertId, destination_name: 'memeber'}])
          .rollback((e, status) => { console.log(e) }) // optional
          .commit()

      }
      else {
        let result = await data.transaction()
          .query('UPDATE member_meta SET member_value = :username WHERE member_id = :dest_id'+
          'AND member_key = :key', {key: 'user_name', username: user.username, dest_id: dest_id})
          .query('UPDATE member_meta SET member_value = :email WHERE member_id = :dest_id' +
          'AND member_key = :key', { email: user.email, key: 'email', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :status WHERE member_id = :dest_id' +
          'AND member_key = :key', { status: user.status, key: 'status', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :creation_date WHERE member_id = :dest_id' +
          'AND member_key = :key', { creation_date: user.creation_date, key: 'creation_date', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :activated WHERE member_id = :dest_id' +
          'AND member_key = :key', { activated: user.activated, key: 'creation_date', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :activated WHERE member_id = :dest_id' +
          'AND member_key = :key', { activated: user.activated, key: 'creation_date', dest_id: dest_id })
          .rollback((e, status) => { console.log(e)}) // optional
          .commit()
      }
    }
    catch(error){
      console.error(error);
    }
     

 }



  getMember(config);




dbres.forEach(function (x) {
  console.log(x + '=' + res[x])
});

  // var obj = { x: '1', a: '2', b: '3' };
  // var items = result.keys(obj);
  // //items.sort(); // sort the array of keys
  // items.forEach(function (item) {
  //   console.log(item + '=' + obj[item]);
  // });


  // run SQL command
  rdsDataService.executeStatement(sqlParams, function (err, data) {
    if (err) {
      // error
      console.log(err)
      callback('Query Failed')
    } else {
      // init
      var rows = []
      var cols = []

      // build an array of columns
      data.columnMetadata.map((v, i) => {
        cols.push(v.name)
      });

      // build an array of rows: { key=>value }
      data.records.map((r) => {
        var row = {}
        r.map((v, i) => {
          if (v.stringValue !== "undefined") { row[cols[i]] = v.stringValue; }
          else if (v.blobValue !== "undefined") { row[cols[i]] = v.blobValue; }
          else if (v.doubleValue !== "undefined") { row[cols[i]] = v.doubleValue; }
          else if (v.longValue !== "undefined") { row[cols[i]] = v.longValue; }
          else if (v.booleanValue !== "undefined") { row[cols[i]] = v.booleanValue; }
          else if (v.isNull) { row[cols[i]] = null; }
        })
        rows.push(row)
      })

      // done
      console.log('Found rows: ' + rows.length)
      callback(null, rows)
    }
  })
}


