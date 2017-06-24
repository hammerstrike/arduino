var express = require('express');
var app = express();

var five = require("johnny-five");

//Setting the path to static assets
app.use(express.static(__dirname + '/app'));
//Serving the static HTML file
app.get('/', function (res) {
    res.sendFile('/index.html')
});

board = new five.Board();

var io = require('socket.io')(app.listen(3000, '192.168.1.9', function () {
  console.log('Server running on port '+3000);
}));

var speed = 0;

board.on("ready", function() {

	//console.log(board);
	/*var motors = new five.Motors([
		{ pins: { dir: 12, pwm: 11, cdir:7 }}
	]);*/

	var motors = new five.Motors([
		{ pins: { dir: 8, pwm: 10, cdir:9 } },
		{ pins: { dir: 7, pwm: 5, cdir:6 } }
	]);

	//var motors = new five.Motor([8, 10]);

	board.repl.inject({
		motors: motors
	});

	board.wait(5000, function () {
		console.log('Board wait...');
    	motors.brake();
  	});
	
	io.on('connection', function (socket) {


	    socket.on('stop', function () {
	        console.log('Stop');
	        speed = 0;
	        motors.brake();
	        io.sockets.emit('speed',speed);
	    });

	    socket.on('start', function () {
	        console.log('Start');
	        if(speed > 255) {
	        	speed = 255;
	        }else{
	        	if(speed < 60){
	        		speed = 50;
	        	}
	        	speed += 10;
	        }

	        motors.forward(speed);
	        io.sockets.emit('speed',speed);
	    });

	    socket.on('reverse', function () {
	        console.log('reverse');
	       	speed = 60;
	        motors.reverse(speed);
	        io.sockets.emit('speed',speed);
	    });

	    socket.on('left', function () {
	        console.log('left');
	    });

	    socket.on('right', function () {
	        console.log('right');
	    });
	});

	console.log("Done auto-driving! Use `motors` to control motors in REPL");
})