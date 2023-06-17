const {Client} = require("pg");

module.exports.client = new Client({
  user : "just_",
  host : "localhost",
  password : "yuca123",
  database : "event-hub-db",
  port : 5432,
})

