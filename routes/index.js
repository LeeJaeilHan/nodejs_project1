const express = require('express');
const router = express.Router();
const template = require('../lib/template.js');

router.get('/',function(request,response){
  let title = 'Hello Server';
  let description = "use express"
  let list = template.List(request.list);
  let html = template.HTML(title,list,
    `
    <h2>${title}</h2>
    <a href="/topic/create">create</a>
    <p>${description}</p>
    <img src="/images/hello.jpg" style="width:300px; height: auto;">
    `
  );
  response.send(html);
});

module.exports = router;
