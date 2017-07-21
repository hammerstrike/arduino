var five = require("johnny-five");
var Rasp = require("raspi-io");

var board = new five.Board({
    io: new Rasp()
});

board.on("ready", function() {
	//console.log(five.Pin.INPUT);
    this.pinMode(7, five.Pin.INPUT);

    this.digitalRead(7, function(value){
        console.log(value);
    });
});
