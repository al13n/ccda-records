var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs')

app.use(express.static("../public"));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}))

function queryPatientsData(fn) {
    MongoClient.connect(config.dbURL, function(err, db) {
        //console.log("Connected to database server.");

        function patient(demographics, results) {
            var obj = {
                demographics: demographics,
                results: results
            };
            return obj;
        }

        var queryDBAllPatients = function(db, callback) {
            var cursor = db.collection('patientsData').find();
            resList = []
            cursor.each(function(err, doc) {
                if (doc != null) {
                    var obj = new patient(doc.demographics, doc.results);
                    resList.push(obj);
                } else {
                    callback(resList);
                }
            });
        };

        queryDBAllPatients(db, function(resList) {    
            db.close();
            fn(resList);
        });
    });
}
app.use("/patientsData", function(req, res){
	queryPatientsData(function(list){
		res.send(list);
	});
});

app.listen(config.webPort);
console.log('Listening on port' + config.webPort);