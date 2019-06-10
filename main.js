const express = require('express');
const app = express();
const fs = require('fs');
const qs = require('querystring');
const bodyParser = require('body-parser');
const compression = require('compression');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

//use middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.get('*',function(request,response,next){
  fs.readdir('data', function(err,filelist){
    request.list = filelist;
    next();
  });
});

app.get('/',function(request,response){
  let title = 'Hello Server';
  let description = "use express"
  let list = template.List(request.list);
  let html = template.HTML(title,list,
    `
    <h2>${title}</h2>
    <a href="/create">create</a>
    <p>${description}</p>
    <img src="images/hello.jpg" style="width:300px; height: auto;">
    `
  );
  response.send(html);
});

app.get('/page/:pageid',function(request,response,next) {
  let filteredId = request.params.pageid;
  fs.readFile(`data/${filteredId}`,'utf8',function(err,description){
    if(err) next(err);
    let title = filteredId;
    let sanitizedTitle = sanitizeHtml(title);
    let list = template.List(request.list);
    let sanitizedDescription = sanitizeHtml(description);
    let html = template.HTML(title,list,
      `
      <h2>${sanitizedTitle}</h2>
      <a href="/create">create</a>
      <a href="/update/${sanitizedTitle}">update</a>
      <form action="/delete_process" method="post">
        <input type="hidden" name="id" value=${sanitizedTitle}>
        <input type="submit" value="delete">
      </form>
      <p>${sanitizedDescription}</p>
      `
    );
    response.send(html);
  });
})

app.get('/create',function(request,response){
  let title = 'WEB-create';
  let list = template.List(request.list);
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
  response.send(html);
});

app.post('/create_process',function(request,response){
  let post = request.body;
  let title = post.title;
  let description = post.description;
  fs.writeFile(`data/${title}`,description,function(err){
    response.redirect(`/page/${title}`);
  });
});

app.get('/update/:updateid',function(request,response){
  const filteredId = path.parse(request.params.updateid).base;
  fs.readFile(`data/${filteredId}`,'utf8',function(err,description){
    let title = filteredId;
    let sanitizedTitle = sanitizeHtml(title);
    let sanitizedDescription = sanitizeHtml(description);
    let list = template.List(request.list);
    let html = template.HTML(title,list,
      `
      <form action="/update_process?id=${sanitizedTitle}" method="post">
        <input type="hidden" name="id" value=${sanitizedTitle}>
        <p>
          <input type="text" name="title" value=${sanitizedTitle} placeholder="title">
        </p>
        <p>
          <textarea name="description" placeholder="description">${sanitizedDescription}</textarea>
        </p>
        <input type="submit">
      </form>
      `
    );
    response.send(html);
  });
});

app.post('/update_process',function(request,response){
  let post = request.body;
  let id = post.id;
  let title = post.title;
  let description = post.description;
  fs.rename(`data/${id}`,`data/${title}`,function(err){
    fs.writeFile(`data/${title}`,description,function(err){
      response.redirect(`/page/${title}`);
    });
  });
});

app.post('/delete_process',function(request,response){
  let post = request.body;
  let id = post.id;
  let filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function(err){
    response.redirect('/');
  });
});

// middleware 순차 실행된다 -> 여기까지 오면 못찾은것
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3000,function(){

});
