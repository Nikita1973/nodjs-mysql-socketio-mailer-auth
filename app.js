var config = require('./config');

var express = require('express');

var app = express();

var http = require('http');

var server = http.createServer(app);

var io = require('socket.io')(server);

var bodyParser = require('body-parser');

var port = process.env.PORT || config.port;

app.use('/css', express.static('./public/css'));
app.use('/js', express.static('./public/js'));
app.use('/img', express.static('./public/img'));
// parse application/json
app.use(bodyParser.json())

app.set('views', './views');
app.set('view engine', 'ejs');

var mysql = require('mysql');
var pool = mysql.createPool(config.db);

var modelUser = require('./models/user.js')(pool);

var controllerUser = require('./controllers/users')(app, modelUser, io);

server.listen(port, function(){
	console.log('Server http was started on port ' + port);
});
