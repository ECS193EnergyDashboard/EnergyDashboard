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
db.any("CREATE TABLE IF NOT EXISTS buildings(name varchar(80) PRIMARY KEY, url varchar(256), webid varchar(256), elementsurl varchar(256) )")
    .catch(function (error) {
        console.log(error);
    });
// create AHU table if doesnt exist
/*db.any("CREATE TABLE IF NOT EXISTS ahu(name varchar(80) ,building varchar(80), url varchar(256), webid varchar(256), attrurl varchar(256), valueurl varchar(256) )");*/



// query buildings via https to webAPI
var buildingData;
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
        buildingData = JSON.parse(body);
        //console.log('ITEM: ')
        for(var i in buildingData.Items){
            /*console.log(buildingData.Items[i].Name); //works
            console.log(buildingData.Items[i].WebId);
            console.log(buildingData.Items[i].Links.Self);
            console.log("length: ", buildingData.Items.length);*/

            // insert into db if doesnt exist, or update if does exist
            db.any('insert into buildings values(${Name}, ${url}, ${WebId}, ${Elements}) ON CONFLICT (name) DO UPDATE SET (url,webid) = ( ${url},${WebId})',
                {
                    Name:   buildingData.Items[i].Name,
                    WebId:  buildingData.Items[i].WebId,
                    url:    buildingData.Items[i].Links.Self,
                    Elements: buildingData.Items[i].Links.Elements
                })
                .then(function (data) {
                    //console.log("Inserted/updated in DB");
                })
                .catch(function (error) {
                    console.log(error); // print the error;
                });

                //for each building make https get for elements

                //if that response.name = subsystem grab the elements url

                //make https get for that elemets (gives AHU, CHW ...)

                //if that response.name = AHU grab the elements url

                //store AHU stuff in json

        }
        console.log("buildings json: ", JSON.stringify(buildingData));
        //console.log(buildingData);
        //console.log(body);
    });
}); //end https get building







pgp.end(); // terminate the database connection pool
