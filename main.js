const express = require('express');
const app = express();
const fs = require('fs');
const qs = require('querystring');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

app.get('/',function(request,response){
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
    response.send(html);
  });
});

app.get('/page/:pageid',function(request,response) {
  fs.readdir('./data', function(err,filelist){
    let filteredId = request.params.pageid;
    fs.readFile(`data/${filteredId}`,'utf8',function(err,description){
      let title = filteredId;
      let sanitizedTitle = sanitizeHtml(title);
      let list = template.List(filelist);
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
  });
})

app.get('/create',function(request,response){
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
    response.send(html);
  });
});

app.post('/create_process',function(request,response){
  let body = '';
  request.on('data',function(data){
    body = body + data;
  });
  request.on('end',function(){
    let post = qs.parse(body);
    let title = post.title;
    let description = post.description;
    fs.writeFile(`data/${title}`,description,function(err){
      response.writeHead(301, {location:`/page/${title}`});
      response.end();
    });
  });
});

app.get('/update/:updateid',function(request,response){
  fs.readdir('./data', function(err,filelist){
    const filteredId = path.parse(request.params.updateid).base;
    fs.readFile(`data/${filteredId}`,'utf8',function(err,description){
      let title = filteredId;
      let sanitizedTitle = sanitizeHtml(title);
      let sanitizedDescription = sanitizeHtml(description);
      let list = template.List(filelist);
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
});

app.post('/update_process',function(request,response){
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
        response.redirect(`/page/${title}`);
      });
    });
  });
});

app.post('/delete_process',function(request,response){
  let body = '';
  request.on('data',function(data){
    body = body + data;
  });
  request.on('end',function(){
    let post = qs.parse(body);
    let id = post.id;
    let filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function(err){
      response.redirect('/');
    });
  });
});

app.listen(3000,function(){

});
// const http = require('http');
// const fs = require('fs');
// const url = require('url');
// const qs = require('querystring');
// const path = require('path');
// var sanitizeHtml = require('sanitize-html');
// const template = require('./lib/template.js');
//
// const app = http.createServer(function(request,response){
//   const _url = request.url;
//   const pathname = url.parse(_url,true).pathname;
//   const queryData = url.parse(_url,true).query;
//
//   if(pathname == '/'){
//     if(queryData.id == undefined) {
//       fs.readdir('data', function(err,filelist){
//         let title = 'Hello Server';
//         let description = "Server is ..."
//         let list = template.List(filelist);
//         let html = template.HTML(title,list,
//           `
//           <h2>${title}</h2>
//           <a href="/create">create</a>
//           <p>
//           ${description}
//           </p>
//           `
//         );
//         response.writeHead(200);
//         response.end(html);
//       });
//     } else {
//       fs.readdir('./data', function(err,filelist){
//         let filteredId = path.parse(queryData.id).base;
//         fs.readFile(`data/${filteredId}`,'utf8',function(err,description){
//           let title = filteredId;
//           let sanitizedTitle = sanitizeHtml(title);
//           let list = template.List(filelist);
//           let sanitizedDescription = sanitizeHtml(description);
//           let html = template.HTML(title,list,
//             `
//             <h2>${sanitizedTitle}</h2>
//             <a href="/create">create</a>
//             <a href="/update?id=${sanitizedTitle}">update</a>
//             <form action="/delete_process" method="post">
//               <input type="hidden" name="id" value=${sanitizedTitle}>
//               <input type="submit" value="delete">
//             </form>
//             <p>${sanitizedDescription}</p>
//             `
//           );
//
//           response.writeHead(200);
//           response.end(html);
//         });
//       });
//     }
//   } else if (pathname == '/create') {
//     fs.readdir('data', function(err,filelist){
//       let title = 'WEB-create';
//       let list = template.List(filelist);
//       let html = template.HTML(title,list,
//         `
//         <form action="/create_process" method="post">
//           <p>
//             <input type="text" name="title" placeholder="title">
//           </p>
//           <p>
//             <textarea name="description" placeholder="description"></textarea>
//           </p>
//           <input type="submit">
//         </form>
//         `
//       );
//       response.writeHead(200);
//       response.end(html);
//     });
//   } else if (pathname == '/create_process') {
//     let body = '';
//     request.on('data',function(data){
//       body = body + data;
//     });
//     request.on('end',function(){
//       let post = qs.parse(body);
//       let title = post.title;
//       let description = post.description;
//       fs.writeFile(`data/${title}`,description,function(err){
//         response.writeHead(301, {location:`/?id=${title}`});
//         response.end();
//       });
//     });
//   } else if (pathname == '/update') {
//     fs.readdir('./data', function(err,filelist){
//       const filteredId = path.parse(queryData.id).base;
//       fs.readFile(`data/${filteredId}`,'utf8',function(err,description){
//         let title = filteredId;
//         let sanitizedTitle = sanitizeHtml(title);
//         let sanitizedDescription = sanitizeHtml(description);
//         let list = template.List(filelist);
//         let html = template.HTML(title,list,
//           `
//           <form action="/update_process?id=${sanitizedTitle}" method="post">
//             <input type="hidden" name="id" value=${sanitizedTitle}>
//             <p>
//               <input type="text" name="title" value=${sanitizedTitle} placeholder="title">
//             </p>
//             <p>
//               <textarea name="description" placeholder="description">${sanitizedDescription}</textarea>
//             </p>
//             <input type="submit">
//           </form>
//           `
//         );
//         response.writeHead(200);
//         response.end(html);
//       });
//     });
//   } else if (pathname == '/update_process') {
//     let body = '';
//     request.on('data',function(data){
//       body = body + data;
//     });
//     request.on('end',function(){
//       let post = qs.parse(body);
//       let id = post.id;
//       let title = post.title;
//       let description = post.description;
//       fs.rename(`data/${id}`,`data/${title}`,function(err){
//         fs.writeFile(`data/${title}`,description,function(err){
//           response.writeHead(302, {location:`/?id=${title}`});
//           response.end();
//         });
//       });
//     });
//   } else if (pathname == '/delete_process') {
//     let body = '';
//     request.on('data',function(data){
//       body = body + data;
//     });
//     request.on('end',function(){
//       let post = qs.parse(body);
//       let id = post.id;
//       let filteredId = path.parse(id).base;
//       fs.unlink(`data/${filteredId}`, function(err){
//         response.writeHead(302, {location:`/`});
//         response.end();
//       });
//     });
//   } else {
//     response.writeHead(404);
//     response.end('Not Found');
//   }
// });
//
// app.listen(3000);
