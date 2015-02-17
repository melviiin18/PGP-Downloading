//=============== FROM CLI PARAMETER ===============//
var pg_user = process.argv[2];
var pg_password = process.argv[3];
var ENV = process.argv[4];

if(!pg_user) {
	console.log("Postgres user name is required. Terminating.")
	process.exit(0);
}
if(!pg_password){
	console.log("Postgres user password is required. Terminating.")
	process.exit(0);
}

if(!ENV){
	console.log("Environment settings ENV is required. Terminating.")
	process.exit(0);
}


//=============== SETTINGS ===============//

//var ENV = 'SERVERS_SA_5';
//var ENV = 'LAPTOP';

//var GEOSERVER = 'http://localhost:8080/geoserver';
var GEOSERVER = 'http://geoserver.namria.gov.ph/geoserver';
var WORKSPACE = 'geoportal';


var SETTINGS = {
	SERVERS_SA_5:{
		CONN_STRING:	'postgres://' + pg_user + ':' + pg_password + '@192.168.5.98:5432/geoportal',
		PORT:			8000
	},
	LAPTOP:{
		CONN_STRING:	'postgres://geoportal:@dm1n1$tr@t0r@localhost:5432/geoportal',
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


var hbs = require('express-hbs'); //https://github.com/barc/express-hbs
var auth = require('http-auth');
var basic = auth.basic({
    realm: 'Secured area',
    // this hta file must be existing on prod and must be gitignored
    file: __dirname + "/users.htpasswd"
});
var basicAuth = auth.connect(basic);




//=============== MAIN BODY ===============//

var CONN_STRING = SETTINGS[ENV].CONN_STRING;


//app.engine('.hbs', hbs({extname: '.hbs'}));
app.engine('hbs', hbs.express3({
    // additional options
}));
app.set('view engine', 'hbs');

// setup express
app.use(express.static(__dirname + '/app'));
app.use(Bparser());

// serve root page
app.get('/icsu', function(req, res){
  res.sendfile(__dirname + '/app/index.html');
});

// start
var server = app.listen(SETTINGS[ENV].PORT, function() {
    console.log('Listening on port %d', server.address().port);
});



hbs.handlebars.registerHelper("counter", function (index){
    return index + 1;
});

//  format an ISO date using Moment.js
//  http://momentjs.com/
//  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
//  usage: {{dateFormat creation_date format="MMMM YYYY"}}
hbs.handlebars.registerHelper('dateFormat', function(context, block) {
  if (window.moment) {
    var f = block.hash.format || "MMM Do, YYYY";
    return moment(Date(context)).format(f);
  }else{
    return context;   //  moment plugin not available. return data as is.
  };
});



// API
setAPI();



//=============== CUSTOM FUNCTIONS ===============//

function setAPI(){


	// a general proxy service
	// can be used to replace CORS Anywhere
	app.get('/proxy', function(req, res){

	    var url = req.query.url;
	    require('request').get(url).pipe(res);

	});

	app.get('/download', function(req, res){
		res.sendfile(__dirname + '/app/download.html');
	});

	// generate new transaction record
	app.post('/dl/transactions', function(req, res){
		var passcode = randomstring.generate(6).toUpperCase();

		query("insert into configuration.transactions(passcode, date_requested, expiration_date) values($1, now(), now() + INTERVAL '" + SETTINGS.EXPIRATION + " days');",[passcode],function(err, result){
			//res.json(result.rows?result.rows:result);
			res.json({passcode: passcode});
			//res.json({success: true, data: [{id:passcode}]});
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



	// download page
	app.post('/order', function(req, res){

	    var passcode = req.body.passcode;

		query("SELECT passcode, layers, agency, to_char(expiration_date, 'DD-MON-YYYY HH:MM:SS pm') as expires FROM configuration.transactions WHERE passcode = $1",[passcode],function(err, result){
			if(err)
				res.json(err);
			else {
				//res.json(result.rows?result.rows:result);
				var t = (result.rows.length > 0 ? result.rows[0] : null);
				var layers = (t? JSON.parse(t['layers']) :null);

				if(!layers)
			        res.end('Invalid passcode.')
			    else {
			        res.render('order', {layers: layers, passcode: passcode, expires: t.expires, agency: t.agency});
			    }
			}
		});





	});


	// actual download link
	app.get('/download/:passcode/:layer_name', function(req, res){

	    var passcode = req.params.passcode;
	    var layer_name = req.params.layer_name;

		query('SELECT * FROM configuration.transactions WHERE passcode = $1',[req.params.passcode],function(err, result){
			if(err)
				res.json(err);
			else {
				//res.json(result.rows?result.rows:result);

				var layers = (result.rows? JSON.parse(result.rows[0]['layers']) :null);
				var layer;
			    for(l in layers){
			        if(layers[l].layer === layer_name) {
			            layer = layers[l];
			            break;
			        }
			    }
			    // composer url
			    var url;
			    if(layer)
			        url = GEOSERVER + '/ows?service=WFS&version=1.0.0&request=GetFeature' +
			              '&typeName=' + WORKSPACE + ':' + layer.layer +
			              '&outputFormat=SHAPE-ZIP' +
			              (layer.bounds ? '&bbox=' + layer.bounds : '');

			    if(layer) {
			        var size = 0;
			        //TODO: hide password somewhere
			        require('request').get(url)
			        				.on('data', function(chunk){
			        				 	size += chunk;
			        				})
			        				.on('end', function(){
			        					console.log('Size is ' + size.length);
			        				})
			        				.auth('downloader', 'd0wnl0@d3r', false)
			        				.pipe(res);
			        //res.end('The url: ' + url + ' will be piped.');
			    } else {
			        res.end('Either the link has expired or not a valid download link.')
			    }
			}
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


/*

//=============== CORS-ANYWHERE ===============//

var host = process.env.PORT ? '0.0.0.0' : '127.0.0.1';
var port = process.env.PORT || 3000;
var cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
    //requireHeader: ['origin' 'x-requested-with'],
   // removeHeaders: ['cookie', 'cookie2']

}).listen(port, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
});

*/
