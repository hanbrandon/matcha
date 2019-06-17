var express = require('express');
var router = express.Router();
var db = require('../config/db');

router.post('/', (req, res) => {
    var post = req.body;
    var username = post.username;
    db.query(`SELECT id FROM users WHERE username = ?`, [username], (err, rows) => {
        if (err) throw err;
        if (rows && rows[0]) {
            db.query(`SELECT * FROM notification WHERE to_id = ? AND checked = 0`, [rows[0].id], (err0, notifs) => {
                if (err0) throw err0;
                if (notifs && notifs[0]) {
                    res.send([notifs.length]);
                } else {
                    res.send("ERROR");
                }
            });
        } else {
            res.send("ERROR");
        }
    });
});

router.post('/load', (req, res) => {
    var post = req.body;
    var username = post.username;
    db.query(`SELECT id FROM users WHERE username = ?`, [username], (err, rows) => {
        if (err) throw err;
        if (rows && rows[0]) {
            db.query(`SELECT from_id, notice, time, checked,
                        (SELECT firstname FROM users AS u WHERE u.id = from_id) AS firstname,
                        (SELECT lastname FROM users AS u WHERE u.id = from_id) AS lastname
                        FROM notification WHERE to_id = ?`, [rows[0].id], (err0, notifs) => {
                if (err0) throw err0;
                if (notifs && notifs[0]) {
                    res.send(notifs);
                } else {
                    res.send("ERROR");
                }
            });
        } else {
            res.send("ERROR");
        }
    });
});

router.post('/clear', (req, res) => {
    var post = req.body;
    var username = post.username;
    db.query(`SELECT id FROM users WHERE username = ?`, [username], (err, rows) => {
        if (err) throw err;
        if (rows && rows[0]) {
            db.query(`UPDATE notification SET checked=1 WHERE to_id=? AND checked = 0`, [rows[0].id], (err0) => {
                if (err0) throw err0;
                res.send("SUCCESS");
            });
        } else {
            res.send("ERROR");
        }
    });
});

module.exports = router;