var express = require('express');
var router = express.Router();
var db = require('../config/db');

router.post('/', function(req, res) {
    var post = req.body;
    var curr_user_id = post.curr_user_id;
    db.query(`SELECT * FROM users WHERE id=?`, [curr_user_id], (err0, u_info) => {
        if (err0) throw err0;
        if (u_info && u_info[0]) {
            if (u_info[0].sexual_pref == 'bisexual') {
                db.query(`SELECT *,
                            (SELECT COUNT(*) FROM like_stat WHERE to_id=u.id) AS overall,
                            (SELECT COUNT(*) FROM like_stat WHERE to_id=u.id AND likes=1) AS liked
                            FROM users AS u
                            WHERE ((SELECT COUNT(*) FROM like_stat WHERE from_id=? AND to_id=u.id) = 0)
                            AND ((SELECT COUNT(*) FROM block WHERE (from_id=? AND to_id=u.id) OR (from_id=u.id AND to_id=?)) = 0)
                            AND (u.sexual_pref = "bisexual" OR u.sexual_pref=?)
                            AND id <> ?`, [curr_user_id, curr_user_id, curr_user_id, u_info[0].gender, curr_user_id], function(err, rows) {
                    if (err) throw err;
                    if (rows && rows[0]) {
                        res.send(rows);
                    }
                });
            } else {
                db.query(`SELECT *,
                            (SELECT COUNT(*) FROM like_stat WHERE to_id=u.id) AS overall,
                            (SELECT COUNT(*) FROM like_stat WHERE to_id=u.id AND likes=1) AS liked            
                            FROM users AS u
                            WHERE ((SELECT COUNT(*) FROM like_stat WHERE from_id=? AND to_id=u.id) = 0)
                            AND ((SELECT COUNT(*) FROM block WHERE (from_id=? AND to_id=u.id) OR (from_id=u.id AND to_id=?)) = 0)
                            AND (u.sexual_pref = "bisexual" OR u.sexual_pref=?)
                            AND id <> ? AND gender=?`, [curr_user_id, curr_user_id, curr_user_id, u_info[0].gender, curr_user_id, u_info[0].sexual_pref], function(err, rows) {
                    if (err) throw err;
                    if (rows && rows[0]) {
                        res.send(rows);
                    }
                });
            }
        }
    });
});

module.exports = router;

//$sql = "SELECT * FROM albums WHERE name NOT IN ( '" . implode( "', '" , $ban_album_names ) . "' )";