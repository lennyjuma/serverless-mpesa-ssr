const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();

module.exports.createCollection = collectionData => {
    return createCollection(collectionData).then((error, data) => {

            if (error) {
                if (error.message.indexOf('Table already exists') !== -1) {
                    console.log('table found!', error.message);
                    return { table_status: 'active' }
                } else {
                    console.log(error, error.stack);
                }
            } else {
                console.log('Database initialization complete.', data);
                return {
                    table_status: data.TableStatus
                }
            }
        })
};

function createCollection(collectionData, callback) {

    const params = {

        TableName : collectionData.table_name,
        KeySchema : [ {
            AttributeName : collectionData.partition_key,
            KeyType : "HASH"
        },
            {
                AttributeName : collectionData.sort_key,
                KeyType : "RANGE"
            }
        ],
        AttributeDefinitions : [ {
            AttributeName : collectionData.partition_key,
            AttributeType : "S"
        }, {
            AttributeName : collectionData.sort_key,
            AttributeType : "S"
        } ],
        BillingMode: "PAY_PER_REQUEST",
        GlobalSecondaryIndexes: [
            {
                IndexName: collectionData.secondary_index,
                KeySchema: [
                    {
                        AttributeName : collectionData.secondary_key,
                        KeyType : "RANGE"
                    }
                ],
                Projection: { /* required */
                    NonKeyAttributes: collectionData.non_key_attributes,
                    ProjectionType: "INCLUDE"
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 100,
                    WriteCapacityUnits: 100
                }
            }
        ]
    };

    dynamodb.createTable(params, callback);
}