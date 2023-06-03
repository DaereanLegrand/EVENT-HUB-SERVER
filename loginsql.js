const {Client} = require("pg");

module.exports.client = new Client({
  user : "daerean",
  host : "localhost",
  password : "",
  database : "event-hub-db",
  port : 5432,
})
