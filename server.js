const http = require('http');
const fs = require("fs").promises;
const { Client } = require("pg");

const hostname = "0.0.0.0";
const port = "8080";

const server = http.createServer((request, response) => {

});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
