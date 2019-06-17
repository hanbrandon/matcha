var express = require('express');
var router = express.Router();
var db = require('../config/db');
var multiparty = require('multiparty');
var fs = require('fs');

router.post('/', function (req, res) {
    if (!(req.session.logged_user)) {
		res.redirect('/');
	} 
	else {
        var form = new multiparty.Form({
            autoFiles: false, // 요청이 들어오면 파일을 자동으로 저장할 것인가
            uploadDir: 'public/uploads/', // 파일이 저장되는 경로(프로젝트 내의 temp 폴더에 저장됩니다.)
            maxFilesSize: 1024 * 1024 * 5 // 허용 파일 사이즈 최대치
        });
        form.parse(req, function (error, fields, file) {
            var id = fields.id[0];
            id = parseInt(id) + 1;
            var path = file.image[0].path
            var logged_user = req.session.logged_user;
            db.query(`SELECT * FROM users WHERE username=?`, [logged_user], function(err, rows, res)
            {
                if (err) {
                    console.log("여기 1");
                    throw err;
                }
                if (rows[0]) {
                    db.query('UPDATE users SET image_? = ? WHERE username = ?', [id, path, logged_user], function(error) {
                        if (error) {
                            console.log("여기 2");
                            throw error;
                        }
                    });
                }
            })
            res.send(); // 파일과 예외 처리를 한 뒤 브라우저로 응답해준다.
        });
    }
})
// 이미지 업로드 하면 바로 저장 후 미리 보여주기
// 아이디 & 파일 경로를 받아와 데이터베이스에 저장

// 만약, 선택해제 하면 데이터베이스에서 삭제, 경로에서 삭제. 



module.exports = router;