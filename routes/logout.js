var express = require('express');
var router = express.Router();
var db = require('../config/db');

router.get('/', function(req, res) {
    if (req.session && req.session.logged_user) {
        db.query(`UPDATE users SET online=0, visit=? WHERE username=?`, [new Date(), req.session.logged_user], function(err) {
            if (err) {
                throw err;
            }
        })
    }
	req.session.destroy(function(err){
		res.redirect('/login');
	});
});

module.exports = router;