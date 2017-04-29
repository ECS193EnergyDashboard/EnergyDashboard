var express = require('express');
var app = express();
var bodyParser = require('body-parser'); // to handle POST body
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
var jsonfile = require('jsonfile'); //read and write to json file


// Allow access to this directory
app.use(express.static('./'));

var templates=[];
var templatesLocation = './templates.json'
// load templates from templates.json
jsonfile.readFile(templatesLocation, function(err, obj) {
    if(!(obj=== undefined || obj == null))
        templates = obj;
    // console.dir(templates);
});

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

//This responds a POST request to /templates that adds a template to the json file
app.post('/templates', function(req, res) {
    // console.log("Got a POST request for the templates");
    // console.log("req.body: ", req.body);
    templates.push(req.body);
    //console.dir(templates);
    res.status(200).send('template saved on server');
    // save to file
    jsonfile.writeFile(templatesLocation, templates, function (err) {
      // console.error("Error writing to json", err)
  });
})

//This responds a POST request to /templatesDelete that deletes
app.post('/templatesDelete', function(req, res) {
    // console.log("Got a POST request for the templatesDelete");
    // console.log("req.body: ", req.body);

    console.log(templates.length);
    console.dir(templates);

    // Remove the template
    var index = 0;
    for(var template of templates){
        if(template.name == req.body.name){
            console.log("=======----------   DELETING  -----------=======  ", index)
            break;
        }
        index++;
    }
    templates.splice(index, 1);

    console.log();
    console.log(templates.length);
    console.dir(templates);
    res.status(200).send('template deleted on server');
    // save to file
    jsonfile.writeFile(templatesLocation, templates, function (err) {
      console.error(err)
  });
})

//This responds a POST request to /templatesDelete that updates
app.post('/templatesUpdate', function(req, res) {
    // console.log("Got a POST request for the templatesUpdate");
    // console.log("req.body: ", req.body);

    console.log(templates.length);
    console.dir(templates);

    // Find the template
    var index = 0;
    for(var template of templates){
        if(template.name == req.body.name && template.type == req.body.type){
            break;
        }
        index++;
    }
    // Update the template
    template.colObj = req.body.colObj;


    console.dir(templates);
    res.status(200).send('template updated on server');
    // save to file
    jsonfile.writeFile(templatesLocation, templates, function (err) {
      console.error(err)
  });
})


//This responds to getTemplates
app.get('/getTemplates', function(req, res) {
    // console.log("Got a GET request for getTemplates");

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

app.get('/test', function(req, res) {
    res.status(200).send("This is a test");
})


var server = app.listen(8081, function() {

    var host = server.address().address
    var port = server.address().port
    console.log("host", host);
    console.log("Example app listening at http://%s:%s", host, port)
})


function shutdown() {
    console.log("Shutting down server...")
    // Handle any cleanup here, closing DB connections etc


    server.close(function() {
        process.exit(0);
    })
}

process.on('SIGTERM', shutdown);

/*
To start the server: node server.js



*/
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
