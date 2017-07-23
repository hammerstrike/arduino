var fs = require('fs');
var destFile = 'demo.txt';

fs.writeFileSync(destFile, "Writing to a file synchronously from node.js", {"encoding":'utf8'});

console.log("*** File written successfully");

//reading the same file 
var fileData = fs.readFileSync(destFile, "utf8");
console.log(fileData);