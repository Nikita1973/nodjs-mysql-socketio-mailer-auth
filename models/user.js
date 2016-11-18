module.exports = function(pool){

	// var pool = pool_out;


	return {

		addUserReg: function(email, hash, cb){
			var q = 'INSERT INTO `users` SET ?';
			var data = {};
			pool.query(q, {user_email: email, hash: hash}, cb);
		},

		hasUserByEmail: function(email, cb){
			// TODO: DISTINCT - по-моему работает быстрее - надо уточнить - 
			// по идее он должен доходить только до первой записи, а не искать все
			var q = 'SELECT DISTINCT count(*) AS `count` FROM `users` WHERE `user_email` = ?';

			pool.query(q, [email], function(err, rows, fields){

				var hasUser = false;
				
				if (rows[0].count > 0) {
					hasUser = true;
				}

				cb(err, hasUser);

			});
		},

		setNewPass: function(email, hash, cb){
			var q = 'UPDATE `users` SET `hash` = ? WHERE `user_email` = ?';
			pool.query(q, [hash, email], cb);
		},

		getHashByEmail: function(email, cb){
			var q = 'SELECT `hash` FROM `users` WHERE `user_email` = ?';
			pool.query(q, [email], function(err, rows, filds){
				cb(err, rows[0]);
			});
		}


	}
}
