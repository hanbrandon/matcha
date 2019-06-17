var express = require('express');
var router = express.Router();
var db = require('../config/db');
var fs = require('fs');

router.post('/', function (req, res) {
    if (!(req.session.logged_user)) {
		res.redirect('/');
	} 
	else {
        db.query(`SELECT * FROM tags`, function(err, rows) {
            if (err) {
                console.log("error");
				throw err;
			}
			if (rows[0]) {
                res.send(rows);
			}
        });
         // 파일과 예외 처리를 한 뒤 브라우저로 응답해준다.
    }
})


module.exports = router;