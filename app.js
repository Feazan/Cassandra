var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var cassandra = require('cassandra-driver');
var file = require('file-system');

app.use(bodyParser.urlencoded({ extended: true }));
var upload = multer({ dest: 'uploads/' });
app.set('view engine', 'ejs');

var client = new cassandra.Client({
	contactPoints: [ '127.0.0.1:9042' ],
	localDataCenter: 'datacenter1',
	keyspace: 'hw5'
});
client.connect(function(err, result) {
	if (err) {
		console.log('Error Occurred: ', err);
	} else {
		console.log('Cassandra Connected!');
	}
});

app.get('/', function(req, res) {
	res.render('index');
});

app.post('/deposit', upload.single('contents'), function(req, res) {
	var upsertInfo = 'INSERT INTO hw5.imgs(filename, contents) VALUES(?,?)';
	var filename = req.body.filename;
	var contents = new Buffer(file.readFileSync(req.file.path));

	// Insert into Cassandra
	console.log('Filename: ', filename, ' Contents: ', contents);
	client.execute(upsertInfo, [ filename, contents ], function(err, result) {
		if (err) {
			res.status(404).send({ msg: err });
		} else {
			console.log('Image Added!');
			res.send({ status: 'OK' });
		}
	});
});

app.get('/retrieve', function(req, res) {
	console.log('Inside retrieve route');
	console.log('filename: ', req.query.filename);
	// var filename = req.body.filename;

	// Find filename in Cassandra and return it
	var getInfo = 'SELECT filename, contents FROM hw5.imgs WHERE filename = ?';
	client.execute(getInfo, req.query.filename, function(err, result) {
		if (err) {
			res.status(404).send({ msg: err });
		} else {
			console.log('Row content: %s', result.rows);
			res.send({ status: 'OK' });
		}
	});
});

app.listen(3000, function() {
	console.log('Server Started...');
});
