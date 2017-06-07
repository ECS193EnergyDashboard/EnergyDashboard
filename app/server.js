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
    // console.log("Got a GET request for the homepage -- here");

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
    //console.log("req.body: ", req.body);
    templates.push(req.body);
    //console.dir(templates);
    res.status(200).send('template saved on server');
    // save to file
    jsonfile.writeFile(templatesLocation, templates, function (err) {
      console.error("Error writing to json", err)
  });
})

//This responds a POST request to /templatesDelete that deletes
app.post('/templatesDelete', function(req, res) {
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
    console.log("req.body: ", req.body);

    // console.log(templates.length);

    // Find the template
    var index = 0;
    for(var template of templates){
        if(template.name == req.body.name && arraysEqual(template.type, req.body.type)){
            console.log("FOUND");
            break;
        }
        index++;
    }
    // Update the template
    template.colObj = req.body.colObj;

    // JSON.stringify(template.type)==JSON.stringify(req.body.type)


    console.dir("template ", template);
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

// Replace with the following to see the host serving IP and port
//var server = app.listen(8081, "127.0.0.1", function() {
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


function arraysEqual(a,b) {
    /*
        Array-aware equality checker:
        Returns whether arguments a and b are == to each other;
        however if they are equal-lengthed arrays, returns whether their
        elements are pairwise == to each other recursively under this
        definition.
    */
    if (a instanceof Array && b instanceof Array) {
        if (a.length!=b.length)  // assert same length
            return false;
        for(var i=0; i<a.length; i++)  // assert each element equal
            if (!arraysEqual(a[i],b[i]))
                return false;
        return true;
    } else {
        return a==b;  // if not both arrays, should be the same
    }
}

process.on('SIGTERM', shutdown);



/*
To start the server: node server.js



*/
