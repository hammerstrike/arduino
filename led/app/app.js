var socket = io();

function on(){
    socket.emit('on');
}
function off(){
    socket.emit('off');
}
function blink(){
    socket.emit('blink');
}
function stop(){
    socket.emit('stop');
}


document.getElementById('on').onclick = on;
document.getElementById('off').onclick = off;
document.getElementById('blink').onclick = blink;
document.getElementById('stop').onclick = stop;
