var mysql = require('mysql');

var connection = mysql.createConnection({
	host     : '192.168.99.100',
	port     : '3306',
	user     : 'root',
	password : 'root',
});

connection.connect();

connection.query(`CREATE DATABASE IF NOT EXISTS matcha`);
console.log(`Database 'matcha' created`);
connection.query(`USE matcha`);

connection.query(`CREATE TABLE IF NOT EXISTS users (
					id INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
					username VARCHAR(255) NOT NULL,
					passwd VARCHAR(255) NOT NULL,
					email VARCHAR(255) NOT NULL,
					firstname VARCHAR(255),
					lastname VARCHAR(255),
					gender VARCHAR(255),
					dob DATE,
					occupation VARCHAR(255),
					school VARCHAR(255),
					sexual_pref VARCHAR(255),
					join_date DATE,
					tags MEDIUMTEXT,
					notification BOOLEAN DEFAULT true,
					image_1 VARCHAR(255),
					image_2 VARCHAR(255),
					image_3 VARCHAR(255),
					image_4 VARCHAR(255),
					image_5 VARCHAR(255),
					verified BOOLEAN DEFAULT false,
					firstLogin BOOLEAN DEFAULT true,
					visit DATE,
					online BOOLEAN DEFAULT false,
					city VARCHAR(255),
					latitude FLOAT,
					longitude FLOAT
					)`);

connection.query(`CREATE TABLE IF NOT EXISTS forgotpw (
					id INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
					username VARCHAR(255) NOT NULL,
					email VARCHAR(255) NOT NULL,
					token VARCHAR(255) NOT NULL
					)`);

connection.query(`CREATE TABLE IF NOT EXISTS like_stat (
					id INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
					from_id INT(9) UNSIGNED,
					to_id INT(9) UNSIGNED,
					FOREIGN KEY (from_id) REFERENCES users (id)
						ON DELETE CASCADE
						ON UPDATE CASCADE,
					FOREIGN KEY (to_id) REFERENCES users (id)
						ON DELETE CASCADE
						ON UPDATE CASCADE,
					likes BOOLEAN
					)`);

connection.query(`CREATE TABLE IF NOT EXISTS block (
					id INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
					from_id INT(9) UNSIGNED,
					to_id INT(9) UNSIGNED,
					FOREIGN KEY (from_id) REFERENCES users (id)
						ON DELETE CASCADE
						ON UPDATE CASCADE,
					FOREIGN KEY (to_id) REFERENCES users (id)
						ON DELETE CASCADE
						ON UPDATE CASCADE
					)`);

connection.query(`CREATE TABLE IF NOT EXISTS chats (
					id INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
					from_id INT(9) UNSIGNED,
					to_id INT(9) UNSIGNED,
					FOREIGN KEY (from_id) REFERENCES users (id)
						ON DELETE CASCADE
						ON UPDATE CASCADE,
					FOREIGN KEY (to_id) REFERENCES users (id)
						ON DELETE CASCADE
						ON UPDATE CASCADE,
					chat TEXT NOT NULL,
					time TEXT NOT NULL
					)`)

connection.query(`CREATE TABLE IF NOT EXISTS notification (
					id INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
					from_id INT(9) UNSIGNED,
					to_id INT(9) UNSIGNED,
					FOREIGN KEY (from_id) REFERENCES users (id)
						ON DELETE CASCADE
						ON UPDATE CASCADE,
					FOREIGN KEY (to_id) REFERENCES users (id)
						ON DELETE CASCADE
						ON UPDATE CASCADE,
					notice TEXT NOT NULL,
					time TEXT NOT NULL,
					checked BOOLEAN DEFAULT false
					)`);

connection.query(`CREATE TABLE IF NOT EXISTS tags (
					id INT(9) UNSIGNED AUTO_INCREMENT PRIMARY KEY NOT NULL,
					tag_name VARCHAR(255) NOT NULL
					)`);

connection.query(`CREATE TABLE IF NOT EXISTS verification (
					email VARCHAR(255) NOT NULL,
					token VARCHAR(255) NOT NULL
					)`)

connection.end();