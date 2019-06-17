var express = require("express");
var router = express.Router();
var db = require("../config/db");

router.get("/", function (req, res) {
	if (!req.session.logged_user) {
		res.redirect("/");
	} else {
		var title = "Matcha - Edit Profile";
		var err = req.session.err;
		delete req.session.err;
		var logged_user = req.session.logged_user;
		var firstname;
		var lastname;
		var email;
		var gender;
		var bday;
		var occupation;
		var school;
		var sexual_preferences;
		var tagstr;
		var tagarr;
		var notification;
		var firstlogin;

		db.query(`SELECT * FROM users WHERE username=?`, [logged_user], function (err, rows, res0) {
			if (err) {
				throw err;
			}
			if (rows[0]) {
				firstname = rows[0]["firstname"];
				lastname = rows[0]["lastname"];
				email = rows[0]["email"];
				gender = rows[0]["gender"];
				if (rows[0]["dob"])
				{
					bday = new Date(rows[0]["dob"]);
					bday = bday.toISOString().slice(0, 10);
				};
				
				occupation = rows[0]["occupation"];
				sexual_preferences = rows[0]["sexual_pref"];
				school = rows[0]["school"];
				tagstr = rows[0]["tags"];
				firstlogin = rows[0]["firstLogin"];
				if (tagstr) {
					tagarr = tagstr.split(",").map(function (item) {
						return item.trim();
					});
				}
				notification = rows[0]["notification"];
			}
			res.render("edit_profile", {
				title: title,
				error: err,
				logged_user: logged_user,
				logged_user_id: req.session.logged_user_id,
				firstname: firstname,
				lastname: lastname,
				email: email,
				gender: gender,
				bday: bday,
				occupation: occupation,
				sexual_preferences: sexual_preferences,
				school: school,
				tagarr: tagarr,
				notification: notification,
				firstlogin: firstlogin
			});
		});
	}
});

router.post("/", function (req, res) {
	if (!req.session.logged_user) {
		res.redirect("/");
	}
	var post = req.body;
	if (post.firstName && post.lastName && post.gender && post.bday && post.occupation &&
		post.school && post.sexual_preferences && post.interests) {
		firstname = post.firstName;
		lastname = post.lastName;
		gender = post.gender;
		bday = post.bday;
		occupation = post.occupation;
		school = post.school;
		sexual_preferences = post.sexual_preferences;
		firstlogin = post.firstlogin;
		tagstr = post.interests;
		if (tagstr.charAt(0) == ",")
		{
			tagstr = tagstr.substring(1);
			tagstr = tagstr.trim();
			
		}
		if (tagstr.slice(-1) == ",")
		{
			tagstr = tagstr.substring(0, tagstr.length - 1);
		}
		tagarr = tagstr.split(",").map(function (item) {
			return item.trim();
		});
		tagstr = "";
		var counter = 0;
		tagarr.forEach(tag => {
			if (!(tag == "") && tag.includes("#"))
			{
				if (counter == tagarr.length - 1) {
					tagstr += tag;
				}
				else {
					tagstr += tag + ",";
				}
				db.query(`SELECT * FROM tags WHERE tag_name=?`, [tag], function (err, rows,	res0) {
					if (!(rows && rows[0])) {
						db.query(`INSERT INTO tags (tag_name) VALUES (?)`, [tag], function (err, res1) {
							if (err) {
								throw err;
							}
						});
					}
				});
			}
			counter++;
		});
		if (post.notification == "on") {
			notification = 1;
		} else {
			notification = 0;
		}
		db.query(
			`UPDATE users SET firstname=?, lastname=?, gender=?, dob=?,	occupation=?, school=?,	sexual_pref=?, tags=?, notification=?, firstLogin="0" WHERE username=?`,
			[firstname, lastname, gender, bday,	occupation,	school,	sexual_preferences, tagstr,	notification, req.session.logged_user], function (err) {
				if (err) {
					res.send(err);
				} 
				else if (firstlogin == "0") {
					res.redirect("/edit_profile");
				}
				else if (firstlogin == "1") {
					res.redirect("/profile_pic");
				}
				else {
					res.redirect("/edit_profile");
				}
			}
		);
	} else {
		req.session.err = "Unknown access!";
		res.redirect("/");
	}
});

module.exports = router;
