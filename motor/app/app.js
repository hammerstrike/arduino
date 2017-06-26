var socket = io();

function moveForward(){
    socket.emit('start');
}
function turnRight(){
    socket.emit('right');
}
function turnLeft(){
    socket.emit('left');
}
function moveReverse(){
    socket.emit('reverse');
}

function stop(){

    socket.emit('stop');
}

socket.on('speed',function (data) {
  $('.speed span').html(data);
})


document.getElementById('forward').onclick = moveForward;
document.getElementById('right').onclick = turnRight;
document.getElementById('left').onclick = turnLeft;
document.getElementById('reverse').onclick = moveReverse;
document.getElementById('stop').onclick = stop;