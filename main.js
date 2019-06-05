const http = require('http');
const fs = require('fs');
const url = require('url');

function templateHTML(title, list, body) {
  let template = `
  <!doctype html>
  <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h2><a href="/">WEB1</a></h2>
      ${list}
      ${body}
    </body>
  </html>
  `
  return template;
}

function templateList(files) {
  let list = '<ul>';
  let cnt=0;
  while(cnt < files.length) {
    list = list + `<li><a href="/?id=${files[cnt]}">${files[cnt]}</a></li>`;
    cnt = cnt + 1;
  }
  list = list + '</ul>'
  return list;
}

var app = http.createServer(function(request,response){
  const _url = request.url;
  const pathname = url.parse(_url,true).pathname;
  const queryData = url.parse(_url,true).query;

  if(pathname == '/'){
    if(queryData.id == undefined) {
      fs.readdir('data', function(err,filelist){
        let title = 'Hello Server';
        let description = "Server is ..."
        let list = templateList(filelist);
        let template = templateHTML(title,list,
          `
          <h2>${title}</h2>
          <p>
          ${description}
          </p>
          `
        );
        response.writeHead(200);
        response.end(template);
      });
    } else {
      fs.readdir('./data', function(err,filelist){
        fs.readFile(`data/${queryData.id}`,'utf8',function(err,description){
          let title = queryData.id;
          let list = templateList(filelist);
          let template = templateHTML(title,list,
            `
            <h2>${title}</h2>
            <p>${description}</p>
            `
          );
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  } else {
    response.writeHead(404);
    response.end('Not Found');
  }
});

app.listen(3000);
