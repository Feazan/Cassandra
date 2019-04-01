var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cassandra = require('cassandra-driver');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

var client = new cassandra.Client({ contactPoints: [ '130.245.170.207' ] });
client.connect(function(err, result) {
	console.log('Cassandra connected');
});

app.get('/', function(req, res) {
	res.send('Welcome to the Home Page!');
});

app.post('/deposit', function(req, res) {
	var filename = req.body.filename;
	var contents = req.body.contents;

	// Insert into Cassandra
});

app.listen(3000, function() {
	console.log('Server Started...');
});
