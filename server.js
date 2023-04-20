const http = require('http');
const fs = require("fs").promises;
const { Client } = require("pg");

const hostname = "0.0.0.0";
const port = "8080";

const client = new Client({
    user: "daerean",
    host: "localhost",
    password: "",
    database: "event-hub-db",
    port: 5432,
})

client.connect();

function revisarCredenciales(response, usuario, contraseña) {
    const query = `SELECT COUNT(*) FROM credentials WHERE username = '${usuario}' and password = '${contraseña}'`;
    console.log(query);

    client.query(query).then((res) => {
        var payload = res || new Object();
        var rows = JSON.stringify(payload.rows);
        console.log(rows);
        response.setHeader("Content-type", "application/json");
        response.writeHead(200);
        response.end(rows);
    })
}

const server = http.createServer((request, response) => {
    switch(request.url) {
        case "/login":
            var body = "";
            request.on("data", function (chunk) {
                body += chunk;
            });
            request.on("end", function () {
                let params = JSON.parse(body);
                console.log(params);
                revisarCredenciales(response, params.usuario, params.contraseña)
            })
            break;
    }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
