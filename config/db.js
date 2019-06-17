var mysql = require('mysql');

var connection = mysql.createConnection({
	host     : '192.168.99.100',
	port     : '3306',
	user     : 'root',
	password : 'root',
	database : 'matcha'
});

connection.connect();

module.exports = connection;