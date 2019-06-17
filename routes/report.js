var express = require('express');
var router = express.Router();
var db = require('../config/db');
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "matcha.tester@gmail.com",
        pass: "Qlalfqjsgh123"
    }
});

router.post('/', function (req, res) {
    if (!(req.session.logged_user)) {
		res.redirect('/');
	} 
	else {
        var post = req.body;
        var id = post.id;
        var user = post.user;
        var user_email;
        var reported_user;
        db.query(`SELECT * FROM users WHERE id=?`, [id], function(err, rows, res0) {
            if (err) {
				throw err;
			}
			if (rows[0]) {
                reported_user = rows[0]["username"];
                db.query(`SELECT * FROM users WHERE username=?`, [user], function(err, rows, res1) {
                    if (err) {
                        throw err;
                    }
                    if (rows[0]) {
                        user_email = rows[0]["email"];
                        var host=req.get('host');
                        var mailOptions = {
                            to : "matcha.tester@gmail.com",
                            from : user_email,
                            subject : "Matcha | "+user+ " reported someone!",
                            html : "Hello,<br> " + user + " reported username: " + reported_user + "."
                        }
                        smtpTransport.sendMail(mailOptions, function(error, response){
                        if(error){
                            res.send("FAIL");
                            throw error;
                        } else {
                            res.send("SUCCESS");
                            }
                        });
                    }
                    else {
                        res.send("FAIL");
                    }
                });
            }
            else {
                res.send("FAIL");
            }
        });
    }
})

router.post('/block', (req, res) => {
    var post = req.body;
    var from_id = post.from_id;
    var to_id = post.to_id;
    db.query(`INSERT INTO block (from_id, to_id) VALUES (?, ?)`, [from_id, to_id], (err) => {
        if (err) throw err;
        else {
            db.query(`DELETE FROM like_stat WHERE (from_id=? AND to_id=?) OR (from_id=? AND to_id=?)`, [from_id, to_id, to_id, from_id], (err0) => {
                if (err0) throw err0;
                else {
                    res.send("SUCCESS");
                }
            });
        }
    });
});


module.exports = router;