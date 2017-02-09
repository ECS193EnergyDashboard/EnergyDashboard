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
db.any("CREATE TABLE IF NOT EXISTS ahus(name varchar(80) ,building varchar(80), url varchar(256), webid varchar(256), attrurl varchar(256), valueurl varchar(256), PRIMARY KEY(name, building))");



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

                //for each building make https get for elements (gives space, subsystem, system)
                https.get(buildingData.Items[i].Links.Elements, (resb) => {
                    var spSubSy = '';
                    resb.on('data', (chunk) => {
                        spSubSy += chunk;
                    });
                    // end of building data
                    resb.on('end', () => {
                        spSubSyData = JSON.parse(spSubSy);
                        //if that response.name = subsystem grab the elements url
                        function isSub(item){ return item.Name == "Subsystem"; }
                        var sub = spSubSyData.Items.find(isSub);
                        //console.log("subsystem: ", sub);

                        //make https get for that elemets (gives AHU, CHW ...)
                        if(!(sub === undefined || sub == null)){
                            https.get(sub.Links.Elements, (resSubs) => {
                                var ahuChw = '';
                                resSubs.on('data', (chunk) => {
                                    ahuChw += chunk;
                                });
                                // end of ahuChw data
                                resSubs.on('end', () => {
                                    ahuChwData = JSON.parse(ahuChw);
                                    //if that response.name = AHU grab the elements url
                                    function isAHU(item){ return item.Name == "AHU"; }
                                    var ahu = ahuChwData.Items.find(isAHU);
                                    //console.log("AHU: ", ahu);


                                    //make https get for that elemets (AHU1, AHU2,...)
                                    if(!(ahu === undefined || ahu == null)){
                                        //=====================================================
                                        https.get(ahu.Links.Elements, (resAhu) => {
                                            var resAhus = '';
                                            resAhu.on('data', (chunk) => {
                                                resAhus += chunk;
                                            });
                                            // end of resAhus data
                                            resAhu.on('end', () => {
                                                resAhusData = JSON.parse(resAhus);
                                                //console.log(resAhusData);
                                                if(resAhusData.Items.length > 0){
                                                    var path = resAhusData.Items[0].Path.split("\\");
                                                    var Building = path[6];
                                                    //console.log(Building);
                                                    for(var j in resAhusData.Items){
                                                        //console.log(resAhusData.Items[j].Name);
                                                        db.any('insert into ahus values(${name}, ${building}, ${url}, ${webid}, ${attrurl}, ${valueurl}) ON CONFLICT (name, building) DO UPDATE SET (url,webid,attrurl, valueurl) = (  ${url},${webid},${attrurl}, ${valueurl});',
                                                            {
                                                                name:       resAhusData.Items[j].Name,
                                                                building:   Building,
                                                                url:        resAhusData.Items[j].Links.Self,
                                                                webid:      resAhusData.Items[j].WebId,
                                                                attrurl:    resAhusData.Items[j].Links.Attributes,
                                                                valueurl:   resAhusData.Items[j].Links.Value
                                                            })
                                                            .then(function (data) {
                                                                //console.log("Inserted/updated AHU in DB");
                                                            })
                                                            .catch(function (error) {
                                                                console.log(error); // print the error;
                                                            });
                                                    }// end for j
                                                }//end if ahusData > 0

                                            });// end end of resAhus chunk data
                                        }); //end https get resAhus
                                        //=====================================================
                                    }//end if ahu not undef
                                });// end end of ahuChw chunk data
                            }); //end https get ahuChw
                        }//end if sub not undef
                    });// end end of building chunk data
                }); //end https get spSubSy









        }//end for loop adding buildings
        //console.log("buildings json: ", JSON.stringify(buildingData));
        //console.log(buildingData);
        //console.log(body);
    });
}); //end https get building







pgp.end(); // terminate the database connection pool
