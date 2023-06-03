const {Client} = require("pg");

module.exports.client = new Client({
  user : "marco",
  host : "localhost",
  password : "aguantaa123",
  database : "event-hub-db",
  port : 5432,
})
