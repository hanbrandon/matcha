var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var db = require('../config/db');
var nodemailer = require("nodemailer");

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
		var title = 'Matcha - Forgot Password?';
		var err = req.session.err;
		delete req.session.err;
		var logged_user = req.session.logged_user;
		res.render('forgotpw', { title : title,
								error : err,
								logged_user : logged_user,
								logged_user_id: req.session.logged_user_id });
	}
});

router.post('/', function(req, res) {
	if (req.session.logged_user) {
		res.redirect('/');
	}
	var post = req.body;
	if (post.username_email) {
		var ue = post.username_email;
		db.query(`SELECT * FROM users WHERE username=? or email=?`, [ue, ue], function(err, rows, res0) {
			if (err) {
				throw err;
			}
			if (rows[0]) {
				var username = rows[0]["username"];
				var email = rows[0]["email"];
				db.query(`SELECT * FROM forgotpw WHERE username=?`, [username], function(err, rows, res1) {
					if (rows[0]) {						
						//RESEND EMAIL
						var host=req.get('host');
						var token = rows[0].token;
						var link="http://" + host + "/forgotpw/verify?id=" + token + "&email=" + email;
						var mailOptions = {
							to : email,
							from : 'no-reply@matcha.com',
							subject : "Matcha | Password Reset Link",
							html : "Hello,<br> Please Click on the link to reset your password.<br><a href="+link+">Click here to verify</a>" 
						}
						smtpTransport.sendMail(mailOptions, function(error, response){
						if(error){
							if (req.session.username) { delete req.session.username; }
							if (req.session.email) { delete req.session.email; }
							throw error;
						} else {
							if (req.session.username) { delete req.session.username; }
							if (req.session.email) { delete req.session.email; }
							res.redirect("/forgotpw");
							}
						});
					}
					else { //add in to forgotpw db
						db.query(`INSERT INTO forgotpw (username, email, token) VALUES (?, ?, ?)`, [username, email, token], function(err, res2) {
							if (err) {
								req.session.error = "Unable to create reset link";
								res.redirect('/forgotpw');
							} else {
								//Let's send email reset link email.
								var data = String(Math.floor((Math.random() * 100) + 54));
								var token = crypto.createHash('md5').update(data).digest('hex');
								var host=req.get('host');
								var link="http://" + host + "/forgotpw/verify?id=" + token + "&email=" + email;
								var mailOptions = {
									to : email,
									from : 'no-reply@matcha.com',
									subject : "Matcha | Password Reset Link",
									html : "Hello,<br> Please Click on the link to reset your password.<br><a href="+link+">Click here to reset password.</a>" 
								}
								smtpTransport.sendMail(mailOptions, function(error, response){
								if(error){
									if (req.session.username) { delete req.session.username; }
									if (req.session.email) { delete req.session.email; }
									throw error;
								} else {
									if (req.session.username) { delete req.session.username; }
									if (req.session.email) { delete req.session.email; }
									res.redirect("/forgotpw");
									}
								});
							}
						});
					}
				});
			} else {
				req.session.err = "Account does not exist!";
				res.redirect('/forgotpw');
			}
		});
	} else {
		req.session.err = "Unknown access!";
		res.redirect('/forgotpw');
	}
});


router.get('/verify',function(req,res){
	if (req.session.logged_user) 
	{
		res.redirect('/');
	}
	else 
	{
		var title = "Matcha - Reset Password";
		if (!req.query.id || !req.query.email) {
			res.render('/login', { title : title ,
				message : `Invalid approach`,
				});
		}
		var token = req.query.id;
		var email = req.query.email;
		var logged_user;
		var error = req.session.err;
		db.query(`SELECT * FROM forgotpw WHERE email=? AND token=?`, [email, token], function(err, rows, res0) {
			if (err) {
				throw err;
			}
			if(rows[0]) {
				db.query(`SELECT * FROM users WHERE email=?`, [email], function(err, rows, res1) {
					if (err) {
						throw err;
					}
					if (rows[0]) {
						logged_user = rows[0]['username'];
						res.render('resetpw', { title : title ,
												logged_user : logged_user,
												logged_user_id: req.session.logged_user_id,
												error: error,
												email : email,
												token : token,
												});
					} else {
						res.render('forgotpw', { title : title ,
												logged_user : logged_user,
												logged_user_id: req.session.logged_user_id,
												error : "Invalid link.",
												});
					}
				})
			} else {
				res.render('forgotpw', { title : title ,
										logged_user : logged_user,
										logged_user_id: req.session.logged_user_id,
										error : "Invalid link",
										});
			}
		});
	}
});

module.exports = router;