var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var employees = require('./routes/employees');
var mongoose = require('mongoose');
var multer  = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name + ".png")
    }
});
var upload = multer({storage: storage});

var app = express();

mongoose.connect('mongodb://admin:admin@jello.modulusmongo.net:27017/p3uvaQez');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/employees', employees);

app.post('/upload', upload.any(), (req, res) => {
    // req.files is array of files
    console.log(req.files);
    // req.body will hold the text fields, if there were any
    console.log(req.body);
});

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening on port ' + port + '...');
