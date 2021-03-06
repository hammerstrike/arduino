function NanoTimer(log){

    var version = process.version;
    var minor = version.split('.')[1];
    if (minor < 10){
        console.log('Error: Please update to the latest version of node!');
        process.exit(0);
    }
        
    this.intervalContinue = false;
    this.intervalT1 = null;
    this.intervalCount = 0;
    this.timeOutT1 = null;
    this.deferredInterval = false;
    this.deferredTimeout = false;
    this.experimental = true;
    
    if(log){
        this.logging = true;
    }
}

NanoTimer.prototype.time = function(task, args, format, callback){
  //Asynchronous task
    if(callback){
        var t1 = process.hrtime();
        
        
        if(args){
        
            args.push(function(){
                var time = process.hrtime(t1);
                if(format == 's'){
                    callback(time[0] + time[1]/1000000000);
                } else if (format == 'm'){
                    callback(time[0]/1000 + time[1]/1000000);
                } else if (format == 'u'){
                    callback(time[0]/1000000 + time[1]/1000);
                } else if (format == 'n'){
                    callback(time[0]/1000000000 + time[1]);
                } else {
                    callback(time); 
                }
            });
           
            task.apply(null, args);
        } else {
            task(function(){
                var time = process.hrtime(t1);
                if(format == 's'){
                    callback(time[0] + time[1]/1000000000);
                } else if (format == 'm'){
                    callback(time[0]/1000 + time[1]/1000000);
                } else if (format == 'u'){
                    callback(time[0]/1000000 + time[1]/1000);
                } else if (format == 'n'){
                    callback(time[0]/1000000000 + time[1]);
                } else {
                    callback(time); 
                }
            });
        }
        
    //Synchronous task
    } else {
        var t1 = process.hrtime();
        
        if(args){
            task.apply(null, args);
        } else{
            task();
        }
        
        var t2 = process.hrtime(t1);
        
        if(format == 's'){
            return t2[0] + t2[1]/1000000000;
        } else if (format == 'm'){
            return t2[0]/1000 + t2[1]/1000000;
        } else if (format == 'u'){
            return t2[0]/1000000 + t2[1]/1000;
        } else if (format == 'n'){
            return t2[0]/1000000000 + t2[1];
        } else {
            return process.hrtime(t1);
        } 
    } 
};

NanoTimer.prototype.setInterval = function(task, args, interval, callback){

    //Avoid dereferencing inside of function objects later
    var thisTimer = this;
    
    var intervalType = interval[interval.length-1];
    
    if(intervalType == 's'){
        var intervalTime = interval.slice(0, interval.length-1) * 1000000000;
    } else if(intervalType == 'm'){
        var intervalTime = interval.slice(0, interval.length-1) * 1000000;
    } else if(intervalType == 'u'){
        var intervalTime = interval.slice(0, interval.length-1) * 1000;
    } else if(intervalType == 'n'){
        var intervalTime = interval.slice(0, interval.length-1);
    } else {
        console.log('Error with argument: ' + interval + ': Incorrect interval format. Format is an integer followed by "s" for seconds, "m" for milli, "u" for micro, and "n" for nanoseconds. Ex. 2u');
        process.exit(1);
    }
    
    if(intervalTime > 0){
        
        //Check and set constant t1 value.
        if(this.intervalT1 == null){
            this.intervalT1 = process.hrtime();
            this.intervalContinue = true;
        }
        
        //Check for overflow.  Every 8,000,000 seconds (92.6 days), this will overflow
        //and the reference time T1 will be re-acquired.  This is the only case in which error will 
        //propagate.
        if(intervalTime*this.intervalCount > 8000000000000000){
            this.intervalT1 = process.hrtime();
            this.intervalCount = 0;
        }
        
        //Get comparison time
        this.difArray = process.hrtime(this.intervalT1);
        this.difTime = (this.difArray[0] * 1000000000) + this.difArray[1];

        //If updated time < expected time, continue
        //Otherwise, run task and update counter
        if(this.intervalContinue == true){
            if(this.difTime < (intervalTime*this.intervalCount)){
                
                //Can potentially defer to less accurate setTimeout if intervaltime > 25ms
                if(intervalTime > 25000000){
                    if(this.deferredInterval == false){
                        this.deferredInterval = true;
                        msDelay = (intervalTime - 25000000) / 1000000.0;
                        setTimeout(function(){thisTimer.setInterval(task, args, interval, callback);}, msDelay);
                    } else {
                        nextExec = (intervalTime*this.intervalCount);
                        timeLeft = (nextExec - this.difTime);
                        if(timeLeft < 25000){
                            if(timeLeft < 3000){
                                //blocking loop
                                while (this.difTime < nextExec){
                                    this.difArray = process.hrtime(this.intervalT1);
                                    this.difTime = (this.difArray[0] * 1000000000) + this.difArray[1];
                                }
                                if(args){
                                    task.apply(null, args);
                                } else {
                                    task();
                                }
                                this.intervalCount++;
                                this.deferredInterval = false;
                                if(this.logging){
                                    console.log('nanotimer log: ' + 'cycle time at - ' + this.difTime);
                                }
                                setImmediate(function(){thisTimer.setInterval(task, args, interval, callback);});
                            } else {
                                process.nextTick(function(){thisTimer.setInterval(task, args, interval, callback);});
                            }
                        } else {
                            setImmediate(function(){thisTimer.setInterval(task, args, interval, callback);});
                        }
                    }
                } else {
                    setImmediate(function(){thisTimer.setInterval(task, args, interval, callback);});
                }
            }
            else{
                if(args){
                    task.apply(null, args);
                } else {
                    task();
                }
                this.intervalCount++;
                this.deferredInterval = false;
                if(this.logging){
                    console.log('nanotimer log: ' + 'cycle time at - ' + this.difTime);
                }
                setImmediate(function(){thisTimer.setInterval(task, args, interval, callback);});
            }
        }
        
        //Clean up for exit
        else{
            this.intervalT1 = null;
            this.intervalCount = 0;
            if(callback){
                callback();
            }
        }
        
    //If interval = 0, run as fast as possible.
    } else {
        
      //Check and set constant t1 value.
        if(this.intervalT1 == null){
            this.intervalT1 = process.hrtime();
            this.intervalContinue = true;
        }
        
        if(this.intervalContinue == true) {
            if(args){
                task.apply(null, args);
            } else {
                task();
            }
            setImmediate(function(){thisTimer.setInterval(task, args, interval, callback);});
        } else {
            this.intervalT1 = null;
            this.intervalCount = 0;
            callback();
        }  
    }
};

NanoTimer.prototype.setTimeout = function(task, args, delay, callback){
    
    //Avoid dereferencing
    var thisTimer = this;
    
    var delayType = delay[delay.length-1];
    
    if(delayType == 's'){
        var delayTime = delay.slice(0, delay.length-1) * 1000000000;
    } else if(delayType == 'm'){
        var delayTime = delay.slice(0, delay.length-1) * 1000000;
    } else if(delayType == 'u'){
        var delayTime = delay.slice(0, delay.length-1) * 1000;
    } else if(delayType == 'n'){
        var delayTime = delay.slice(0, delay.length-1);
    } else {
        console.log('Error with argument: ' + delay + ': Incorrect delay format. Format is an integer followed by "s" for seconds, "m" for milli, "u" for micro, and "n" for nanoseconds. Ex. 2u');
        process.exit(1);
    }
    
    
    //Set marker
    if(this.timeOutT1 == null){
        this.timeOutT1 = process.hrtime();
    }

    var difArray = process.hrtime(this.timeOutT1);
    var difTime = (difArray[0] * 1000000000) + difArray[1];
    
    
    if(difTime < delayTime){
        //Can potentially defer to less accurate setTimeout if delayTime > 25ms
        if(delayTime > 25000000){
            if(this.deferredTimeout == false){
                this.deferredTimeout = true;
                msDelay = (delayTime - 25000000) / 1000000.0;
                setTimeout(function(){thisTimer.setTimeout(task, args, delay, callback);}, msDelay);
            } else {
                setImmediate(function(){thisTimer.setTimeout(task, args, delay, callback);});
            }
        } else {
            setImmediate(function(){thisTimer.setTimeout(task, args, delay, callback);});
        }
    }
    else{   //time to run
        if(this.logging == true){
            console.log('nanotimer log: ' + 'actual wait - ' + difTime);
        }
        
        if(args){
            task.apply(null, args);
        } else{
            task();
        }
        
        this.timeOutT1 = null;
        this.deferredTimeout = false;
        
        if(callback){
            var data = {'waitTime':difTime};
            callback(data);
        }

    }
    
};

NanoTimer.prototype.clearInterval = function(){
    this.intervalContinue = false;
};

module.exports = NanoTimer;