const http = require('http');
const fs = require('fs');

var app = http.createServer(function(request,response){
  const url = request.url;
  let template = '';
  if(url=='/') {
    template =
    `
    <!doctype html>
    <html>
      <head>
        <title>hello Server</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h2>Hello server</h2>
        <p>
          Let's start server
        </p>
      </body>
    </html>
    `
  }
  response.writeHead(200);
  response.end(template);
});

app.listen(3000);
