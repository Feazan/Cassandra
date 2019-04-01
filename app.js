var express = require('express');
var app = express();
var multer = require('multer');
var cassandra = require('cassandra-driver');

var upload = multer({ dest: 'uploads/' });
app.set('view engine', 'ejs');

var client = new cassandra.Client({ contactPoints: [ '127.0.0.1' ], localDataCenter: 'datacenter1', keyspace: 'hw5' });
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

var upsertInfo = 'INSERT INTO hw5.imgs(filename, contents) VALUES(?,?)';
app.post('/deposit', upload.single('contents'), function(req, res) {
	var filename = req.body.filename;
	var contents = req.body.contents;

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
	console.log('req.body: ', req.body);
	var filename = req.body.filename;

	// Find filename in Cassandra and return it
	var getInfo = 'SELECT filename, contents FROM hw5.imgs WHERE filename = ?';
	client.execute(getInfo, [ 'someone' ], function(err, result) {
		if (err) {
			res.status(404).send({ msg: err });
		} else {
			console.log('Row content: %s', result.rows[0].filename);
			res.send({ status: 'OK' });
		}
	});
});

app.listen(3000, function() {
	console.log('Server Started...');
});
