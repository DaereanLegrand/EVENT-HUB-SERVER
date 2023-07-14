const {Client} = require("pg");

module.exports.client = new Client({
  user : "postgres",
  host : "localhost",
  password : "aguantaa123",
  database : "event_hub",
  port : 5432,
})

