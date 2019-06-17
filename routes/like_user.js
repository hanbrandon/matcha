var express = require('express');
var router = express.Router();
var db = require('../config/db');

router.post('/', function(req, res) {
    var post = req.body;
    var from_login = post.from_id;
    var to_id = post.to_id;
    var likes = post.likes;
    if (from_login, to_id, likes) {
        db.query(`SELECT * FROM users WHERE username=?`, [from_login], (err, rows) => {
            if (err) throw err;
            if (rows && rows[0]) {
                var from_id = rows[0].id;
                if (from_id != to_id) {
                    db.query(`SELECT username FROM users WHERE id=?`, [to_id], (err3, target_name) => {
                        if (err3) throw err3;
                        if (target_name && target_name[0]) {
                            db.query(`SELECT * FROM like_stat WHERE from_id=? AND to_id=?`, [from_id, to_id], (err0, dup) => {
                                if (err0) throw err0;
                                if (!(dup && dup[0])) {
                                    db.query(`INSERT INTO like_stat (from_id, to_id, likes) VALUES (?, ?, ?)`, [from_id, to_id, likes], (err1) => {
                                        if (err1) throw err1;
                                        db.query(`SELECT * FROM like_stat WHERE from_id=? AND to_id=?`, [to_id, from_id], (err4, like_back) => {
                                            if (err4) throw err4;
                                            if (like_back && like_back[0] && likes == 1) {
                                                var ret = {'from_name':from_login, 'from_id':from_id, 'oppose_name':target_name[0].username, 'checker':`liked you back!`};
                                                res.send(ret);
                                            } else if (like_back && like_back[0] && likes == 0) {
                                                var ret = {'from_name':from_login, 'from_id':from_id, 'oppose_name':target_name[0].username, 'checker':`disliked you...`};
                                                res.send(ret);
                                            } else {
                                                var ret = {'from_name':from_login, 'from_id':from_id, 'oppose_name':target_name[0].username, 'checker':`liked you!`};
                                                res.send(ret);
                                            }
                                        });    
                                    });
                                } else {
                                    if (dup[0].likes == likes && likes==1) {
                                        db.query(`DELETE FROM like_stat WHERE from_id=? AND to_id=? AND likes=?`, [from_id, to_id, likes], (err2) => {
                                            if (err2) throw err2;
                                            var ret = {'from_name':from_login, 'from_id':from_id, 'oppose_name':target_name[0].username, 'checker':`unliked you!`};
                                            res.send(ret);
                                        })
                                    } else {
                                        db.query(`UPDATE like_stat SET likes=? WHERE from_id=? AND to_id=?`, [likes, from_id, to_id], (err1) => {
                                            if (err1) throw err1;
                                            db.query(`SELECT * FROM like_stat WHERE from_id=? AND to_id=?`, [to_id, from_id], (err4, like_back) => {
                                                if (err4) throw err4;
                                                if (like_back && like_back[0] && likes == 1) {
                                                    var ret = {'from_name':from_login, 'from_id':from_id, 'oppose_name':target_name[0].username, 'checker':`liked you back!`};
                                                    res.send(ret);
                                                } else if (like_back && like_back[0] && likes == 0) {
                                                    var ret = {'from_name':from_login, 'from_id':from_id, 'oppose_name':target_name[0].username, 'checker':`disliked you...`};
                                                    res.send(ret);
                                                } else {
                                                    var ret = {'from_name':from_login, 'from_id':from_id, 'oppose_name':target_name[0].username, 'checker':`liked you!`};
                                                    res.send(ret);
                                                }
                                            });
                                        });
                                    }
                                }
                            });
                        } else {
                            res.send("FAIL");
                        }
                    });
                } else {
                    res.send("FAIL");
                }
            } else {
                res.send("FAIL");
            }
        });
    } else {
        res.send("FAIL");
    }
});

module.exports = router;