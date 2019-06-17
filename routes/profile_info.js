var express = require("express");
var router = express.Router();
var db = require("../config/db");
var path = require('path');

router.get("/:user_id", function (req, res) {
    var id = path.parse(req.params.user_id).base;
	if (!req.session.logged_user) {
		res.redirect("/");
	} else {
        db.query(`SELECT * FROM users WHERE username = ?`, [req.session.logged_user], (err3, validity) => {
            if (err3) throw err3;
            if (validity && validity[0]) {
                if (validity[0].firstname && validity[0].lastname && validity[0].image_1) {
                    var i;
                    var title;
                    var logged_user = req.session.logged_user;
                    var fullName;
                    var username;
                    var rating;
                    var age;
                    var gender;
                    var bday;
                    var occupation;
                    var school;
                    var sexual_preferences;
                    var tagstr;
                    var tagarr;
                    var img = [];
                    var total_to = 0;
                    var total_likes = 0;
                    var online;
                    var visit;
                    db.query(`SELECT * FROM users WHERE username=?`,[logged_user], (err0, block_check) => {
                        if (err0) throw err0;
                        if (block_check && block_check[0]) {
                            db.query(`SELECT * FROM block WHERE (from_id=? AND to_id=?) OR (from_id=? AND to_id=?)`, [block_check[0].id, id, id, block_check[0].id], (err1, conf) => {
                                if (err1) throw err1;
                                if (conf && conf[0]) {
                                    res.redirect('/');
                                } else {
                                    db.query(`SELECT * FROM users WHERE id=?`, [id], function (err, rows, res0) {
                                        if (err) {
                                            throw err;
                                        }
                                        
                                        if (rows[0] && rows[0]["firstname"] && rows[0]["lastname"] && rows[0]["gender"] && rows[0]["occupation"] && rows[0]["sexual_pref"] && rows[0]["school"] && rows[0]["tags"] && rows[0]["image_1"]) {
                                            fullName = rows[0]["firstname"] + " " + rows[0]["lastname"];
                                            title = "Matcha - Profile of " + fullName;
                                            gender = rows[0]["gender"];
                                            if (rows[0]["dob"])
                                            {
                                                bday = new Date(rows[0]["dob"]);
                                                age = getAge(bday);
                                                bday = (bday.getMonth() + 1) + '/' + bday.getDate() + '/' +  bday.getFullYear();
                                            };
                                            occupation = rows[0]["occupation"];
                                            sexual_preferences = rows[0]["sexual_pref"];
                                            school = rows[0]["school"];
                                            tagstr = rows[0]["tags"];
                                            online = rows[0]["online"];
                                            username = rows[0]["username"];
                                            visit = new Date(rows[0]["visit"]);
                                            visit = (visit.getMonth() + 1) + '/' + visit.getDate() + '/' +  visit.getFullYear();
                                            if (tagstr) {
                                                tagarr = tagstr.split(",").map(function (item) {
                                                    return item.trim();
                                                });
                                            }
                                            i = 1;
                                            while (rows[0]["image_"+i])
                                            {
                                                var temp = rows[0]["image_"+i];
                                                temp = temp.replace('public', '')
                                                img.push(temp);
                                                i++;
                                            }
                                            db.query(`SELECT * FROM like_stat WHERE to_id=?`, [id], function (err, rows, res1) {
                                                if (err) {
                                                    throw error;
                                                }
                                                if (rows[0]) {
                                                    var total_to = rows.length;
                                                }
                                                db.query(`SELECT * FROM like_stat WHERE to_id=? and likes=?`, [id, "1"], function (err, rows, res2) {
                                                    if (err) {
                                                        throw error;
                                                    }
                                                    if (rows[0]) {
                                                        total_likes = rows.length;
                                                    }
                                                    if (total_likes == 0 || total_to == 0)
                                                    {
                                                        rating = "0%";
                                                    }
                                                    else {
                                                        rating = 100 * total_likes/total_to;
                                                        rating = Math.round(rating);
                                                        rating = rating.toString() + "%";
                                                    }
                                                    
                                                    res.render("profile_info", {
                                                    username: username,
                                                    logged_user_id: req.session.logged_user_id,
                                                    title: title,
                                                    fullName: fullName,
                                                    rating: rating,
                                                    logged_user: logged_user,
                                                    gender: gender,
                                                    age: age,
                                                    bday: bday,
                                                    occupation: occupation,
                                                    sexual_preferences: sexual_preferences,
                                                    school: school,
                                                    tagarr: tagarr,
                                                    id: id,
                                                    img: img,
                                                    visit: visit,
                                                    online: online
                                                    });
                                                });
                                            });
                                        }
                                        else {
                                            res.redirect('/');
                                        }
                                    });
                                }
                            })
                        } else {
                            res.redirect('/');
                        }
                    });
                } else if (validity[0].firstname && validity[0].lastname) {
                    res.redirect('/profile_pic');
                } else {
                    res.redirect('/edit_profile');
                }
            }
        });
    }
});

function getAge(bday) {
    var today = new Date();
    var age = today.getFullYear() - bday.getFullYear();
    var m = today.getMonth() - bday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) {
        age--;
    }
    return age;
}

module.exports = router;

