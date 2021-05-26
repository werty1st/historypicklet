//create bookmarklet
var s = document.createElement("script");
s.src = `https://${process.env.URL}/app.js`;
s.type="module";
document.head.appendChild(s);


