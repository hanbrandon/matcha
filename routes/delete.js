var express = require('express');
var router = express.Router();
var db = require('../config/db');
var fs = require('fs');

router.post('/', function (req, res) {
    if (!(req.session.logged_user)) {
		res.redirect('/');
	} 
	else {
        var logged_user = req.session.logged_user;
        var post = req.body;
        var check = post.check;
        var id = post.id[0];
        id = parseInt(id) + 1;
        var path;
        if (check == 1)
        {
            path = "public/" + post.path;
            fs.unlinkSync(path);  
        }
        else 
        {
            db.query(`SELECT * FROM users WHERE username=?`, [logged_user], function(err, rows, res)
            {
                if (err) {
                    throw err;
                }
                if (rows[0]) {
                    path = rows[0][`image_${id}`];
                    console.log(path);
                    fs.unlinkSync(path);   
                }
            })
        }
        db.query(`SELECT * FROM users WHERE username=?`, [logged_user], function(err, rows, res)
        {
            if (err) {
                throw err;
            }
            if (rows[0]) {
                db.query('UPDATE users SET image_? = ? WHERE username = ?', [id , '', logged_user], function(error) {
                    if (error) {
                        throw error;
                    }
                });
            }
        })
    }
    res.send()

})
// 이미지 업로드 하면 바로 저장 후 미리 보여주기
// 아이디 & 파일 경로를 받아와 데이터베이스에 저장

// 만약, 선택해제 하면 데이터베이스에서 삭제, 경로에서 삭제. 



module.exports = router;