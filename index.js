const mysql = require('mysql');
const express = require('express');
var app = express();
const bodyparser = require('body-parser');
var session = require('express-session');

app.use(bodyparser.json());
app.use(session({secret:"mau"}));

var myPORT = process.env.PORT || 3000;
var myHOST = 'us-cdbr-iron-east-05.cleardb.net' || 'localhost';
var myUSER = 'bfe2087eee5570' || 'root';
var myPASSWORD = 'd31eaec8' || '';
var MYDB = 'heroku_0bc6c32399030a7'|| 'mydiabetes';

const mysqlConnection = mysql.createConnection({
    host: myHOST,
    user: myUSER,
    password: myPASSWORD,
    database: MYDB,
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if (!err)
        console.log('DB connection succeded.');
    else
        console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2));
});



app.listen(myPORT, () => console.log('Express server is runnig at port no : 3000'));





/*app.post("/verify", (req,res) => {
  	var username = req.body.username;
    var password = req.body.password;
    // console.log(username+' '+password)
	if (username && password) {
     	mysqlConnection.query('SELECT * FROM admin WHERE nombreUsuario = ? AND password = ?', [username, password], (err, rows, fields) => {
			if (rows.length > 0) {
				req.session.loggedin = true;
                req.session.username = username;
                res.send({bool:true , string: " estas loggeado como admin"});
			} else {
                //res.send("false")
                mysqlConnection.query('SELECT * FROM doctor WHERE nombreUsuario = ? AND password = ?', [username, password], (err, rows, fields) => {
                    if (rows.length > 0) {
                        req.session.loggedin = true;
                        req.session.username = username;
                        res.send({bool:true , string: " estas loggeado como doctor"});
            }else{
                mysqlConnection.query('SELECT * FROM paciente WHERE nombreUsuario = ? AND password = ?', [username, password], (err, rows, fields) => {
                    if (rows.length > 0) {
                        req.session.loggedin = true;
                        req.session.username = username;
                        res.send({bool:true , string: " estas loggeado como paciente"});

            }
           ////end 	
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
})*/

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


