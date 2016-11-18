var socket = io();
var subm_reg = document.getElementById('subm_reg');
var err_div = document.getElementById('err_msg');

//	Регистрация
subm_reg.onclick = function(){
	var email = document.getElementById('email').value;
	socket.emit('reg_test_email', email);
	return false;
};

socket.on('reg_test_email_back', function(err_msg){
	err_div.innerHTML = err_msg;
});

socket.on('reg_ok', function(href){
	window.location.href = href;
});
