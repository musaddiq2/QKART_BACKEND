#!/bin/bash

# MongoDB Atlas connection string
CONNECTION_STRING="mongodb://ac-kmbdmyj-shard-00-00.isdp0wg.mongodb.net:27017,ac-kmbdmyj-shard-00-01.isdp0wg.mongodb.net:27017,ac-kmbdmyj-shard-00-02.isdp0wg.mongodb.net:27017/qkart?replicaSet=atlas-tqch9j-shard-0"

# MongoDB Atlas authentication options
USERNAME="uzumakibaruto093"
PASSWORD="7wYWvUJfv3362Lqs"
AUTH_DB="admin"

# Import users data
mongoimport --uri "$CONNECTION_STRING" --ssl --authenticationDatabase "$AUTH_DB" --username "$USERNAME" --password "$PASSWORD" --drop --collection users --file data/export_qkart_users.json

# Import products data
mongoimport --uri "$CONNECTION_STRING" --ssl --authenticationDatabase "$AUTH_DB" --username "$USERNAME" --password "$PASSWORD" --drop --collection products --file data/export_qkart_products.json
