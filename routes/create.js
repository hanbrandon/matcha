var express = require('express');
var router = express.Router();
var db = require('../config/db');
var crypto = require('crypto');
var iplocation = require('iplocation').default;
var nodemailer = require("nodemailer");

// email
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "matcha.tester@gmail.com",
        pass: "Qlalfqjsgh123"
    }
});

router.get('/', function(req, res) {
	if (req.session.logged_user) {
		res.redirect('/');
	} else {
		var title = 'Matcha - Create a new account';
		var err = req.session.err;
		delete req.session.err;
		var username = req.session.username;
		var email = req.session.email;
		var logged_user = req.session.logged_user;
		res.render('create', { title : title,
								error : err,
								username : username,
								email : email,
								logged_user : logged_user,
								logged_user_id: req.session.logged_user_id });
	}
});

router.post('/', function(req, res) {
	if (req.session.logged_user) {
		res.redirect('/');
	}
	var post = req.body;
	if (post.username && post.passwd && post.passwd_conf && post.email) {
		var username = post.username;
		var passwd = post.passwd;
		var passwd_conf = post.passwd_conf;
		var email = post.email;
		req.session.username = username;
		req.session.email = email;
		if (passwd != passwd_conf) {
			req.session.err = "Your passwords does not match.";
			res.redirect('/create');
		} else if (email.length > 200)  {
			req.session.err = "Invalid email";
			res.redirect('/create');
		} else if (passwd.length < 8 || passwd.length > 25) {
			req.session.err = "Password must be between 8 to 25 letters";
			res.redirect('/create');
		} else if (username.length < 8 || username.length > 25) {
			req.session.err = "Username must be between 8 to 25 letters";
			res.redirect('/create');
		} else if (passwd.search(/[0-9]/) == -1 || passwd.search(/[A-Z]/) == -1
				|| passwd.search(/[a-z]/) == -1 || passwd.search(/\W/) == -1) {
			req.session.err = "Password must include at least one letter, CAPS, number, and special character.";
			res.redirect('/create');
		} else {
			var hash_passwd = crypto.createHash('whirlpool').update(passwd).digest('hex');
			db.query(`SELECT * FROM users WHERE username=? OR email=?`, [username, email], function(err, rows, res0) {
				if (err) {
					throw err;
				}
				if (rows[0] && rows[0]['username'] == username) {
					req.session.err = "Username already taken!";
					res.redirect('/create');
				}
				else if (rows[0] && rows[0]['email'] == email) {
					req.session.err = "Email already taken!";
					res.redirect('/create');
				} else {
					db.query(`INSERT INTO users (username, passwd, email) VALUES (?, ?, ?)`, [username, hash_passwd, email], function(err, res1) {
						if (err) {
							req.session.error = "Unable to create a new user";
							res.redirect('/create');
						} else {
							iplocation(req.ip, [], function(err, res) {
								if (!res || !res['city']) {
									db.query('UPDATE users SET city = "Fremont", latitude = 37.5486, longitude = -122.0586 WHERE username = ?', [username], function(error) {
										if (error) {
											throw error;
										}
									});
								} else {
									db.query('UPDATE users SET city = ?, latitude = ?, longitude = ? WHERE username = ?', [res['city'], res['lat'], res['lon'], username], function(error) {
										if (error) {
											throw error;
										}
									});
								}
							});
							req.session.success = "You have successfully created your account! Please verify your email.";
							// email verification
							var rand=Math.floor((Math.random() * 100) + 54);
							var host=req.get('host');
							var link="http://" + host + "/create/verify?id=" + rand + "&email=" + email;
							db.query(`INSERT INTO verification (email, token) VALUES (?, ?)`, [email, rand], function(err, res0) {
								if (err) {
									throw err;
								} else {
									var mailOptions = {
										to : email,
										from : 'no-reply@matcha.com',
										subject : "Matcha | Please confirm your Email account",
										html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
									}
									smtpTransport.sendMail(mailOptions, function(error, response){
									if(error){
										if (req.session.username) { delete req.session.username; }
										if (req.session.email) { delete req.session.email; }
										throw error;
									} else {
										if (req.session.username) { delete req.session.username; }
										if (req.session.email) { delete req.session.email; }
										res.redirect("/login");
										}
									});
								}
							});
							// verification ends
						}
					});
				}
			});
		}
	} else {
		req.session.err = "Unknown access!";
		res.redirect('/create');
	}
});

router.get('/verify',function(req,res){
	var title = "Matcha - Verification";
	var logged_user = req.session.logged_user;
	if (!req.query.id || !req.query.email) {
		res.render('verify', { title : title ,
			message : `Invalid approach`,
			logged_user : logged_user,
			logged_user_id: req.session.logged_user_id });
	}
	var token = req.query.id;
	var email = req.query.email;
	db.query(`SELECT * FROM verification WHERE email=? AND token=?`, [email, token], function(err, rows, res0) {
		if (err) {
			throw err;
		}
		if(rows[0]) {
			db.query(`SELECT * FROM users WHERE email=? AND verified=0`, [email], function(err, rows, res1) {
				if (err) {
					throw err;
				}
				if (rows[0]) {
					db.query(`UPDATE users SET verified=1 WHERE email=? AND username=?`, [email, rows[0]['username']], function(err, rows, res2) {
						if (err) {
							throw err;
						} else {
							db.query(`DELETE FROM verification WHERE email=?`, [email], function(err, rows, res3) {
								if (err) {
									throw err;
								} else {
									res.render('verify', { title : title ,
															message : `Email ${email} has been sucessfully verified!`,
															logged_user : logged_user,
															logged_user_id: req.session.logged_user_id });
								}
							});
						}
					});
				} else {
					res.render('verify', { title : title ,
											message : "Invalid email or account already verified.",
											logged_user : logged_user,
											logged_user_id: req.session.logged_user_id });
				}
			})
		} else {
			res.render('verify', { title : title ,
									message : "Unable to verify the email.",
									logged_user : logged_user,
									logged_user_id: req.session.logged_user_id });
		}
	});
});

module.exports = router;