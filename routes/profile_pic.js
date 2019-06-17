var express = require('express');
var router = express.Router();
var db = require('../config/db');
router.get('/', function (req, res) 
{
	if (!(req.session.logged_user)) 
	{
		res.redirect('/');
	} 
	else 
	{
		var title = 'Matcha - Edit Profile Picture';
		var err = req.session.err;
		delete req.session.err;
		var logged_user = req.session.logged_user;
		var profile_img = [];
	
		db.query(`SELECT * FROM users WHERE username=?`, [logged_user], function(err, rows, res0) 
		{
			if (err) {
				throw err;
			}
			if (rows[0]) {
				for (var i = 0; i < 5; i++)
				{
					if (rows[0][`image_${i+1}`]) {
						profile_img[i] = rows[0][`image_${i+1}`].replace('public/', '');
					}
				}
			}
			res.render('profile_pic', {
				title: title,
				error: err,
				logged_user: logged_user,
				logged_user_id: req.session.logged_user_id,
				profile_img: profile_img,
			});
		})
	}
});

router.post('/', function (req, res) {
	
});


module.exports = router;