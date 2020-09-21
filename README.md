# ostemp
## Deploying the infrustructure.

```
Install the following packages:
$ npm i axios
$ npm i data-api-client   https://github.com/jeremydaly/data-api-client#Data API Client

Use the deploy.sh file to deploy the onesky resources. Edit param names (only if you want to change the dir structure for files) and run the file.
$ ./deploy.sh
```

## Project Structure
```python
# resources folder. Creates the the auroradb and secretsmanager store for the db authentication.  
# Contains the serverless lambda that generates the DDL for the onesky db schema:

resources/
resources/schema_ddl_service/
```

```python

# functions folder. Contains the serverless lambdas to work with mysql and call 3rd party api's for ievent, kobotoolbox ad wordpress

functions/
functions/ievent/ - 
functions/kobo/ - 
functions/wordpress/ -
```
