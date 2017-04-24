
/*------------------ Requiring our dependencies ----------------*/

var express    = require('express');
var app        = express();
var port       = process.env.PORT || 8080;
var layouts    = require('express-ejs-layouts');

/*-------------- Setting up the express listener ---------------*/

var server = app.listen(port, function() {
    console.log('CTE running and listening on port 8080');
})

/*--------------- Using ejs and express layouts ----------------*/

app.set('view engine', 'ejs');
app.use(layouts);

/*---------------------- Routing our app -----------------------*/

var io = require('socket.io').listen(server);
require('./app/routes')(app, io);
// app.use('/', require('./app/routes')(app, io));

/*------ Set static files (css and images, etc) location -------*/

app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static('bower_components'));