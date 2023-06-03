const http = require("http");
const fs = require("fs").promises;
const { Client } = require("pg");

const hostname = "0.0.0.0";
const port = "8080";

/*
const client = new Client({
  user : "daerean",
  host : "localhost",
  password : "",
  database : "event-hub-db",
  port : 5432,
})
*/

const { client } = require("./loginsql.js");

client
    .connect()
    .then(() => {
        console.log("Conexion exitosa a la base de datos PostgreSQL");
    })
    .catch((error) => {
        console.error(
            "Error al conectar a la base de datos PostgreSQL:",
            error
        );
    });

function revisarCredenciales(response, usuario, contraseña) {
    const query = `SELECT COUNT(*) FROM credentials WHERE username = '${usuario}' and password = '${contraseña}'`;
    console.log(query);

    client.query(query).then((res) => {
        var payload = res || new Object();
        var rows = JSON.stringify(payload.rows);
        console.log(rows);
        response.setHeader("Content-type", "application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.writeHead(200);
        response.end(rows);
    });
}

function registrarCredenciales(response, usuario, contraseña) {
    const query = `INSERT INTO credentials (username, password) VALUES ('${usuario}', '${contraseña}')`;
    console.log(query);

    client.query(query).then((res) => {
        var payload = res || new Object();
        var rows = JSON.stringify(payload.rows);
        console.log(rows);
        return true;
    });
    return false;
}

function registrarPersona(response, params) {
    const query = `INSERT INTO personas (nombres, mail, tipo_doc, doc) VALUES ('${params.nombres} ${params.apellidos}', '${params.mail}', ${params.tipo}, ${params.documento})`;
    console.log(query);

    let creden = registrarCredenciales(
        response,
        params.usuario,
        params.contraseña
    );

    client.query(query).then((res) => {
        var payload = res || new Object();
        var rows = JSON.stringify(payload.rows);
        if (creden == true && rows.length == 0) {
            rows = JSON.stringify({
                success: true,
            });
        }
        console.log(rows);
        response.setHeader("Content-type", "application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.writeHead(200);
        response.end(rows);
    });
}

function adaptarEvento(response, params) {}

function crearEvento(
    response,
    nombre,
    lugar,
    startdate,
    enddate,
    starttime,
    endtime,
    descripcion
) {
    const query = `INSERT INTO eventos (nombre,lugar, fcomienzo, ffin, hcomienzo, hfin, descripcion) VALUES ('${nombre}','${lugar}', '${startdate}','${enddate}', '${starttime}', '${endtime}', '${descripcion}')`;
    return client
        .query(query)
        .then((res) => {
            var payload = res || new Object();
            var rows = JSON.stringify(payload.rows);
            console.log("El evento se ha insertado correctamente en la tabla.");
            console.log(rows);
            response.setHeader("Content-type", "application/json");
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.writeHead(200);
            var data = JSON.stringify(payload.rows[0]);
            console.log(`response: ${data}`);
            response.end(data);
            return true;
        })
        .catch((error) => {
            console.error("Error al insertar un evento:", error);
            return false;
        });
}

function crearAmbiente(response, params) {
    const query = `INSERT INTO ambientes (nombre, ubicacion, aforo, tipo, tamaño, descripcion) VALUES ('${params.nombre}', '${params.ubicacion}', ${params.aforo}, '${params.tipo}', ${params.tamaño}, '${params.descripcion}')`;
    console.log(query);

    return client
        .query(query)
        .then((res) => {
            var payload = res || new Object();
            var rows = JSON.stringify(payload.rows);
            console.log(
                "El ambiente se ha insertado correctamente en la tabla."
            );
            console.log(rows);
            return true;
        })
        .catch((error) => {
            console.error("Error al insertar un ambiente:", error);
            return false;
        });
}

function editarEvento(
    response,
    nombre,
    lugar,
    categoria,
    startdate,
    enddate,
    starttime,
    endtime,
    descripcion
) {
    const query = `
    UPDATE eventos
    SET lugar='${lugar}', categoria='${categoria}', fcomienzo='${startdate}', ffin='${enddate}', hcomienzo='${starttime}', hfin='${endtime}', descripcion='${descripcion}'
    WHERE nombre='${nombre}'
  `;
    console.log(query);

    return client
        .query(query)
        .then((res) => {
            var payload = res || new Object();
            var rows = JSON.stringify(payload.rows);
            console.log(
                "El evento se ha actualizado correctamente en la tabla."
            );
            console.log(rows);
            return true;
        })
        .catch((error) => {
            console.error("Error al actualizar el evento:", error);
            return false;
        });
}

function actualizarAmbiente(
    response,
    nombre,
    ubicacion,
    aforo,
    tamaño,
    tipo,
    descripcion
) {
    const query = `
    UPDATE ambientes
    SET ubicacion='${ubicacion}', aforo=${aforo}, tamaño='${tamaño}', tipo='${tipo}', descripcion='${descripcion}'
    WHERE nombre='${nombre}'
  `;
    console.log(query);

    return client
        .query(query)
        .then((res) => {
            var payload = res || new Object();
            var rows = JSON.stringify(payload.rows);
            console.log(
                "El ambiente se ha actualizado correctamente en la tabla."
            );
            console.log(rows);
            return true;
        })
        .catch((error) => {
            console.error("Error al actualizar el ambiente:", error);
            return false;
        });
}

function crearActividad(
    response,
    id_evento,
    nombre,
    startdate,
    enddate,
    starttime,
    endtime,
    descripcion,
    expositor
) {
    const query = `INSERT INTO actividades (id_evento, nombre, fcomienzo, ffin, hcomienzo, hfin, descripcion, expositores) VALUES ('${id_evento}', '${nombre}','${startdate}','${enddate}', '${starttime}', '${endtime}', '${descripcion}'), 'ARRAY[${expositor}])`;
    console.log(query);

    return client
        .query(query)
        .then((res) => {
            var payload = res || new Object();
            var rows = JSON.stringify(payload.rows);
            console.log(
                "La actividad se ha insertado correctamente en la tabla."
            );
            console.log(rows);
            return true;
        })
        .catch((error) => {
            console.error("Error al insertar una actividad:", error);
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
    });
}

function NombresAmbientes(response) {
    const query = "SELECT * FROM ambientes";

    client
        .query(query)
        .then((res) => {
            var payload = res || new Object();
            var rows = JSON.stringify(payload.rows);
            response.setHeader(
                "Access-Control-Allow-Origin",
                "http://localhost:3000"
            );
            response.setHeader("Access-Control-Allow-Methods", "GET, POST");
            response.setHeader("Access-Control-Allow-Headers", "Content-Type");

            response.setHeader("Content-Type", "application/json"); // Agrega este encabezado
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.writeHead(200);
            response.end(rows);
        })
        .catch((error) => {
            console.error("Error al obtener los ambientes:", error);
            response.writeHead(500);
            response.end(
                JSON.stringify({ error: "Error al obtener los ambientes" })
            );
        });
}

function NombresEventos(response) {
    const query = "SELECT * FROM eventos";
    //console.log(query);

    client
        .query(query)
        .then((res) => {
            var payload = res || new Object();
            var rows = JSON.stringify(payload.rows);
            response.setHeader(
                "Access-Control-Allow-Origin",
                "http://localhost:3000"
            );
            response.setHeader("Access-Control-Allow-Methods", "GET, POST");
            response.setHeader("Access-Control-Allow-Headers", "Content-Type");
            response.setHeader("Content-Type", "application/json"); // Agrega este encabezado
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.writeHead(200);
            response.end(rows);
        })
        .catch((error) => {
            console.error("Error al obtener los ambientes:", error);
            response.writeHead(500);
            response.end(
                JSON.stringify({ error: "Error al obtener los eventos" })
            );
        });
}

const server = http.createServer((request, response) => {
    switch (request.url) {
        case "/login":
            var body = "";
            request.on("data", function (chunk) {
                body += chunk;
            });
            request.on("end", function () {
                let params = JSON.parse(body);
                console.log(params);
                revisarCredenciales(
                    response,
                    params.usuario,
                    params.contraseña
                );
            });
            break;
        case "/register":
            var body = "";
            request.on("data", function (chunk) {
                body += chunk;
            });
            request.on("end", function () {
                let params = JSON.parse(body);
                console.log(params);
                registrarPersona(response, params);
            });
            break;
        case "/AdaptarEvento":
            var body = "";
            request.on("data", function (chunk) {
                body += chunk;
            });
            request.on("end", function () {
                let params = JSON.parse(body);
                console.log(params);
                adaptarEvento(response, params);
            });
        case "/crearEvento":
            var body = "";
            request.on("data", function (chunk) {
                body += chunk;
            });
            request.on("end", function () {
                let params = JSON.parse(body);
                console.log(params);
                crearEvento(
                    response,
                    params.nombre,
                    params.lugar,
                    params.startdate,
                    params.enddate,
                    params.starttime,
                    params.endtime,
                    params.descripcion
                );
            });
            break;
        case "/crearAmbiente":
            var body = "";
            request.on("data", function (chunk) {
                body += chunk;
            });
            request.on("end", function () {
                let params = JSON.parse(body);
                console.log(params);
                crearAmbiente(
                    response,
                    params.nombre,
                    params.ubicacion,
                    params.aforo,
                    params.tamaño,
                    params.tipo,
                    params.descripcion
                );
            });
            break;
        case "/SeleccionarComites":
            var body = "";
            request.on("data", function (chunk) {
                body += chunk;
            });
            request.on("end", function () {
                seleccionarComites(response);
            });
            break;
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
