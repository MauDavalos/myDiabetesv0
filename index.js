const mysql = require('mysql');
const express = require('express');
var app = express();
const bodyparser = require('body-parser');
var session = require('express-session');

app.use(bodyparser.json());
app.use(session({secret:"mau"}));

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





app.post("/verify", (req,res) => {
    var username = req.body.username;
  var password = req.body.password;
  
  // console.log(username+' '+password)
  if (username && password) {
       mysqlConnection.query('SELECT * FROM admin WHERE nombreUsuario = ? AND password = ?', [username, password], (err, rows, fields) => {
          if (rows.length > 0) {
              req.session.loggedin = true;
              req.session.username = username;
              res.send({bool:true , string: 'admin'});
              res.end();
              
          
          }else{
            mysqlConnection.query('SELECT * FROM doctor WHERE nombreUsuario = ? AND password = ?', [username, password], (err, rows, fields) => {
                if (rows.length > 0) {
                    req.session.loggedin = true;
                    req.session.username = username;
                    res.send({bool:true , string: 'doctor'});
                    
              
                }else{
                    mysqlConnection.query('SELECT * FROM paciente WHERE nombreUsuario = ? AND password = ?', [username, password], (err, rows, fields) => {
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

app.get("/paciente/:id", (req,res) => {
    console.log("Devolviendo paciente con id: " + req.params.id)
    const userId = req.params.id
    const queryString = "select * from paciente where cedula_pac = ?"
     mysqlConnection.query(queryString, [userId], (err, rows, fields) => {
        res.json(rows)
    })
    //res.end()
})

app.get("/medico/:id", (req,res) => {
    console.log("Devolviendo medico con id: " + req.params.id)
    const userId = req.params.id
    const queryString = "select * from doctor where cedula_doc = ?"
     mysqlConnection.query(queryString, [userId], (err, rows, fields) => {
        res.json(rows)
    })
    //res.end()
})

app.get("/admin/:id", (req,res) => {
    console.log("Devolviendo admin con id: " + req.params.id)
    const userId = req.params.id
    const queryString = "select * from admin where cedula_adm = ?"
     mysqlConnection.query(queryString, [userId], (err, rows, fields) => {
        res.json(rows)
    })
    //res.end()
})

app.get("/getPacientes/:id", (req,res) => {
    console.log("Devolviendo lista de pacientes de médico con cédula: " + req.params.id)
    const userId = req.params.id
    const queryString = "SELECT id_pac, paciente.tipoUsuario, cedula_pac, nombre_pac, apellido_pac, paciente.nombreUsuario, telefono_pac, edad_pac, nivelGlucosa, sexo_pac, paciente.id_doc FROM paciente LEFT JOIN doctor ON paciente.id_doc = doctor.id_doc WHERE doctor.cedula_doc = ?"
     mysqlConnection.query(queryString, [userId], (err, rows, fields) => {
        res.json(rows)
    })
    //res.end()
})
