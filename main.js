const express = require('express');
const fs = require('fs');
const qs = require('querystring');
const bodyParser = require('body-parser');
const compression = require('compression');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const app = express();
const template = require('./lib/template.js');
const topicRouter = require('./routes/topic');
const indexRouter = require('./routes/index')

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

//router
app.use('/',indexRouter);
app.use('/topic',topicRouter);

// middleware 순차 실행된다 -> 여기까지 오면 못찾은것
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3000,function(){
  console.log('Example app listening on port 3000!')
});
