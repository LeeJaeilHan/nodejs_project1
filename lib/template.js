module.exports = {
  HTML : function(title, list, body) {
    return `
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
  },
  List : function (files) {
    let list = '<ul>';
    let cnt=0;
    while(cnt < files.length) {
      list = list + `<li><a href="/topic/${files[cnt]}">${files[cnt]}</a></li>`;
      cnt = cnt + 1;
    }
    list = list + '</ul>'
    return list;
  }
}
