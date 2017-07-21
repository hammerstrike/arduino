var sensor = require('node-dht-sensor');


for(var i = 0 ; i < 100 ; i++){
	
		setTimeout(function(){
				
				
				readTemp();
			
		},1000)
}


function readTemp(){
	
		sensor.read(11, 4, function(err, temperature, humidity) {
				if (!err) {
					console.log('temp: ' + temperature.toFixed(1) + '°C, ' +
						'humidity: ' + humidity.toFixed(1) + '%'
					);
				}
			});
	
}
