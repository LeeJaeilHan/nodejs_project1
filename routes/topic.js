const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');
const template = require('../lib/template.js');

router.get('/create',function(request,response){
  let title = 'WEB-create';
  let list = template.List(request.list);
  let html = template.HTML(title,list,
    `
    <form action="/topic/create_process" method="post">
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

router.post('/create_process',function(request,response){
  let post = request.body;
  let title = post.title;
  let description = post.description;
  fs.writeFile(`data/${title}`,description,function(err){
    response.redirect(`/topic/${title}`);
  });
});

router.get('/update/:updateid',function(request,response){
  const filteredId = path.parse(request.params.updateid).base;
  fs.readFile(`data/${filteredId}`,'utf8',function(err,description){
    let title = filteredId;
    let sanitizedTitle = sanitizeHtml(title);
    let sanitizedDescription = sanitizeHtml(description);
    let list = template.List(request.list);
    let html = template.HTML(title,list,
      `
      <form action="/topic/update_process" method="post">
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

router.post('/update_process',function(request,response){
  let post = request.body;
  let id = post.id;
  let title = post.title;
  let description = post.description;
  fs.rename(`data/${id}`,`data/${title}`,function(err){
    fs.writeFile(`data/${title}`,description,function(err){
      response.redirect(`/topic/${title}`);
    });
  });
});

router.post('/delete_process',function(request,response){
  let post = request.body;
  let id = post.id;
  let filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function(err){
    response.redirect('/');
  });
});


router.get('/:pageid',function(request,response,next) {
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
      <a href="/topic/create">create</a>
      <a href="/topic/update/${sanitizedTitle}">update</a>
      <form action="/topic/delete_process" method="post">
        <input type="hidden" name="id" value=${sanitizedTitle}>
        <input type="submit" value="delete">
      </form>
      <p>${sanitizedDescription}</p>
      `
    );
    response.send(html);
  });
});
module.exports = router;
