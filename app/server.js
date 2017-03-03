var express = require('express');
var app = express();
var bodyParser = require('body-parser'); // to handle POST body
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var templates=[];
// Allow access to this directory
app.use(express.static('./'));

//This responds on the homepage
app.get('/', function(req, res) {
    console.log("Got a GET request for the homepage -- here");

    var options = {
        root: __dirname,
        dotfiles: 'allow',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    //res.send('Hello POST');
    //res.sendFile('index.html', options);

})

//This responds a POST request for the homepage
app.post('/templates', function(req, res) {
    console.log("Got a POST request for the templates");
    //console.log("req.body: ", req.body);
    templates.push(req.body);
    console.log("templates: ", templates);
    res.status(200).send('template saved on server');
})

//This responds to getTemplates
app.get('/getTemplates', function(req, res) {
    console.log("Got a GET request for getTemplates");

    var options = {
        root: __dirname,
        dotfiles: 'allow',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true,
            'Content-Type': 'application/json'
        }
    };
    res.status(200).send(templates);

})

// // This responds a DELETE request for the /del_user page.
// app.delete('/del_user', function (req, res) {
//    console.log("Got a DELETE request for /del_user");
//    res.send('Hello DELETE');
// })

// This responds a GET request for the /list_user page.
/*app.get('/list_user', function(req, res) {
    console.log("Got a GET request for /list_user");
    var options = {
        root: __dirname,
        dotfiles: 'allow',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true,
            'Content-Type': 'application/json'
        }
    };

    res.sendFile('index2.html', options);
})*/

// This responds a GET request for abcd, abxcd, ab123cd, and so on
// app.get('/ab*cd', function(req, res) {
//    console.log("Got a GET request for /ab*cd");
//    res.send('Page Pattern Match');
// })

var server = app.listen(8081, "127.0.0.1", function() {

    var host = server.address().address
    var port = server.address().port
    console.log("host", host);
    console.log("Example app listening at http://%s:%s", host, port)
})

/*
To start the server: node server.js



*/
