var express = require('express');
var Bparser = require('body-parser');
var app = express();

app.use(express.static(__dirname + '/App'));
app.use(Bparser()); 

app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
}); 


var server = app.listen(8080, function() {
    console.log('Listening on port %d', server.address().port);
});
