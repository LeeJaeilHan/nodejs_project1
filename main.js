const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template.js');

const app = http.createServer(function(request,response){
  const _url = request.url;
  const pathname = url.parse(_url,true).pathname;
  const queryData = url.parse(_url,true).query;

  if(pathname == '/'){
    if(queryData.id == undefined) {
      fs.readdir('data', function(err,filelist){
        let title = 'Hello Server';
        let description = "Server is ..."
        let list = template.List(filelist);
        let html = template.HTML(title,list,
          `
          <h2>${title}</h2>
          <a href="/create">create</a>
          <p>
          ${description}
          </p>
          `
        );
        response.writeHead(200);
        response.end(html);
      });
    } else {
      fs.readdir('./data', function(err,filelist){
        fs.readFile(`data/${queryData.id}`,'utf8',function(err,description){
          let title = queryData.id;
          let list = template.List(filelist);
          let html = template.HTML(title,list,
            `
            <h2>${title}</h2>
            <a href="/create">create</a>
            <a href="/update?id=${title}">update</a>
            <form action="/delete_process" method="post">
              <input type="hidden" name="id" value=${title}>
              <input type="submit" value="delete">
            </form>
            <p>${description}</p>
            `
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    }
  } else if (pathname == '/create') {
    fs.readdir('data', function(err,filelist){
      let title = 'WEB-create';
      let list = template.List(filelist);
      let html = template.HTML(title,list,
        `
        <form action="/create_process" method="post">
          <p>
            <input type="text" name="title" placeholder="title">
          </p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <input type="submit">
        </form>
        `
      );
      response.writeHead(200);
      response.end(html);
    });
  } else if (pathname == '/create_process') {
    let body = '';
    request.on('data',function(data){
      body = body + data;
    });
    request.on('end',function(){
      let post = qs.parse(body);
      let title = post.title;
      let description = post.description;
      fs.writeFile(`data/${title}`,description,function(err){
        response.writeHead(301, {location:`/?id=${title}`});
        response.end();
      });
    });
  } else if (pathname == '/update') {
    fs.readdir('./data', function(err,filelist){
      fs.readFile(`data/${queryData.id}`,'utf8',function(err,description){
        let title = queryData.id;
        let list = template.List(filelist);
        let html = template.HTML(title,list,
          `
          <form action="/update_process?id=${title}" method="post">
            <input type="hidden" name="id" value=${title}>
            <p>
              <input type="text" name="title" value=${title} placeholder="title">
            </p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <input type="submit">
          </form>
          `
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (pathname == '/update_process') {
    let body = '';
    request.on('data',function(data){
      body = body + data;
    });
    request.on('end',function(){
      let post = qs.parse(body);
      let id = post.id;
      let title = post.title;
      let description = post.description;
      fs.rename(`data/${id}`,`data/${title}`,function(err){
        fs.writeFile(`data/${title}`,description,function(err){
          response.writeHead(302, {location:`/?id=${title}`});
          response.end();
        });
      });
    });
  } else if (pathname == '/delete_process') {
    let body = '';
    request.on('data',function(data){
      body = body + data;
    });
    request.on('end',function(){
      let post = qs.parse(body);
      let id = post.id;
      fs.unlink(`data/${id}`, function(err){
        response.writeHead(302, {location:`/`});
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end('Not Found');
  }
});

app.listen(3000);
