var emailValidator = require('email-validator');
var generatePassword = require('password-generator');
var bcrypt = require('bcrypt');
var config = require('../config').password;

module.exports = function(app, modelUser, io){

	// =======================================
	// 	Форма регистрации нового пользователя
	// =======================================
	app.get('/reg', function(req, res, next){
		res.render('reg', {error: ''});
	});

	// =======================================
	// 	удачная регистрация
	// =======================================
	app.get('/reg_ok', function(req, res, next){
		res.render('reg_ok', {email: req.query.email});
	});

	// =======================================
	// 	Форма восстановления пароля
	// =======================================
	app.get('/remember', function(req, res, next){
		res.render('remember', {error: ''});

	});

	// =======================================
	// 	выслали пароль на почту
	// =======================================
	app.get('/remember_ok', function(req, res, next){
		res.render('remember_ok', {email: req.query.email});
	});

	// =======================================
	// 	Форма аутентификации пользователя
	// =======================================
	app.get('/login', function(req, res, next){
		res.render('login', {error: ''});

	});

	// =======================================
	// 	Чтобы не перегружать страницу
	// 	 работаем через сокеты
	// =======================================
	io.on('connection', function(socket){

		socket.on('reg_test_email', function(email){
			//	0. Проверка присланного email на валидность
			if (emailValidator.validate(email) === false){
				//	0.1 Если email не валиден
				socket.emit('reg_test_email_back', 'email не валиден');

			} else {

				modelUser.hasUserByEmail(email, function(err, hasUser){
					
					if (err) {
						console.error(err);
						// throw err;
					} 

					if (!!hasUser) {

						// Такой e-mail уже зарегистрирован!
						socket.emit('reg_test_email_back', 'Такой e-mail уже зарегистрирован!');

					} else {

						//	Генерируем пароль
						var new_pass = customPassword();

						// Шифруем пароль с солью
						getHashFromPass(new_pass, function(objPass){

							// Поскольку salt входит в состав hash то достаточно отправлять только hash
							modelUser.addUserReg(email, objPass.hash, function(err, rows, fields){
								if (err) {
									throw err;
								}


							 	// TODO:	4. Отослать пароль по почте
							 	// 
							 	// 
							 	// 
							 	socket.emit('reg_ok', 'reg_ok?email=' + email);

							});

						});	
					}
				});
			}
		});


		socket.on('remember_test_email', function(email){
			//	0. Проверка присланного email на валидность
			if (emailValidator.validate(email) === false){
				//	0.1 Если email не валиден
				socket.emit('remember_test_email_back', 'email не валиден');

			} else {

				modelUser.hasUserByEmail(email, function(err, hasUser){
					
					if (err) {
						throw err;
					} 

					if (!hasUser) {

						// Такой e-mail уже зарегистрирован!
						socket.emit('remember_test_email_back', 'Пользователь с указанным e-mail пока не регистрировался здесь!');

					} else {

						//	Генерируем пароль
						var new_pass = customPassword();
						console.log(new_pass);
	
						// Шифруем пароль с солью
						getHashFromPass(new_pass, function(objPass){

							// Поскольку salt входит в состав hash то достаточно отправлять только hash
							modelUser.setNewPass(email, objPass.hash, function(err, rows, fields){
								if (err) {
									throw err;
								}

							 	// TODO:	4. Отослать пароль по почте
							 	// 
							 	// 
							 	// 
							 	socket.emit('remember_ok', 'remember_ok?email=' + email);

							});

						});	
					}
				});
			}
		});


		socket.on('login_test_email', function(msg_obj){
			//	0. Проверка присланного email на валидность
			if (emailValidator.validate(msg_obj.email) === false){
				//	0.1 Если email не валиден
				socket.emit('login_test_email_back', 'email не валиден');

			} else {

				modelUser.hasUserByEmail(msg_obj.email, function(err, hasUser){
					
					if (err) {
						throw err;
					} 

					if (!hasUser) {

						// Такой e-mail уже зарегистрирован!
						socket.emit('login_test_email_back', 'Пользователь с таким e-mail еще не зарегистрирован!');

					} else {

						modelUser.getHashByEmail(msg_obj.email, function(err, hash_db){

							if (err) {
								throw err;
							}

							bcrypt.compare(msg_obj.password, hash_db.hash, function(err, res) {

								if (err) {
									throw err;
								}

								if (res === true) {
									// password is good
									// Стартуем сессию 
									// и сохраняем куки если стояла галочка rememberme
									//  	socket.emit('reg_ok', 'reg_ok?email=' + email);
									console.log('We are here and now!');
								} else {
									// are you a hacker?
									socket.emit('login_test_email_back', 'Не правильно указан пароль!');
								}
							});

						});
					}	
				});
			}
		});



	});
}

/**
 * Gets the pass.
 *
 * @param      {<type>}    pass    The pass
 * @param      {Function}  cb      { callback }
 */
var getHashFromPass = function(pass, cb){

	const saltRounds = 10;

	bcrypt.genSalt(saltRounds,  function(err, salt){
		if (err) {
			throw err;
		}

		bcrypt.hash(pass, salt, function(err, hash){
			if (err) {
				throw err;
			}

			cb({salt: salt, hash: hash});

		});
	});
}

// ====================================
// Генерация пароля - синхронно!!!
// ====================================
// Вспомогательная функция
// Настройки в ../config.password
function isStrongEnough(password) {
  var uc = password.match(config.UPPERCASE_RE);
  var lc = password.match(config.LOWERCASE_RE);
  var n = password.match(config.NUMBER_RE);
  var sc = password.match(config.SPECIAL_CHAR_RE);
  var nr = password.match(config.NON_REPEATING_CHAR_RE);
  return password.length >= config.minLength &&
    !nr &&
    uc && uc.length >= config.uppercaseMinCount &&
    lc && lc.length >= config.lowercaseMinCount &&
    n && n.length >= config.numberMinCount &&
    sc && sc.length >= config.specialMinCount;
}

// ====================================
// Генерация пароля - синхронно!!!
// ====================================
// Вызываемая функция
function customPassword() {
  var password = "";
  var randomLength = Math.floor(Math.random() * (config.maxLength - config.minLength)) + config.minLength;
  while (!isStrongEnough(password)) {
    password = generatePassword(randomLength, false, /[\w\d\?\-]/);
  }

  return password;
}