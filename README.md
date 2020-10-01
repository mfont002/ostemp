# ostemp
## Deploying the infrustructure.

```
The deploy.sh file can be used to deploy the onesky resources. Edit param names (only if you want to change the dir structure for files) and run the file.
$ ./deploy.sh

The project requires the following dependencies:
$ npm i axios
$ npm i data-api-client   (https://github.com/jeremydaly/data-api-client#Data API Client)
$ npm i serverless-plugin-scripts

These are installed by the deploy.sh file but can also be manually installed. Make sure they are installed where the serverless files 
reside so they can be autopackaged as dependencies when the lambdas are deployed.

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
