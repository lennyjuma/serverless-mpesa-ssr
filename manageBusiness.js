'use strict';

const AWS = require('aws-sdk');
const axios = require('axios');
const genuri = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const reguri = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";
const  unique = require('./unique');
const dbconfig = require('./dynamoConfig');
const createTable = require('./createTable');
const docClient = new AWS.DynamoDB.DocumentClient();


module.exports.register = data => {
    return createTable.createCollection(dbconfig.businessCollection).then((result) => {
        console.log('business table creation results', result);
    }).then(() => generateToken(data))
    .then((tokenResult) => registerC2B(tokenResult, data))
    .then((c2bRegResult) => registerBusiness(c2bRegResult, data));
};

module.exports.deregister = data => {
    // change business entity active entry to false in dynamoDB
};

module.exports.validate = data => {
    let params = {
        TableName: dbconfig.businessCollection.table_name,
        IndexName: dbconfig.businessCollection.secondary_index,
        KeyConditionExpression: 'HashKey = :hkey and RangeKey = :rkey',
        ExpressionAttributeValues: {
            ':hkey': data.TransactionType,
            ':rkey': data.BusinessShortCode
        }
    };

    return queryDb(params).then((queryData) => {
        console.log('query operation result on business collection', queryData);
        if (queryData.success === false) {
            console.log('getdb failed', queryData);
            return {
                ResultCode: 1,
                ResultDesc: "Declined"
            }
        }

        if (queryData.btype === 'Pay Bill') {
            console.log(data);
            return {
                ResultCode: 0,
                ResultDesc: "Success"
            }
        } else if (queryData.btype === 'Till') {
            console.log(data);
            return {
                ResultCode: 0,
                ResultDesc: "Success"
            }
        } else {
            return {
                ResultCode: 1,
                ResultDesc: "Declined"
            }
        }
    })
    // query validation data from business collection in dynamodb (validation: account number regex, amount variation array )
    // pass data to validator function
    // check for type of payment till number / paybill number
    // check for BillRefNumber
    // check if the amount falls in the premade set
    // add transaction to transaction table
};

module.exports.confirm = data => {
    console.log('confirming successful transaction', data);
    return {
        "C2BPaymentConfirmationResult": "Success"
    }
    // check if phone number exists in db customer collection if not create a new customer
    // add payment to db payment collection
};

function generateToken(data, callback) {
    let consumer_key = data.app_customer_key;
    let consumer_secret = data.app_customer_secret;
    let auth = "Basic " + new Buffer(consumer_key + ":" + consumer_secret).toString("base64");
    axios({
        method: 'get',
        url: genuri,
        headers: {
            'Authorization': auth
        }   
    }).then(response => {
        callback(null, response.data)
    })
    .catch(error => {
        if(error.message) {
            console.log('token generation error', error.message)
        }
        
        if (error.response) {
            callback('token generation response error', {
                response_data: error.response.data,
                response_status: error.response.status,
                response_headers: error.response.headers
            })
        } else if (error.request) {
            console.log('token generation request error', {
                request_error: error.request
            })
        }

        callback(error)
    });
}

function registerC2B(genData, data, callback) {

    if(genData === undefined) {
        console.log('token generation failed');
        console.log(genData);
        callback(null, false);
    }

    if (genData.access_token) {
        console.log('registering business to mpesa');
        console.log(genData);
        let auth = "Bearer " + genData.access_token;
        let defaultResponse = 'Completed';
        let confirmation_uri = 'https://gwmck35pah.execute-api.ca-central-1.amazonaws.com/dev/confirmation';
        let validation_uri = 'https://gwmck35pah.execute-api.ca-central-1.amazonaws.com/dev/validation';

        let registrationData = {
            ShortCode: data.business_shortcode,
            ResponseType: defaultResponse,
            ConfirmationURL: confirmation_uri,
            ValidationURL: validation_uri
        };

        axios({
            method: 'post',
            url: reguri,
            headers: {
                'Authorization': auth
            },
            data: registrationData
        }).then(response => {
            callback(null, response.data)
        })
        .catch( error => {
            if(error.message) {
                console.log('Error', error.message)
            }

            if (error.response) {
                console.log('c2b registration response error', {
                    response_data: error.response.data,
                    response_status: error.response.status,
                    response_headers: error.response.headers
                })
            } else if (error.request) {
                console.log('c2b registration request error', {
                    request_error: error.request
                })
            }
            callback(error)
        });
    } else {
        console.log('access token missing', genData);
        callback(null, false)
    }
    
}

function registerBusiness(c2bData, data, callback) {
    if(!c2bData) {
        callback(null, {
            c2bData: c2bData,
            message: 'registerc2b failed'
        });
    } else if (c2bData.ResponseDescription === 'success') {
        console.log('registration starting', c2bData);

            // register to dynamo business collection (id,name,shortcode,appkey,appsecret,endpoint)
        console.log('registering business to EPESA');

        let newBusiness = {
            id: unique.generateBusinessId(),
            shortcode: data.business_shortcode,
            status: 'active',
            name: data.business_name,
            type: data.business_type,
            appkey: data.app_customer_key,
            appsecret: data.app_customer_secret,
            endpoint: data.business_endpoint,
            cellphone: data.business_contact_cell,
            contact: data.business_contact_name,
            email: data.business_email,
            validation: data.business_validation
        };

        // callback the response data from dynamoDB
        const params = {
            TableName: dbconfig.businessCollection.table_name,
            Item: newBusiness
        };

        callback(null, writeDB(params))


    } else {
        callback(null, {
            c2bData: c2bData,
            message: 'registerc2b failed'
        });
    }
}

async function writeDB(params) {
    return await docClient.put(params,(err,data) => {
        if (err) {
            console.log('err', err);
            return {
                success: false,
                message: 'Error: business collection update'
            }
        } else {
            console.log('data from dynamo client put request', data);
            return data
        }
    })
}

async function queryDb(params) {
    return await docClient.query(params, function (err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            return {
                success: false,
                message: 'Error: business collection query'
            }
        } else {
            console.log(data);
            return data
        }
    });
}

async function getDb(params) {
    return await docClient.get(params, function(err, data) {
        if (err) {
            console.log('get failure', err);
            return {
                success: false,
                message: 'Error: business collection get'
            }
        } else {
            console.log('get success', data);
            return data
        }
    });
}

