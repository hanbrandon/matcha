var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var db = require('../config/db');

router.get('/', function(req, res) {
	if (req.session.logged_user) {
		res.redirect('/');
	} else {
		var title = 'Matcha - Login';
		var err = req.session.err;
		delete req.session.err;
		var success = req.session.success;
		delete req.session.success;
		var logged_user = req.session.logged_user;
		res.render('login', { title : title,
								error : err,
								success : success,
								logged_user : logged_user,
								logged_user_id: req.session.logged_user_id });
	}
});

router.post('/', function(req, res) {
	if (req.session.logged_user) {
		res.redirect('/');
	}
	var post = req.body;
	if (post.passwd && post.username) {
		var username = post.username;
		var passwd = post.passwd;
		var hash_passwd = crypto.createHash('whirlpool').update(passwd).digest('hex');
		db.query(`SELECT * FROM users WHERE username=? AND passwd=?`, [username, hash_passwd], function(err, rows, res0) {
			if (err) {
				throw err;
			}
			if (rows[0]) {
				if (rows[0].verified == 0) {
					req.session.err = "Please verify your email";
					res.redirect('/login');
				} else {
					req.session.logged_user = username;
					req.session.logged_user_id = rows[0].id;
					db.query(`UPDATE users SET online = 1 WHERE username=?`, [username], function(error) {
						if (error) {
							throw error;
						} else if (rows[0]["firstLogin"] == 1 ) {
							res.redirect('/edit_profile');
						} else {
							res.redirect('/');
						}
					})
				}
			} else {
				req.session.err = "Invalid login / password";
				res.redirect('/login');
			}
		});
	} else {
		req.session.err = "Unknown access!";
		res.redirect('/login');
	}
});

module.exports = router;