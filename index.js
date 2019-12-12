const mysql = require('mysql');
const express = require('express');
var app = express();
const bodyparser = require('body-parser');
var session = require('express-session');

app.use(bodyparser.json());
app.use(session({secret:"mau"}));
app.use(bodyparser.urlencoded({ extended: true }));

var myPORT = process.env.PORT || 3000; 

/*var mysqlConnection = mysql.createConnection({
    host: 'us-cdbr-iron-east-05.cleardb.net',
    user: 'bfe2087eee5570',
    password: 'd31eaec8',
    database: 'heroku_0bc6c32399030a7'
});*/

const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mydiabetes'
});


///////handle disconnection
/*var connection;

function handleDisconnect() {
  connection = mysql.createConnection(mysqlConnection); // Recreate the connection, since
                                                  // the old one cannot be reused.

connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });  

  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();*/


mysqlConnection.connect((err) => 
{
    if (!err)
        console.log('DB connection succeded.');
    else
        console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2));
});



app.listen(myPORT, () => console.log('Express server is runnig at port no : 3000'));

var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;




app.post("/verify", (req,res) => {
  var cedula = req.body.username;
  var password = req.body.password;
  
  // console.log(username+' '+password)
  if (cedula && password) {
       mysqlConnection.query('SELECT * FROM admin WHERE cedula_adm = ? AND password = ?', [username, password], (err, rows, fields) => {
          if (rows.length > 0) {
              req.session.loggedin = true;
              req.session.username = username;
              res.send({bool:true , string: 'admin'});
              res.end();
              
          
          }else{
            mysqlConnection.query('SELECT * FROM doctor WHERE cedula_doc = ? AND password = ?', [username, password], (err, rows, fields) => {
                if (rows.length > 0) {
                    req.session.loggedin = true;
                    req.session.username = username;
                    res.send({bool:true , string: 'doctor'});
                    
              
                }else{
                    mysqlConnection.query('SELECT * FROM paciente WHERE cedula_pac = ? AND password = ?', [username, password], (err, rows, fields) => {
                        if (rows.length > 0) {
                            req.session.loggedin = true;
                            req.session.username = username;
                            res.send({bool:true , string: 'paciente'});
                            res.end();
                                      
                           
                        }else{
                            res.send(false);
                        }
              
                        res.end();
                
                    });
                }
        
            });
          }

      });

      

  } else {
      res.send('Please enter Username and Password!');
      res.end();
  }
})

// get pacientes

app.get("/paciente/:cedula", (req,res) => {
    console.log("Devolviendo paciente con id: " + req.params.id)
    const userId = req.params.id
    const queryString = "select * from paciente where cedula_pac = ?"
     mysqlConnection.query(queryString, [userId], (err, rows, fields) => {
        res.json(rows)
    })
    //res.end()
})

app.get("/doctor/:cedula", (req,res) => {
    console.log("Devolviendo doctor con id: " + req.params.id)
    const userId = req.params.id
    const queryString = "select * from doctor where cedula_doc = ?"
     mysqlConnection.query(queryString, [userId], (err, rows, fields) => {
        res.json(rows)
    })
    //res.end()
})



app.get("/admin/:cedula", (req,res) => {
    console.log("Devolviendo admin con id: " + req.params.id)
    const userId = req.params.id
    const queryString = "select * from admin where cedula_adm = ?"
     mysqlConnection.query(queryString, [userId], (err, rows, fields) => {
        res.json(rows)
    })
    //res.end()
})

app.get("/getPacientes/:cedula", (req,res) => {
    console.log("Devolviendo lista de pacientes de médico con cédula: " + req.params.id)
    const userId = req.params.id
    const queryString = "SELECT id_pac, paciente.tipoUsuario, cedula_pac, nombre_pac, apellido_pac, urgente, paciente.nombreUsuario, telefono_pac, edad_pac, nivelGlucosa, sexo_pac, paciente.id_doc FROM paciente LEFT JOIN doctor ON paciente.id_doc = doctor.id_doc WHERE doctor.cedula_doc = ?"
     mysqlConnection.query(queryString, [userId], (err, rows, fields) => {
        res.json(rows)
    })
    //res.end()
})

app.get("/getControles/:idPaciente", (req,res) => {
    console.log("Devolviendo controles del paciente con id: " + req.params.id)
    const userId = req.params.idPaciente
    const queryString = "SELECT * FROM control WHERE id_pac =?"
     mysqlConnection.query(queryString, [userId], (err, rows, fields) => {
        res.json(rows)
    })
    //res.end()
})

app.get("/getGlicemia/:idControl", (req,res) => {
    console.log("Devolviendo glicemias con idControl: " + req.params.id)
    const userId = req.params.idControl
    const queryString = "SELECT * FROM glicemia WHERE id_control =?"
     mysqlConnection.query(queryString, [userId], (err, rows, fields) => {
        res.json(rows)
    })
    //res.end()
})

app.post("/setGlicemia", (req,res) => {
   
    var nivelGlucosa = req.body.nivelGlucosa;
    var ayunas= req.body.ayunas;
    var desayuno= req.body.desayuno;
    var almuerzo= req.body.almuerzo;
    var merienda= req.body.merienda;
    var observaciones = req.body.observaciones;
    var id_control = req.body.id_control;

     console.log(nivelGlucosa+' '+id_control)
	if (nivelGlucosa && typeof ayunas !== 'undefined' && typeof desayuno !== 'undefined' && typeof almuerzo !== 'undefined' && typeof merienda !== 'undefined' && observaciones && id_control) { 
		mysqlConnection.query('INSERT INTO glicemia(fecha , nivelGlucosa , ayunas , desayuno, almuerzo, merienda, observaciones, id_control) VALUES(?,?,?,?,?,?,?,?)', [dateTime, nivelGlucosa, ayunas, desayuno, almuerzo, merienda, observaciones, id_control], (err, rows, fields) => {
            if (err) {
                throw err;
            }else{ 

                let alerta = activarUrgente(nivelGlucosa);
                let color = pintarSemaforo(nivelGlucosa);

                /*aqui se deberia obtener el id del paciente para hacer el INSERT

                mysqlConnection.query('INSERT INTO paciente (urgente) VALUES (?)', [alerta], (err, rows, fields) => {

                });*/

                /*aqui se deberia obtener el id del paciente para hacer el INSERT

                mysqlConnection.query('INSERT INTO semaforo (color) VALUES (?)', [alerta], (err, rows, fields) => {

                });*/ 


                
                res.send({bool: true, semaforo: color, urgente:alerta});


                
            } 		
			res.end();
		});
	} else {
		res.send('Ingrese datos de tabla glicemia!');
		res.end();
	}
})
//modificar fecha setGlicemia

app.post("/setDoctor", (req,res) => {
    var nombre = req.body.nombre;
    var tipoUsuario = req.body.tipoUsuario;
    var cedula_doc= req.body.cedula_doc;
    var apellido_doc= req.body.apellido_doc;
    var nombreUsuario= req.body.nombreUsuario;
    var password= req.body.password;
    var telefono_doc = req.body.telefono_doc;

     console.log(nombre+' '+apellido_doc+' '+cedula_doc)
	if (nombre && tipoUsuario && cedula_doc && apellido_doc && nombreUsuario && password && telefono_doc) { 
		mysqlConnection.query('INSERT INTO doctor(nombre_doc , tipoUsuario , cedula_doc , apellido_doc , nombreUsuario , password , telefono_doc) VALUES(?,?,?,?,?,?,?)', [nombre, tipoUsuario, cedula_doc, apellido_doc, nombreUsuario, password, telefono_doc], (err, rows, fields) => {
            if (err) {
                throw err;
            }else{ 
                
                res.send(true)
            } 		
			res.end();
		});
	} else {
		res.send('Ingrese datos de tabla doctor!');
		res.end();
	}
})

app.post("/setPaciente", (req,res) => {
    var nombre = req.body.nombre;
    var urgente = req.body.urgente;
    var tipoUsuario = req.body.tipoUsuario;
    var cedula_pac= req.body.cedula_pac;
    var apellido_pac= req.body.apellido_pac;
    var nombreUsuario= req.body.nombreUsuario;
    var password= req.body.password;
    var telefono_pac = req.body.telefono_pac;
    var edad_pac = req.body.edad_pac;
    var nivelGlucosa = req.body.nivelGlucosa;
    var sexo_pac = req.body.sexo_pac;
    var id_doc = req.body.id_doc;

    /*mysqlConnection.query('SELECT * FROM paciente WHERE cedula_pac =?', [cedula_pac], (err, rows, fields)=>{

        if (rows.length <= 0) {

            mysqlConnection.query('INSERT INTO control ()')


        }

        
    })*/
    var IdPac;

     console.log(nombre+' '+apellido_pac+' '+cedula_pac)
	if (nombre&&typeof urgente &&tipoUsuario&&cedula_pac&&apellido_pac&&nombreUsuario&&password&&telefono_pac&&edad_pac&&nivelGlucosa&&sexo_pac&&id_doc) { 
        mysqlConnection.query('INSERT INTO paciente(nombre_pac , urgente, tipoUsuario , cedula_pac , apellido_pac , nombreUsuario , password , telefono_pac, edad_pac, nivelGlucosa, sexo_pac, id_doc) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)', 
        [nombre,urgente,tipoUsuario, cedula_pac, apellido_pac, nombreUsuario, password, telefono_pac, edad_pac, nivelGlucosa, sexo_pac, id_doc], (err, rows, fields) => {
            if (err) {
                throw err;
            }else{ 
                idPac = rows.insertId;
                console.log(rows.insertId);
                //res.send('usuario creado');
                //res.end();
                

                mysqlConnection.query('SELECT * FROM control LEFT JOIN paciente ON paciente.id_pac = control.id_pac WHERE paciente.cedula_pac = ?', [cedula_pac], (err, result, fields)=>{

                    console.log(idPac);
                    console.log(result.length);
                    if (result.length < 1) {

                        console.log("no tiene controles");
            
                        mysqlConnection.query('INSERT INTO control (id_pac, id_doc, fechaInicio) VALUES(?,?,?)', [idPac,id_doc,date], (err, rows, fields)=> {
                           
                                console.log('Se ha creado un nuevo control');
                                res.send('Usuario y control creado');
                                res.end();
                            
                        });
            
            
                    }else{
                        console.log("tiene registros de controles");
                        //res.end();
                    }
            
                    //res.end();
                });
            } 		
            
			
		});
	} else {
		res.send('Ingrese datos de tabla paciente!');
		res.end();
    }

   
    

})

app.get("/time", (req, res) => {

 
    res.send(dateTime);
});

app.get("/activarUrgencia", (req, res) => {

    let alerta = activarUrgente(10)
    res.send({esUrgente: alerta});
});

app.get("/semaforo", (req, res) => {

    let color = pintarSemaforo(80)
    res.send({semaforo: color});
});


function activarUrgente(glucosa){

    if(glucosa<52||glucosa>200)
        return true;
        else
            return false;

  
    
  }

  function pintarSemaforo(glucosa){

    let estado;
    if(glucosa<52||glucosa>200)
        estado = "rojo";
        else if(glucosa<70||glucosa>140)
            estado = "amarillo";
            else
                estado = "verde";


    return estado;            
  }
  
  
