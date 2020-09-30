# ostemp
## Deploying the infrustructure.

```
Install the following packages:
$ npm i axios
$ npm i data-api-client   https://github.com/jeremydaly/data-api-client#Data API Client
$ npm i serverless-plugin-scripts

Make sure the node dependencies are also installed where your serverless file is installed so they can be auto packaged when deploying the lambdas

Use the deploy.sh file to deploy the onesky resources. Edit param names (only if you want to change the dir structure for files) and run the file.
$ ./deploy.sh
```

## Testing.
```
The db.json file has the payload that can be used for both the ievent_attendance and ievent_member functions:
http://my-json-server.typicode.com/OneGlobe/ostemp/members
http://my-json-server.typicode.com/OneGlobe/ostemp/bookings

These json payloads are served with a mock online rest server at: https://my-json-server.typicode.com/
```

## Project Structure
```js
Resources folder. Creates the the auroradb and secretsmanager store for the db authentication.  
Contains the serverless lambda that generates the DDL for the onesky db schema:

resources/
resources/schema_ddl_service/
```

```js

Functions folder. Contains the serverless lambdas to work with auroradb and call 3rd party apis for ievent, kobotoolbox and wordpress:

functions/
functions/ievent/ - 
functions/kobo/ - 
functions/wordpress/ -
```
