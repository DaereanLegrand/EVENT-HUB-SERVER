const http = require('http');
const fs = require("fs").promises;
const {Client} = require("pg");

const hostname = "0.0.0.0";
const port = "8080";

const client = new Client({
  user : "marco",
  host : "localhost",
  password : "aguantaa123",
  database : "event-hub-db",
  port : 5432,
})

client.connect()
    .then(() => {
      console.log("Conexion exitosa a la base de datos PostgreSQL");
    })
    .catch((error) => {
      console.error("Error al conectar a la base de datos PostgreSQL:", error);
    });

function revisarCredenciales(response, usuario, contraseña) {
  const query = `SELECT COUNT(*) FROM credentials WHERE username = '${
      usuario}' and password = '${contraseña}'`;
  console.log(query);

  client.query(query).then((res) => {
    var payload = res || new Object();
    var rows = JSON.stringify(payload.rows);
    console.log(rows);
    response.setHeader("Content-type", "application/json");
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.writeHead(200);
    response.end(rows);
  })
}

function registrarCredenciales(response, usuario, contraseña) {
  const query = `INSERT INTO credentials (username, password) VALUES ('${
      usuario}', '${contraseña}')`;
  console.log(query);

  client.query(query).then((res) => {
    var payload = res || new Object();
    var rows = JSON.stringify(payload.rows);
    console.log(rows);
    return true;
  })
  return false;
}

function registrarPersona(response, params) {
  const query = `INSERT INTO personas (nombres, mail, tipo_doc, doc) VALUES ('${
      params.nombres} ${params.apellidos}', '${params.mail}', ${params.tipo}, ${
      params.documento})`;
  console.log(query);

  let creden =
      registrarCredenciales(response, params.usuario, params.contraseña);

    client.query(query).then((res) => {
        var payload = res || new Object();
        var rows = JSON.stringify(payload.rows);
        if (creden == true && rows.length == 0) {
            rows = JSON.stringify({
                success: true
            })
        }
        console.log(rows);
        response.setHeader("Content-type", "application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.writeHead(200);
        response.end(rows);
    })
}

function adaptarEvento(response, params) {}

function crearEvento(response, nombre, lugar, categoria, startdate, enddate,
                     starttime, endtime, descripcion) {
  const query =
      `INSERT INTO eventos (nombre,lugar,categoria, fcomienzo, ffin, hcomienzo, hfin, descripcion) VALUES ('${
          nombre}','${lugar}', '${categoria}', '${startdate}','${enddate}', '${
          starttime}', '${endtime}', '${descripcion}')`;
  console.log(query);

  return client.query(query)
      .then((res) => {
        var payload = res || new Object();
        var rows = JSON.stringify(payload.rows);
        console.log("El evento se ha insertado correctamente en la tabla.");
        console.log(rows);
        return true;
      })
      .catch((error) => {
        console.error("Error al insertar un evento:", error);
        return false;
      });
}

function crearAmbiente(response, nombre, ubicacion, aforo, tamaño, tipo,
                       descripcion) {
  const query =
      `INSERT INTO eventos (nombre, categoria, lugar, fcomienzo, ffin, hcomienzo, hfin, descripcion) VALUES ('${
          nombre}','${lugar}', '${direccion}', '${startdate}','${enddate}', '${
          starttime}', '${endtime}', '${descripcion}')`;
  console.log(query);

  return client.query(query)
      .then((res) => {
        var payload = res || new Object();
        var rows = JSON.stringify(payload.rows);
        console.log("El ambiente se ha insertado correctamente en la tabla.");
        console.log(rows);
        return true;
      })
      .catch((error) => {
        console.error("Error al insertar un ambiente:", error);
        return false;
      });
}

function seleccionarComites(response) {
    const query = `SELECT * FROM comites`;
    console.log(query);

    client.query(query).then((res) => {
        var payload = res || new Object();     
        var rows = JSON.stringify(payload.rows);
        console.log(rows);
        response.setHeader("Content-type", "application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.writeHead(200);
        response.end(rows);
    })
}

const server = http.createServer((request, response) => {
  switch (request.url) {
  case "/login":
    var body = "";
    request.on("data", function(chunk) { body += chunk; });
    request.on("end", function() {
      let params = JSON.parse(body);
      console.log(params);
      revisarCredenciales(response, params.usuario, params.contraseña)
    })
    break;
  case "/register":
    var body = "";
    request.on("data", function(chunk) { body += chunk; });
    request.on("end", function() {
      let params = JSON.parse(body);
      console.log(params);
      registrarPersona(response, params);
    })
    break;
  case "/AdaptarEvento":
    var body = "";
    request.on("data", function(chunk) { body += chunk; });
    request.on("end", function() {
      let params = JSON.parse(body);
      console.log(params);
      adaptarEvento(response, params);
    })
  case "/crearEvento":
    var body = "";
    request.on("data", function(chunk) { body += chunk; });
    request.on("end", function() {
      let params = JSON.parse(body);
      console.log(params);
      crearEvento(response, params.nombre, params.lugar, params.categoria,
                  params.startdate, params.enddate, params.starttime,
                  params.endtime, params.descripcion);
    })
  case "/crearAmbiente":
    var body = "";
    request.on("data", function(chunk) { body += chunk; });
    request.on("end", function() {
      let params = JSON.parse(body);
      console.log(params);
      crearAmbiente(response, params.nombre, params.ubicacion, params.aforo,
                    params.tamaño, params.tipo, params.descripcion);
    })
    break;
    case "/SeleccionarComites":
            var body = "";
            request.on("data", function (chunk) {
                body += chunk;
            });
            request.on("end", function () {
                seleccionarComites(response);
            })
            break;
  }
});

server.listen(
    port, hostname,
    () => { console.log(`Server running at http://${hostname}:${port}/`); });
