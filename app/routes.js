
/*------------------ Requiring our dependencies ----------------*/

var rethink = require('rethinkdb');
var express = require('express');
var app     = express();
var http    = require('http').Server(app);
// var io      = require('socket.io')(http);
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));

/*------------------ Creating the route object -----------------*/

// var router = express.Router();

/*---------- Exporting our router for other .js files ----------*/

module.exports = function (router, io) {
// module.exports = router;

/*---------------------- Routing the app -----------------------*/

router.get('/', function(req, res) {
    res.render('pages/index');
});

router.get('/editor', function(req, res) {
    res.render('pages/editor', { data : req.query });
});

router.get('/create', function(req, res) {
    var id = Math.round((Math.random() * 1000000));
    var name = req.query.name;

    res.redirect('/editor?room='+id+'&user='+name);
});

router.get('/login', function(req, res) {
    res.render('pages/login');
});

/*--------------------- Connecting the app --------------------*/

// Utilizando o método de conexão do RethinkDB
rethink.connect({ host: process.env.IP, port: 28015 }, function(err, conn) {
    if(err) throw err;
    rethink.db('test').tableList().run(conn, function(err, response) {
        if(response.indexOf('edit') > -1) {
            // do nothing it is created...
            console.log('Table exists, skipping create...');
            console.log('Tables - ' + response);
        } else {
            // create table...
            console.log('Table does not exist. Creating');
            rethink.db('test').tableCreate('edit').run(conn);  
        }
    });

    io.on('connection', function(socket) {
        console.log('a user connected');
        socket.on('connection', function(socket) {
            console.log('user disconnected')
        });
        socket.on('document-update', function(msg) {
            console.log(msg);
            rethink.table('edit').insert({id: msg.id,value: msg.value, user: msg.user}, {conflict: "update"}).run(conn, function(err, res){
              if (err) throw err;
              //console.log(JSON.stringify(res, null, 2));
            });
        });
        rethink.table('edit').changes().run(conn, function(err, cursor) {
            if (err) throw err;
            cursor.each(function(err, row) {
                if (err) throw err;
                io.emit('doc', row);
            });
        });
    });

    app.get('/getData/:id', function(req, res, next){
        rethink.table('edit').get(req.params.id).
            run(conn, function(err, result) {
                if (err) throw err;
                res.send(result);
                //return next(result);
        });
    });
});

};
