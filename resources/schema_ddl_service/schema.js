'use strict';

// require the AWS SDK
const AWS = require('aws-sdk')
const rdsDataService = new AWS.RDSDataService()

exports.create = (event, context, callback) => {
  let sqlParams = ''
  const tables = [
    'CREATE TABLE IF NOT EXISTS member (id INT AUTO_INCREMENT PRIMARY KEY,' +
    'member_type VARCHAR(100),' +
    'last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,' +
    'first_name VARCHAR(100),' +
    'last_name VARCHAR(100),' +
    'email VARCHAR(100),' +
    'phone VARCHAR(100),' +
    'hkid   VARCHAR(100));'
    ,
    'CREATE TABLE IF NOT EXISTS member_meta(' +
    'member_id INT,' +
    'member_key VARCHAR(100),' +
    'member_value VARCHAR(255)' +
    ');'
    ,
    'CREATE TABLE IF NOT EXISTS source_map(' +
    'source_id VARCHAR(100),' +
    'destination_id INT,' +
    'destination_name VARCHAR(6)' +
    ');'
    ,
    'CREATE TABLE IF NOT EXISTS member_group(' +
    'id INT AUTO_INCREMENT PRIMARY KEY,' +
    'type VARCHAR(9),' +
    'last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP' +
    ');'
    ,
    'CREATE TABLE IF NOT EXISTS member_group_meta(' +
    'member_group_id INT,' +
    'meta_key VARCHAR(4),' +
    'meta_value VARCHAR(150),' +
    'last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP' +
    ');'
    ,
    'CREATE TABLE IF NOT EXISTS member_group_map(' +
    'member_id INT,' +
    'group_id INT,' +
    'last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP' +
    ');'
    ,
    'CREATE TABLE IF NOT EXISTS member_relationship(' +
    'member_id1 INT,' +
    'member_id2 INT,' +
    'relationship VARCHAR(7)' +
    ');'
    ,
    'CREATE TABLE IF NOT EXISTS booking(' +
    'id INT AUTO_INCREMENT PRIMARY KEY,' +
    'activity_type VARCHAR(6),' +
    'member_id VARCHAR(7)' +
    ');'
    ,
    'CREATE TABLE IF NOT EXISTS booking_meta(' +
    'member_id INT,' +
    'member_key VARCHAR(100),' +
    'member_value VARCHAR(255)' +
    ');'
    ,
    'CREATE TABLE IF NOT EXISTS survey(' +
    'id INT AUTO_INCREMENT PRIMARY KEY,' +
    'last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP' +
    ');'
    ,
    'CREATE TABLE IF NOT EXISTS survey_meta(' +
    'survey_id INT,' +
    'meta_key VARCHAR(50),' +
    'meta_value VARCHAR(100)' +
    ');'
    ,
    'CREATE TABLE IF NOT EXISTS survey_response(' +
    'id INT AUTO_INCREMENT PRIMARY KEY,' +
    'last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP' +
    ');'
    ,
    'CREATE TABLE IF NOT EXISTS survey_response_meta(' +
    'survey_response_id INT,' +
    'meta_key VARCHAR(50),' +
    'meta_value VARCHAR(100)' +
    ');'
    ,
    'SHOW TABLES;']

  for (const table of tables) {
    sqlParams = {
      secretArn: process.env.SECRETS_ARN,
      resourceArn: process.env.DB_ARN,
      sql: table,
      database: process.env.DB_NAME,
      includeResultMetadata: true
    }

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

        if (data.records) {

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

      }
    })
  }
}