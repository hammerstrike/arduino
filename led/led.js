var five = require('johnny-five');
var board = new five.Board();
var led ;

board.on('ready',function(){
	led = new five.Led(13);
	this.repl.inject({
		led : led
	})
	console.log('LED is ready');
})