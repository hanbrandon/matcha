var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var db = require('../config/db');


router.post('/', function(req, res) {
	if (req.session.logged_user) {
		res.redirect('/');
    }
    var post = req.body;
    if (post.email && post.new_password && post.verify_password && post.token) 
    {
        var passwd = post.new_password;
        var passwd_conf = post.verify_password;
        var email = post.email;
        var token = post.token;
        var host=req.get('host');
        var link="http://" + host + "/forgotpw/verify?id=" + token + "&email=" + email;
        if (passwd != passwd_conf) {
			req.session.err = "Your passwords does not match.";
            res.redirect(link);
        }
        else if (passwd.length < 8 || passwd.length > 25) {
			req.session.err = "Password must be between 8 to 25 letters";
            res.redirect(link);
        }
        else if (passwd.search(/[0-9]/) == -1 || passwd.search(/[A-Z]/) == -1 
                || passwd.search(/[a-z]/) == -1 || passwd.search(/\W/) == -1) {
            req.session.err = "Password must include at least one letter, CAPS, number, and special character.";
            res.redirect(link);
        }
        else {
            var hash_passwd = crypto.createHash('whirlpool').update(passwd).digest('hex');
            db.query('UPDATE users SET passwd=?, email=?', [hash_passwd, email], function(error) {
                if (error) {
					throw error;
                }
                else {
                    db.query('DELETE FROM forgotpw WHERE email=?', [email], function(error) {
                        if (error) {
                            throw error;
                        }
                        req.session.success = "Login with new password";
                        res.redirect('/login');
                    });
                }
            });
        }
    }
});

module.exports = router;