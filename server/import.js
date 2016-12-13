var fs = require('fs');
var BlueButton = require('bluebutton');
var MongoClient = require('mongodb').MongoClient;
var config = require('./config')

function pushToDB(file) {
    var xml = fs.readFileSync(file, 'utf-8');
    var myRecord = BlueButton(xml);

    function insertDoc(db, data, callback) {
        db.collection('patientsData').insertOne({
            "demographics": data.demographics,
            "results": data.results
        }, function(err, doc) {
            if (err) {
                throw err;
            } else {
                console.log("Inserted a document into the patients-data collection.");
                callback();
            }
        });
    }


    MongoClient.connect(config.dbURL, function(err, db) {
        //console.log("Connected to database server.");
        insertDoc(db, myRecord.data, function() {
            db.close();
        });
    });
}


for (var i = 2; i < process.argv.length; i++) {
    pushToDB(process.argv[i]);
}