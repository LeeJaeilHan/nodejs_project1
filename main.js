const http = require('http');
const fs = require('fs');

var app = http.createServer(function(request,response){
  response.writeHead(200);
  response.end("hello server");
});

app.listen(3000);
