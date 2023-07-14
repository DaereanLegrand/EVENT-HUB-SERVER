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
    const query = `INSERT INTO eventos (nombre,lugar, fcomienzo, ffin, hcomienzo, hfin, descripcion) VALUES ('${nombre}','${lugar}', '${startdate}','${enddate}', '${starttime}', '${endtime}', '${descripcion}') RETURNING id_evento`;
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
    const query = `INSERT INTO ambientes (id_evento ,nombre, ubicacion, aforo, tipo, tamaño, descripcion) VALUES ('${params.id_evento}', '${params.nombre}', '${params.ubicacion}', ${params.aforo}, '${params.tipo}', ${params.tamaño}, '${params.descripcion}')`;
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
    id_evento,
    nombre,
    lugar,
    startdate,
    enddate,
    starttime,
    endtime,
    descripcion
) {
    const query = `
    UPDATE eventos
    SET nombre= '${nombre}', lugar='${lugar}', fcomienzo='${startdate}', ffin='${enddate}', hcomienzo='${starttime}', hfin='${endtime}', descripcion='${descripcion}'
    WHERE id_evento='${id_evento}'
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

function editarAmbiente(
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
    console.log("asdasdafopinewagf ->");
    console.log(query);

    return client
        .query(query)
        .then((res) => {
            var payload = res || new Object();
            var rows = JSON.stringify(payload.rows);
            console.log("La actividad se ha insertado correctamente en la tabla.");
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
            console.error("Error al insertar la actividad:", error);
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

function seleccionarAmbientes(response) {
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
      response.end(JSON.stringify({ error: "Error al obtener los ambientes" }));
    });
}

function seleccionarEventosUsuario(response) {                         
  const query = "SELECT * FROM eventos";
                                   
  client.query(query)              
      .then((res) => {             
        var payload = res || new Object();
        var rows = payload.rows;   
        response.setHeader("Access-Control-Allow-Origin",
                           "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST")
;
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
                                   
        response.setHeader("Content-Type", "application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.writeHead(200);   
                                   
        // Modificar la respuesta para incluir solo los campos necesari
os
        const eventos = rows.map(row => {
          const {id_evento, nombre, descripcion, imagen} = row;
          return {id_evento, nombre, descripcion, imagen};
        });                        
                                   
        response.end(JSON.stringify(eventos));
      })                           
      .catch((error) => {          
        console.error("Error al obtener los eventos:", error);
        response.writeHead(500);   
        response.end(JSON.stringify({error : "Error al obtener los eventos"}));
      });                          
}                                  

function seleccionarEventos(response) {
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
    response.end(JSON.stringify({ error: "Error al obtener los eventos" }));
  });
}

function paquetesPorEvento(response, evento) {
  const query = `SELECT * FROM paquete where id_evento = '${evento}'`;
  console.log(query);              
                                   
  client.query(query)              
      .then((res) => {             
        var payload = res || new Object();
        var rows = JSON.stringify(payload.rows);
        response.setHeader("Access-Control-Allow-Origin",
                           "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST")
;
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
                                   
        response.setHeader("Content-Type",
                           "application/json"); // Agrega este encabezdo
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.writeHead(200);   
        response.end(rows);        
      })                           
      .catch((error) => {          
        console.error("Error al obtener los ambientes:", error);
        response.writeHead(500);   
        response.end(JSON.stringify({error : "Error al obtener los eventos"}));
      });                          
}                                  



function eliminarEvento(id_evento) {
  const query = `DELETE FROM eventos WHERE id_evento = ${id_evento}`;
  
  console.log(query);

  return client
    .query(query);
}

function eliminarAmbiente(id_ambiente) {
    
  const query = `DELETE FROM ambientes WHERE id_ambiente = ${id_ambiente}`;
  
  console.log(query);

  return client
    .query(query);
}

function eliminarActividad(id_actividad) {
    
    console.log("asdasdasdasd32qj20df9j320df");
    console.log(id_actividad);
    const query = `DELETE FROM actividades WHERE id_actividad = ${id_actividad}`;
    
    console.log(query);
  
    return client
      .query(query);
  }
  

function VisualizarAmbiente(response, id_evento){
    //console.log(`AHSJDAHSDJASHDASJDHASD -> ${id_evento}`);
    const query = `SELECT * FROM ambientes where id_evento = ${id_evento}`;
    
    console.log(query);
  
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
      response.end(JSON.stringify({ error: "Error al obtener los Ambientes" }));
    });
}

function VisualizarActividades(response, id_evento){
    //console.log(`AHSJDAHSDJASHDASJDHASD -> ${id_evento}`);
    //const query = `SELECT * FROM actividades`;

    const query = `SELECT act.*
    FROM actividades act
    JOIN ambientes amb ON act.id_ambientes = amb.id_ambiente
    WHERE amb.id_evento = ${id_evento};`
    console.log(query);
  
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
      response.end(JSON.stringify({ error: "Error al obtener los Ambientes" }));
    });
}


function obtenerRoles(response) {
  const query = "SELECT * FROM roles";

  client
    .query(query)
    .then((res) => {
      var payload = res || new Object();
      var rows = JSON.stringify(payload.rows);
      response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
      response.setHeader("Access-Control-Allow-Methods", "GET, POST");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type");

      response.setHeader("Content-Type", "application/json");
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.writeHead(200);
      response.end(rows);
    })
    .catch((error) => {
      console.error("Error al obtener los roles:", error);
      response.writeHead(500);
      response.end(JSON.stringify({ error: "Error al obtener los roles" }));
    });
}





function crearPreInscrito(response, nombre, apellido, tipodocumento,
    numerodocumento, evento, paquete, correoelectronico) {
const query = `WITH nuevo_usuario AS (
INSERT INTO usuarios (nombre, apellido, tipo_documento, numero_documento, evento, paquete, correo_electronico)
VALUES ('${nombre}', '${apellido}', '${tipodocumento}', '${
numerodocumento}', '${evento}', '${paquete}', '${correoelectronico}')
RETURNING id_usuario
)
INSERT INTO preinscritos (id_usuario)
SELECT id_usuario FROM nuevo_usuario
RETURNING id_usuario;`;
return client.query(query)
.then((res) => {
var payload = res || new Object();
var rows = JSON.stringify(payload.rows);
console.log(
"El preinscrito se ha insertado correctamente en la tabla.");
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

function agregarTrabajador(response, nombres, apellidos, numeroDocumento, correoElectronico, rol) {
  const query = `INSERT INTO roles (nombres, apellidos, numero_documento, correo_electronico, rol) VALUES ('${nombres}', '${apellidos}', '${numeroDocumento}', '${correoElectronico}', '${rol}')`;
  console.log(query);

  client
    .query(query)
    .then((res) => {
      var payload = res || new Object();
      var rows = JSON.stringify(payload.rows);
      console.log(rows);
      response.setHeader("Content-type", "application/json");
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.writeHead(200);
      response.end(rows);
    })
	/*
    .catch((error) => {
      console.error("Se al trabajador:", error);
      response.writeHead(500);
      response.end(JSON.stringify({ error: "Se al agrego al trabajador" }));
    });*/
}

function eliminarTrabajador(id_trabajador) {
  const query = `DELETE FROM roles WHERE id = ${id_trabajador}`;

  console.log(query);

  return client
    .query(query)
    .then(() => {
      console.log("El trabajador se ha eliminado correctamente.");
      return true;
    })
    .catch((error) => {
      console.error("Error al eliminar el trabajador:", error);
      return false;
    });
}


function actualizarRol(response, idRol, nuevoRol) {
  const query = `
    UPDATE roles
    SET rol = '${nuevoRol}'
    WHERE id = ${idRol}
  `;
  console.log(query);
   return client
   .query(query)
   .then(() => {
     console.log("Se actualizo correctamente.");
     return true;
   })
   .catch((error) => {
     console.error("Error al actualizar:", error);
     return false;


    });
}



function obtenerEventos(request, response) {
  // Aquí puedes realizar la consulta a la base de datos para obtener los eventos
  // Utiliza la biblioteca o el ORM que estés utilizando para interactuar con la base de datos

  // Ejemplo utilizando una consulta SQL con pg-promise
  client.query('SELECT * FROM eventos')
    .then(result => {
      const eventos = result.rows;
      response.setHeader("Content-Type", "application/json");
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.writeHead(200);
      response.end(JSON.stringify(eventos));
    })
    .catch(error => {
      console.error("Error al obtener los eventos:", error);
      response.setHeader("Content-Type", "application/json");
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.writeHead(500);
      response.end(JSON.stringify({ error: "Error al obtener los eventos" }));
    });
}



// Función para enviar una respuesta exitosa
function enviarRespuestaOk(response, data) {
  response.setHeader("Content-Type", "application/json");
  response.writeHead(200);
  response.end(JSON.stringify(data));
}

// Función para enviar una respuesta de error
function enviarRespuestaError(response, message) {
  const responseJson = { success: false, message: message };
  //response.setHeader("Content-Type", "application/json");
  //response.writeHead(500);
  response.end(JSON.stringify(responseJson));
}



function crearComite(response, eventoId, trabajadores) {
  const insertComiteQuery = 'INSERT INTO Comites (id_evento, descripcion) VALUES ($1, $2) RETURNING id';
  const insertCandidatoQuery = 'INSERT INTO Candidatos (id_comite, id_trabajador) VALUES ($1, $2)';
  const comiteDescripcion = 'Descripción del comité'; // Reemplaza con la descripción adecuada

  // Insertar el comité
  client.query(insertComiteQuery, [eventoId, comiteDescripcion], (error, comiteResult) => {
    if (error) {
      console.error('Error al insertar el comité:', error);
      response.statusCode = 500;
      //response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ success: false, error: 'Error al insertar el comité' }));
    } else {
      const comiteId = comiteResult.rows[0].id;
      
      // Insertar los candidatos
      trabajadores.forEach(trabajadorId => {
        client.query(insertCandidatoQuery, [comiteId, trabajadorId], (error) => {
          if (error) {
            console.error('Error al insertar el candidato:', error);
          }
        });
      });

      response.end(JSON.stringify({ success: true, message: 'Comité creado exitosamente' }));
    }
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
                crearAmbiente(response, params);
            });
            break;

            case "/editarEvento":
                var body = "";
                request.on("data", function (chunk) {
                  body += chunk;
                });
                request.on("end", function () {
                  let params = JSON.parse(body);
                  console.log(params);
                  editarEvento(
                    response,
                    params.id_evento,
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
    
            case "/editarAmbiente":
              var body = "";
              request.on("data", function (chunk) {
                body += chunk;
              });
              request.on("end", function () {
              let params = JSON.parse(body);
              console.log(params);
                editarAmbiente(
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
        case "/seleccionarAmbientes":
            seleccionarAmbientes(response);
            break;
        case "/eventosEnProgreso":
            seleccionarEventos(response);
            break;
        case "/seleccionarEventos":
            seleccionarEventosUsuario(response);
            break;
        case "/EliminarEvento":
            var body = "";
            request.on("data", function (chunk) {
                body += chunk;
            });
            request.on("end", function () {
                let params = JSON.parse(body);
                console.log(params);
                eliminarEvento(params.id);
            });
            break;
        case "/EliminarAmbiente":
            var body = "";
            request.on("data", function (chunk) {
                body += chunk;
            });
            request.on("end", function () {
                let params = JSON.parse(body);
                console.log(params);
                eliminarAmbiente(params.id);
            });
            break;
        case "/Actividades":
            console.log("BACKEND SISIDJASIDJAIS");
          var body = "";
          request.on("data", function (chunk) {
              body += chunk;
          });
          request.on("end", function () {
              let params = JSON.parse(body);
              console.log(params);
              crearActividad(
                params.response,
                params.id_evento,
                params.nombre,
                params.startdate,
                params.enddate,
                params.starttime,
                params.endtime,
                params.descripcion,
                params.expositor
              );
          });
          break;
          case "/VisualizarAmbientes":
            var body = "";
            request.on("data", function (chunk) {
                body += chunk;
            });
            request.on("end", function () {
                let params = JSON.parse(body);
                //console.log(params);
                VisualizarAmbiente(response,params.id_evento);
            });
            break;
            case "/VisualizarActividades":
            var body = "";
            request.on("data", function (chunk) {
                body += chunk;
            });
            request.on("end", function () {
                let params = JSON.parse(body);
                //console.log(params);
                VisualizarActividades(response,params.id_evento);
            });
            break;

            case "/EliminarActividad":
            var body = "";
            request.on("data", function (chunk) {
                body += chunk;
            });
            request.on("end", function () {
                let params = JSON.parse(body);
                console.log(params);
                eliminarActividad(params.id);
            });
            break;
      case "/Preinscribir":
        console.log("Preinscribir")
        var body = "";
        request.on("data", function(chunk) { body += chunk; });
        request.on("end", function() {
        let params = JSON.parse(body);
        console.log(params);
        crearPreInscrito(response, params.nombre, params.apellido,
                       params.tipodocumento, params.numerodocumento,
                       params.evento, params.paquete, params.correoelectronico);
          });
         break;
      case "/paquetesPorEvento":
        console.log("paquetesPorEvento")
        var body = "";
        request.on("data", function(chunk) { body += chunk; });
        request.on("end", function() {
        console.log("test1");
        console.log(body);
        console.log("test2");
        if (body == "") {
          console.log("preflight")
          var rows = JSON.stringify({});
          response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
          response.setHeader("Access-Control-Allow-Methods", "GET, POST");
          response.setHeader("Access-Control-Allow-Headers", "Content-Type");
          response.setHeader("Content-Type","application/json"); // Agrega este encabezado
          response.setHeader("Access-Control-Allow-Origin", "*");
          response.writeHead(200);
          response.end(rows);
        } else {
          var jsonbody = JSON.parse(body);
          // var jsonbody = JSON.parse(JSON.stringify(body));
          console.log(jsonbody.evento);
          // console.log(params);
          paquetesPorEvento(response, jsonbody.evento);
          // paquetesPorEvento(response, 1);
        }
        });
        break;
      case '/roles':
        obtenerRoles(response);
        break;
      case "/agregarTrabajador":
  	var body = "";
  	request.on("data", function (chunk) {
    		body += chunk;
  	});
	request.on("end", function() {
	console.log("Datos recibidos:", body);
	if (body == "") {
		console.log("preflight")
          	var rows = JSON.stringify({});
          	response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
          	response.setHeader("Access-Control-Allow-Methods", "GET, POST");
          	response.setHeader("Access-Control-Allow-Headers", "Content-Type");
          	response.setHeader("Content-Type","application/json"); // Agrega este encabezado
          	response.setHeader("Access-Control-Allow-Origin", "*");
          	response.writeHead(200);
          	response.end(rows);
	}else{
    		var params = JSON.parse(body);
    		console.log(params.nombres);
    		agregarTrabajador(response, params.nombres, params.apellidos, params.numeroDocumento, params.correoElectronico, params.rol);
	}
	});
  	break;
      case "/EliminarRol":
      	var body = "";
      	request.on("data", function (chunk) {
       	 body += chunk;
     	});
      	request.on("end", function () {
      	  console.log("Datos recibidos:", body);
        if (body == "") {
                console.log("preflight")
                var rows = JSON.stringify({});
                response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
                response.setHeader("Access-Control-Allow-Methods", "GET, POST");
                response.setHeader("Access-Control-Allow-Headers", "Content-Type");
                response.setHeader("Content-Type","application/json"); // Agrega este encabezado
                response.setHeader("Access-Control-Allow-Origin", "*");
                response.writeHead(200);
                response.end(rows);
        }else{
                var params = JSON.parse(body);
                console.log(params.nombres);
                eliminarTrabajador(params.id);
		response.setHeader("Content-Type", "application/json");
        	response.setHeader("Access-Control-Allow-Origin", "*");
        	response.writeHead(200);
        	response.end(JSON.stringify({ success: true }));
		console.log("probando que devuelva algo");
        }
      	});
      	break;
      case "/actualizarRol":
    	var body = "";
      	request.on("data", function (chunk) {
        	body += chunk;
      	});
      	request.on("end", function () {
		console.log("Datos recibidos:", body);
        	if (body == "") {
                	console.log("preflight")
                	var rows = JSON.stringify({});
                	response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
                	response.setHeader("Access-Control-Allow-Methods", "GET, POST");
                	response.setHeader("Access-Control-Allow-Headers", "Content-Type");
                	response.setHeader("Content-Type","application/json"); // Agrega este encabezado
                	response.setHeader("Access-Control-Allow-Origin", "*");
                	response.writeHead(200);
                	response.end(rows);
        	}else{
			 var params = JSON.parse(body);
                	console.log(params.nombres);
                	actualizarRol(response, params.idRol, params.nuevoRol);
                	response.setHeader("Content-Type", "application/json");
                	response.setHeader("Access-Control-Allow-Origin", "*");
                	response.writeHead(200);
                	response.end(JSON.stringify({ success: true }));
                	console.log("probando que devuelva algo");
        	}
        });
        break;
      case "/eventos":
  	  obtenerEventos(request, response);
  	break;
      case "/crearComite":
  	var body = "";
  	request.on("data", function (chunk) {
  	  body += chunk;
  	});
  	request.on("end", function () {
    		if (body == "") {
      			console.log("preflight");
    			var rows = JSON.stringify({});
      			response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
      			response.setHeader("Access-Control-Allow-Methods", "GET, POST");
      			response.setHeader("Access-Control-Allow-Headers", "Content-Type");
      			response.setHeader("Content-Type", "application/json");
      			response.setHeader("Access-Control-Allow-Origin", "*");
      			response.writeHead(200);
      			response.end(rows);
    		} else {
      			var params = JSON.parse(body);
      			console.log(params);

      			// Obtener los datos del comité del cuerpo de la solicitud
      			const eventoId = params.eventoId;
      			const trabajadores = params.trabajadores;
			
    			crearComite(response, eventoId, trabajadores);
// Aquí debes agregar la lógica para crear el comité en la base de datos
      			// Puedes usar los datos recibidos (eventoId y trabajadores) para realizar las operaciones necesarias

      			// Por ejemplo, aquí se muestra un mensaje de éxito y se envía una respuesta al cliente
      			const responseJson = { success: true, message: "Comité creado exitosamente" };
      			response.setHeader("Content-Type", "application/json");
      			response.setHeader("Access-Control-Allow-Origin", "*");
      			response.writeHead(200);
      			response.end(JSON.stringify(responseJson));
    		}
  	});
  	break;
      case "/comites":
  client.query(
    "SELECT c.id, e.nombre AS evento, ARRAY_AGG(t.nombres || ' ' || t.apellidos) AS trabajadores " +
    "FROM Comites c " +
    "INNER JOIN Eventos e ON c.id_evento = e.id " +
    "INNER JOIN Candidatos ca ON c.id = ca.id_comite " +
    "INNER JOIN roles t ON ca.id_trabajador = t.id " +
    "GROUP BY c.id, e.nombre",
    (error, results) => {
      if (error) {
        console.error("Error al obtener los comités:", error);
        response.statusCode = 500;
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ success: false, error: "Error al obtener los comités" }));
      } else {
        const comites = results.rows;
	console.log(comites);
	response.setHeader('Access-Control-Allow-Origin', '*'); // Permitir solicitudes desde cualquier origen
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST'); // Permitir métodos GET y POST
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Permitir el encabezado Content-Type

        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({success: true, comites: comites}));
      }
    }
  );
  	  break;
	case "/eliminarComite":
		if(request.method === "POST") {
    		response.setHeader("Access-Control-Allow-Origin", "*");
    		response.setHeader("Access-Control-Allow-Methods", "POST");
    		response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    		let body = "";
    		request.on("data", (chunk) => {
      			body += chunk.toString();
    		});
    		request.on("end", () => {
      			const { idComite } = JSON.parse(body);
			// Eliminar el comité de la base de datos
      			const eliminarComiteQuery = "DELETE FROM Comites WHERE id = $1";
      			client.query(eliminarComiteQuery, [idComite], (error) => {
        			if (error) {
          				console.error("Error al eliminar el comité:", error);
          				response.statusCode = 500;
          				response.setHeader("Content-Type", "application/json");
          				response.end(JSON.stringify({ success: false, error: "Error al eliminar el comité" }));
        			} else {
          				// Eliminar los candidatos relacionados con el comité
          				const eliminarCandidatosQuery = "DELETE FROM Candidatos WHERE id_comite = $1";
          				client.query(eliminarCandidatosQuery, [idComite], (error) => {
              					if (error) {
              						console.error("Error al eliminar los candidatos:", error);
              						response.statusCode = 500;
              						response.setHeader("Content-Type", "application/json");
              						response.end(JSON.stringify({ success: false, error: "Error al eliminar el comité" }));
              					} else {
							response.setHeader("Access-Control-Allow-Origin", "*");
    							response.setHeader("Access-Control-Allow-Methods", "POST");
    							response.setHeader("Access-Control-Allow-Headers", "Content-Type");
              						response.setHeader("Content-Type", "application/json");
              						response.end(JSON.stringify({ success: true, message: "Comité eliminado exitosamente" }));
            					}
          				});
        			}
      			});
    		});
		}else{
			response.end();
		}
  		break;
      
    }
});




server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
