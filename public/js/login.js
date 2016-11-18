var socket = io();
var subm_login = document.getElementById('subm_login');
var err_div = document.getElementById('err_msg');

//	Регистрация
subm_login.onclick = function(){
	var email = document.getElementById('email').value;
	var pass = document.getElementById('password').value;
	socket.emit('login_test_email', {email: email, password: pass});
	return false;
};

socket.on('login_test_email_back', function(err_msg){
	err_div.innerHTML = err_msg;
});

socket.on('login_ok', function(href){
	window.location.href = href;
});
