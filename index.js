var path = require('path');
var sanitizeHtml = require('sanitize-html');
const express = require('express');
const app = express();
var bodyParser = require('body-parser'),
	helmet = require('helmet'),
	compression = require('compression'),
	session = require('express-session');

// db related
var MySQLStore = require('express-mysql-session')(session),
	db = require('./config/db');

// routes
var createRouter = require('./routes/create'),
	loginRouter = require('./routes/login'),
	logoutRouter = require('./routes/logout'),
	profileRouter = require('./routes/edit_profile');
	chatRouter = require('./routes/chat');
	uploadRouter = require('./routes/upload');
	deleteRouter = require('./routes/delete');
	profileImgRouter = require('./routes/profile_pic');
	addTagRouter = require('./routes/add_tag');
	indexRouter = require('./routes/load_index');
	forgotpwRouter = require('./routes/forgotpw');
	resetpwRouter = require('./routes/resetpw');
	likeRouter = require('./routes/like_user');
	searchTags = require('./routes/search_tags');
	notiRouter = require('./routes/notification');
	infoRouter = require('./routes/profile_info');
	reportRouter = require('./routes/report');




// chat
var http = require('http').Server(app),
	io = require('socket.io')(http, {
		pingTimeout: 60000,
	}),
	sharedsession = require('express-socket.io-session');

// set view engine as HTML using ejs
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// security
app.use(helmet());
// allow css / image implementation
app.use(express.static('public'));
// shortens post method reading
app.use(bodyParser.urlencoded({ extended: false }));
// compresses view (to reduce network data transfer)
app.use(compression());
// set session
var sessionInfo =  {
	secret: 'CTvMA5ytU8', // secret key to verify session
	resave: false,
	saveUninitialized: true,
	store: new MySQLStore({}, db)
};
app.use(session(sessionInfo));
io.use(sharedsession(session(sessionInfo), {
	autoSave:true
}));

// chat
var people = [];
io.sockets.on('connection', function(socket) {
	db.query(`UPDATE users SET online=1, visit=? WHERE username=?`, [new Date(), socket.handshake.session.logged_user], function(err) {
		if (err) throw err;
	});
	if (socket.handshake.session.logged_user) {
		people[socket.handshake.session.logged_user] = socket.id;
	}
	// change to username_related chatroom using mysql db
    socket.on('disconnect', function() {
        db.query(`UPDATE users SET online=0 WHERE username=?`, [socket.handshake.session.logged_user], function(err) {
			if (err) throw err;
		});
	})
	socket.on('ping', msg => {
		alert(msg);
	});
	socket.handshake.session.save();
    socket.on('chat_message', function(message) {
		var from = message.by;
		var to = message.to;
		var msg = message.message;
		var date = new Date();
		var options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
		date = date.toLocaleDateString("en-US", options);
		db.query(`SELECT * FROM users WHERE username=?`, [from], function(err, rows) {
			if (err) throw err;
			if (rows && rows[0]) {
				db.query(`INSERT INTO chats (from_id, to_id, chat, time) VALUES (?, ?, ?, ?)`, [rows[0].id, to, msg, date], function (err) {
					if (err) throw err;
					db.query(`SELECT username, image_1 FROM users WHERE id = ?`, [to], function(err0, names) {
						io.to(global.people[names[0].username]).emit('chat_message', {id: rows[0].id, from: from, msg: msg, date: date, profile_pic: rows[0].image_1});
						io.to(global.people[socket.handshake.session.logged_user]).emit('chat_message', {from: from, msg: msg, date: date, profile_pic: rows[0].image_1});
					});
				});
			}
		});
	});

	socket.on('notification', function(data) {
		var to = data.to;
		var to_id = data.to_id;
		var from_id = data.from_id;
		var notice = data.notice;
		var date = new Date();
		var options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
		date = date.toLocaleDateString("en-US", options);
		//db.query(`SELECT * FROM users WHERE username = ?`, [from_id])
		db.query(`INSERT INTO notification (from_id, to_id, notice, time) VALUES (?, ?, ?, ?)`, [from_id, to_id, notice, date], (err) => {
			if (err) throw err;
			else {
				db.query(`SELECT * FROM users WHERE id = ?`, [from_id], (err, user) => {
					if (err) throw err;
					if (user && user[0]) {
						var fullname = user[0].firstname + " " + user[0].lastname;
						io.to(global.people[to]).emit('notification', {val:1, from_id:from_id, from_name: fullname, notice:notice, date:date});
					}
				})
			}
		});
	});
});
global.people = people;

app.get('/', function(req, res) {
	var title = 'Matcha';
	var logged_user = req.session.logged_user;
	db.query(`SELECT * from users WHERE username=?`, [logged_user], (err, user) => {
		if (err) throw err;
		var user_dob;
		if (user && user[0]) {
			if (!user[0].firstname || !user[0].lastname || !user[0].dob || !user[0].gender) {
				res.redirect('/edit_profile');
			} else if (user[0].firstname && user[0].lastname && user[0].dob && user[0].gender && !user[0].image_1) {
				res.redirect('/profile_pic');
			} else {
				user_dob = user[0].dob;
				res.render('index', { title : title,
					logged_user : logged_user,
					logged_user_dob: user_dob,
					logged_user_id : req.session.logged_user_id });
			}
			
		} else {
			res.redirect('/login');
		}
	});
});

app.use(`/create`, createRouter);
app.use(`/login`, loginRouter);
app.use(`/logout`, logoutRouter);
app.use(`/edit_profile`, profileRouter);
app.use(`/chat`, chatRouter);
app.use(`/upload`, uploadRouter);
app.use(`/delete`, deleteRouter);
app.use(`/profile_pic`, profileImgRouter);
app.use(`/add_tag`, addTagRouter);
app.use(`/load_index`, indexRouter);
app.use(`/forgotpw`, forgotpwRouter);
app.use(`/resetpw`, resetpwRouter);
app.use(`/like_user`, likeRouter);
app.use('/search_tags', searchTags);
app.use(`/notification`, notiRouter);
app.use(`/profile_info`, infoRouter);
app.use(`/report`, reportRouter);

// handle invalid url
app.use(function(req, res, next) {
	res.status(404).send(`Sorry can't find that page!`);
});

// handle invalid request
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500).send(`Something broke!`);
});

http.listen(3000, function() {
	console.log('app listening on port 3000!');
});