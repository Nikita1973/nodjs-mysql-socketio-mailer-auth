var socket = io();
var subm_rem = document.getElementById('subm_remember');
var err_div = document.getElementById('err_msg');

//	Регистрация
subm_rem.onclick = function(){
	var email = document.getElementById('email').value;
	socket.emit('remember_test_email', email);
	return false;
};

socket.on('remember_test_email_back', function(err_msg){
	err_div.innerHTML = err_msg;
});

socket.on('remember_ok', function(href){
	window.location.href = href;
});
