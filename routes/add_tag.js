var express = require('express');
var router = express.Router();
var db = require('../config/db');
var fs = require('fs');

router.post('/', function (req, res) {
    if (!(req.session.logged_user)) {
		res.redirect('/');
	} 
	else {
        var post = req.body;
        var tag = post.tag;
        db.query(`SELECT * FROM tags WHERE tag_name=?`, [tag], function(err, rows, res0) {
            if (err) {
				throw err;
			}
			if (!(rows[0])) {
                db.query(`INSERT INTO tags (tag_name) VALUES (?)`, [tag], function (err, res1) {
                    if (err) {
                        throw err;
                    }
                });			
			}
        });
        res.send(); 
    }
})


module.exports = router;