#!/bin/bash

#set variables to create stack and functions
export stackname=db-stack
export path_to_resources=resources
export pathto_ievent_funct=functions/ievent
export pathto_kobo_funct=functions/kobo
export pathto_wordpress_funct=functions/wordpress
export pathto_dbschema_funct=resources/schema_ddl_service
export db_cluster_name=onesky-rds-cluster
export ievent_member_url='http://my-json-server.typicode.com/OneGlobe/ostemp/members'
export ievent_attendance_url='http://my-json-server.typicode.com/OneGlobe/ostemp/bookings'
export kobo_getsurvey_url=SETME
export kobo_createsurvey_url=SETME
export wp_create_url=SETME
export wp_get_url=SETME


if [ -z "$stackname" ] || [ -z "$path_to_resources" ] || [ -z "$db_cluster_name" ]; then
  echo 'stackname, path_to_resources and db_cluster_name must be set'        
  exit 1
fi

#deploy the aurora db and secrets mgr key
aws cloudformation create-stack \
   --template-body "file://${path_to_resources}/infra.yml" \
   --stack-name $stackname \

aws cloudformation wait stack-create-complete --stack-name $stackname
aws rds modify-db-cluster --db-cluster-identifier ${db_cluster_name} --enable-http-endpoint --apply-immediately


if [ -z "$pathto_dbschema_funct" ]; then
  echo 'pathto_dbschema_funct must be set'        
  exit 1
fi

#deploy lambda to create db schema
dbschema_functionpath=${pathto_dbschema_funct} serverless deploy --config ${pathto_dbschema_funct}/serverless.yml

#install nodjs dependencies
npm install --prefix $pathto_ievent_funct
npm install --prefix $pathto_wordpress_funct
npm install --prefix $pathto_kobo_funct

if [ -z "$pathto_ievent_funct" ] || [ -z "$pathto_kobo_funct" ] || [ -z "$pathto_wordpress_funct" ]; then
  echo 'pathto_ievent_funct, pathto_kobo_funct and pathto_wordpress_funct must be set'        
  exit 1
fi

#deploy the api functions
ievent_member_url=${ievent_member_url} ievent_attendance_url=${ievent_attendance_url} ievent_functionpath=${pathto_ievent_funct} serverless deploy --config ${pathto_ievent_funct}/serverless.yml
kobo_getsurvey_url=${kobo_getsurvey_url} kobo_createsurvey_url=${kobo_createsurvey_url} kobo_functionpath=${pathto_kobo_funct} serverless deploy --config ${pathto_kobo_funct}/serverless.yml
wp_get_url=${wp_get_url} wp_create_url=${wp_create_url} wordpress_functionpath=${pathto_wordpress_funct} serverless deploy --config ${pathto_wordpress_funct}/serverless.yml

# --noDeploy