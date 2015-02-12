//=============== FROM CLI PARAMETER ===============//
var pg_user = process.argv[2];
var pg_password = process.argv[3];

if(!pg_user) {
	console.log("Postgres user name is required. Terminating.")
	process.exit(0);
} else if(!pg_password){
	console.log("Postgres user password is required. Terminating.")
	process.exit(0);
} else {
	// we're good to go. proceed.
}



//=============== SETTINGS ===============//

//var ENV = 'SERVERS_SA_5';
var ENV = 'LAPTOP';

var SETTINGS = {
	SERVERS_SA_5:{
		CONN_STRING:	'postgres://' + pg_user + ':' + pg_password + '@192.168.5.98:5432/geoportal',
		PORT:			8000
	},
	LAPTOP:{
		CONN_STRING:	'postgres://postgres:@localhost:5432/geoportal',
		PORT:			8000
	},
	EXPIRATION: 7	// days the download link will expire
};


//=============== VARIABLES ===============//

var express = require('express');
var Bparser = require('body-parser');
var app = express();

var pg = require('pg');

var randomstring = require('randomstring');




//=============== MAIN BODY ===============//

var CONN_STRING = SETTINGS[ENV].CONN_STRING;


// setup express
app.use(express.static(__dirname + '/App'));
app.use(Bparser()); 

// serve root page
app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
}); 

// start 
var server = app.listen(SETTINGS[ENV].PORT, function() {
    console.log('Listening on port %d', server.address().port);
});

// API
setAPI();



//=============== CUSTOM FUNCTIONS ===============//

function setAPI(){


	// generate new transaction record
	app.get('/dl/new', function(req, res){
		var passcode = randomstring.generate(6).toUpperCase();
		
		query("insert into configuration.transactions(passcode, date_requested, expiration_date) values($1, now(), now() + INTERVAL '" + SETTINGS.EXPIRATION + " days');",[passcode],function(err, result){
			res.json(result.rows?result.rows:result);
		});
	});

	// update transaction
	app.put('/dl/transactions/:passcode', function(req, res){
	
		var passcode = req.params.passcode
		var sql = MultilineWrapper(function(){/*
			UPDATE configuration.transactions 
			SET 
				date_requested=COALESCE($1, date_requested), 
				expiration_date=COALESCE($2, expiration_date),
				layers=COALESCE($3, layers),
				contact_person=COALESCE($4, contact_person),
				agency=COALESCE($5, agency)
			WHERE passcode = $6;
		*/});
		
		var data = [	
			req.body.date_requested, 
			req.body.expiration_date, 
			req.body.layers,  // '[{"layer": "depded_beis", "bounds": [1,2,3,4]}]'
			req.body.contact_person, 
			req.body.agency, 
			passcode 
		];
		
		query(sql, data,
			function(err, result){
				if(err)
					res.json(err);
				else
					res.json(result.rows?result.rows:result);
			}
		);
	
	});
	
	// get transaction table
	app.get('/dl/transactions', function(req, res){
		query('select * from configuration.transactions order by date_requested desc;',[],function(err, result){
			if(err)
				res.json(err);
			else
				res.json(result.rows?result.rows:result);
		});
	});
	
	// get transaction detail
	app.get('/dl/:passcode', function(req, res){
		query('SELECT * FROM configuration.transactions WHERE passcode = $1',[req.params.passcode],function(err, result){
			if(err)
				res.json(err);
			else
				res.json(result.rows?result.rows:result);
		});
	});
		

	// get a layer
	app.get('/layer/:layer_name', function(req, res){
		query('select * from configuration.layer_metadata where layer_name = $1',[req.params.layer_name],function(err, result){
			res.json(result.rows?result.rows:result);
		});
	});
	
	
	

}



function query(sql, params, callback){
	pg.connect(CONN_STRING, function(err, client, done) {
		if(err) {
			return console.error('error fetching client from pool', err);
		}
		client.query(sql, params, function(err, result) {
			done();
			if(err) {
				console.log(err);
				callback(err, result);
			} else {
				callback(null, result);			
			}
		});
	});
}; 

//Function that wraps multiline
function MultilineWrapper(f){
	return (f.toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1]).trim();
}
