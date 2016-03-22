var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var users = require('./routes/users');
var mongoose = require('mongoose');

var app = express();

mongoose.connect('mongodb://admin:admin@jello.modulusmongo.net:27017/Y5tonumu');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users);

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening on port ' + port + '...');


