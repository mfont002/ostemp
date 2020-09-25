#!/bin/bash


export stackname=db-stack
export path_to_resources=resources
export pathto_ievent_funct=functions/ievent
export pathto_kobo_funct=functions/kobo
export pathto_wordpress_funct=functions/wordpress
export pathto_dbschema_funct=resources/schema_ddl_service
export db_cluster_name=onesky-rds-cluster
export ievent_member_url='http://my-json-server.typicode.com/OneGlobe/ostemp/members'
export ievent_attendance_url='http://my-json-server.typicode.com/OneGlobe/ostemp/members'


if [ -z "$stackname" ] || [ -z "$path_to_resources" ] || [ -z "$db_cluster_name" ]; then
  echo 'stackname, path_to_resources and db_cluster_name must be set'        
  exit 1
fi

aws cloudformation create-stack \
   --template-body "file://${path_to_resources}/infra.yml" \
   --stack-name $stackname \

aws cloudformation wait stack-create-complete --stack-name $stackname
aws rds modify-db-cluster --db-cluster-identifier ${db_cluster_name} --enable-http-endpoint --apply-immediately


if [ -z "$pathto_dbschema_funct" ]; then
  echo 'pathto_dbschema_funct must be set'        
  exit 1
fi

dbschema_functionpath=${pathto_dbschema_funct} serverless deploy --config ${pathto_dbschema_funct}/serverless.yml


if [ -z "$pathto_ievent_funct" ] || [ -z "$pathto_kobo_funct" ] || [ -z "$pathto_wordpress_funct" ]; then
  echo 'pathto_ievent_funct, pathto_kobo_funct and pathto_wordpress_funct must be set'        
  exit 1
fi

ievent_member_url=${ievent_member_url} ievent_attendance_url=${ievent_attendance_url} ievent_functionpath=${pathto_ievent_funct} serverless deploy --config ${pathto_ievent_funct}/serverless.yml
kobo_functionpath=${pathto_kobo_funct} serverless deploy --config ${pathto_kobo_funct}/serverless.yml
wordpress_functionpath=${pathto_wordpress_funct} serverless deploy --config ${pathto_wordpress_funct}/serverless.yml

# --noDeploy