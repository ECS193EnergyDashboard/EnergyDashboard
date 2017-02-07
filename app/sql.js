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

// make conenction
var db = pgp(cn);

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
    res.on('end', () => {
        //console.log('No more data in response.');
        var datajs = JSON.parse(body);
        /*console.log('ITEM: ')
        for(var item in datajs.Items){
            console.log(item);
        }*/
        console.log(datajs.Items);
        //console.log(body);
    });
});





pgp.end(); // terminate the database connection pool
