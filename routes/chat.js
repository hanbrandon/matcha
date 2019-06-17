var express = require('express');
var router = express.Router();
var db = require('../config/db');

router.post('/', function(req, res) {
    var post = req.body;
    var username = post.username;
    db.query(`SELECT id FROM users WHERE username=?`, [username], function(err, rows) {
        if (err) throw err;
        db.query(`SELECT to_id, from_id FROM like_stat WHERE from_id=? AND likes=1`, [rows[0].id], function(err0, likes) {
            if (err0) throw err0;
            var counter = 0;
            var chatList = [];
            if (likes) {
                likes.forEach(function(like) {
                    db.query(`SELECT (SELECT username FROM users AS u WHERE u.id = l.from_id) AS username, from_id AS id,
                    (SELECT image_1 FROM users AS u WHERE u.id = l.from_id) AS profile_pic,
                    (SELECT chat FROM chats AS c WHERE (c.from_id=? AND c.to_id=?) OR (c.from_id=? AND c.to_id=?) ORDER BY id DESC LIMIT 0, 1) AS recent_chat,
                    (SELECT time FROM chats AS c WHERE (c.from_id=? AND c.to_id=?) OR (c.from_id=? AND c.to_id=?) ORDER BY id DESC LIMIT 0, 1) AS recent_chat_time
                    FROM like_stat AS l
                    WHERE to_id=? AND from_id=? AND likes=1`, [like.from_id, like.to_id, like.to_id, like.from_id, like.from_id, like.to_id, like.to_id, like.from_id, like.from_id, like.to_id], function(err1, match) {
                        if (match) {
                            if (err1) throw err1;
                            chatList.push(match);
                            if (counter == likes.length - 1) {
                                res.send(chatList);
                            }
                            counter++;
                        } else {
                            res.send("FAIL");
                        }
                    })
                });
            } else {
                res.send("FAIL");
            }
        });
    });
});

/* `SELECT username,
                (SELECT chat FROM chats AS c WHERE (c.from_id=u.id AND c.to_id=?) OR (c.to_id=u.id AND c.from_id=?) ORDER BY id DESC LIMIT 0, 1) AS recent_chat,
                (SELECT time FROM chats AS c WHERE (c.from_id=u.id AND c.to_id=?) OR (c.to_id=u.id AND c.from_id=?) ORDER BY id DESC LIMIT 0, 1) AS recent_chat_time
                FROM users AS u
                WHERE (SELECT to_id FROM like_stat WHERE from_id=? AND likes=1) = (SELECT from_id FROM like_stat WHERE to_id=? AND likes=1)
                        AND u.id != ?`, [rows[0].id, rows[0].id, rows[0].id, rows[0].id, rows[0].id, rows[0].id, rows[0].id], function(err0, likes) */

// ORDER BY id DESC LIMIT $load_from, $load_amount
router.post('/chat_load', function(req, res) {
    var post = req.body;
    var username = post.username;
    var connect_to = post.connect_to;
    db.query(`SELECT id FROM users WHERE username=?`, [username], function(err, rows) {
        if (err) throw err;
        if (rows && rows[0]) {
            db.query(`SELECT chat, time,
                    (SELECT username FROM users AS u WHERE u.id=c.from_id) AS from_user,
                    (SELECT image_1 FROM users AS u WHERE u.id=?) AS profile_pic,
                    (SELECT username FROM users AS u WHERE u.id=c.to_id) AS to_user
                    FROM chats AS c WHERE (to_id=? AND from_id=?) OR (to_id=? AND from_id=?)`, [connect_to, rows[0].id, connect_to, connect_to, rows[0].id], function(err0, chats) {
                if (err0) throw err0;
                if (chats && chats[0]) {
                    res.send(chats);
                } else {
                    db.query(`SELECT image_1 AS profile_pic FROM users WHERE id=?`, [connect_to], (err1, pic)=>{
                        if (err1) throw err1;
                        res.send(pic);
                    })
                }
            });
        } else {
            res.send("FAIL");
        }
    });
})

router.post('/chat_recent', function(req, res) {
    var post = req.body;
    var username = post.username;
    var connect_to = post.connect_to;
    db.query(`SELECT id FROM users WHERE username=?`, [username], function(err, rows) {
        if (err) throw err;
        if (rows && rows[0]) {
            db.query(`SELECT chat AS recent_chat, time AS recent_chat_time,
                    (SELECT username FROM users AS u WHERE u.id = ?) AS username,
                    (SELECT image_1 FROM users AS u WHERE u.id = ?) AS profile_pic
                    FROM chats AS c 
                    WHERE (c.from_id=? AND c.to_id=?) OR (c.from_id=? AND c.to_id=?)
                    ORDER BY id DESC LIMIT 0, 1`, [connect_to, connect_to, connect_to, rows[0].id, rows[0].id, connect_to], function(err0, chat) {
                if (err0) throw err0;
                if (chat && chat[0]) {
                    res.send(chat);
                } else {
                    db.query(`SELECT (SELECT username FROM users AS u WHERE u.id = ?) AS username,
                            (SELECT image_1 FROM users AS u WHERE u.id = ?) AS profile_pic
                            FROM like_stat AS l
                            WHERE (SELECT to_id FROM like_stat AS ls WHERE ls.from_id = ? AND ls.to_id = ? AND likes = 1) =
                            (SELECT from_id FROM like_stat AS ls WHERE ls.from_id = ? AND ls.to_id = ? AND likes = 1)`, [connect_to, connect_to, rows[0].id, connect_to, connect_to, rows[0].id], function(err1, namecheck) {
                        if (err1) throw err1;
                        res.send(namecheck);
                    });
                }
            });
        } else {
            res.send("FAIL");
        }
    });
})

module.exports = router;