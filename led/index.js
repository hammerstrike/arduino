var express = require('express');
var app = express();
var io = require('socket.io')(app.listen(3000));
var five = require('johnny-five');
var board = new five.Board();

//Setting the path to static assets
app.use(express.static(__dirname + '/app'));

//Serving the static HTML file
app.get('/', function (res) {
    res.sendFile('/index.html')
});

board.on('ready', function () {
	
    var led;
    led = new five.Led(13);
    this.repl.inject({
		led : led
	});

	console.log('LED is ready');
	
    io.on('connection', function (socket) {
		console.log('Connection is ready');
		
        socket.on('on', function () {
            led.on();
        });

        socket.on('off', function () {
            led.off();
        });
        socket.on('stop', function () {
            led.stop();
        });

        socket.on('blink', function () {
            led.blink(500);
        });

        
    });
});
