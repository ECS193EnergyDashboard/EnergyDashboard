var pgp = require('pg-promise')();
const https = require('https');

// prepare connection
var cn = {
    host: 'localhost',
    port: 5432,  //select * from pg_settings where name = 'port';
    database: 'postgres',
    user: 'postgres',
    password: 'password'
};

// Creating a new database instance from the connection details
var db = pgp(cn);

// create buildings table if doesnt exist
db.any("CREATE TABLE IF NOT EXISTS buildings(name varchar(80) PRIMARY KEY, url varchar(256), webid varchar(256) )");

//make select
/*db.any("select * from weather")
    .then(function (data) {
        // success;
        console.log(data);
    })
    .catch(function (error) {
        // error;
        console.error("Error: ", error);
    });*/

// get buildings

https.get('https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/elements/E0bgZy4oKQ9kiBiZJTW7eugwDBxX8Kms5BG77JiQlqSuWwVVRJTC1BRlxBQ0VcVUMgREFWSVNcQlVJTERJTkdT/elements', (res) => {
/*    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);*/
    //console.log("http responese: ", res);

    var body = '';
        res.on('data', (chunk) => {
        //console.log(`BODY: ${chunk}`);
        body += chunk;
    });

    // end of data
    res.on('end', () => {
        var datajs = JSON.parse(body);
        //console.log('ITEM: ')
        for(var i in datajs.Items){
            /*console.log(datajs.Items[i].Name); //works
            console.log(datajs.Items[i].WebId);
            console.log(datajs.Items[i].Links.Self);
            console.log("length: ", datajs.Items.length);*/



            // insert into db if doesnt exist
            db.any('insert into buildings values(${Name}, ${WebId}, ${url})',
                {
                    Name:   datajs.Items[i].Name,
                    WebId:  datajs.Items[i].WebId,
                    url:    datajs.Items[i].Links.Self
                })
                .then(function (data) {
                    console.log("Inserted in DB"); // print data;
                })
                .catch(function (error) {
                    console.log("ERROR:", error.message || error); // print the error;
                });

        }

        //console.log(datajs);
        //console.log(body);
    });
});





pgp.end(); // terminate the database connection pool
