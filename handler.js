'use strict';

const manageFile = require('./manageFile');
const manageBusiness = require('./manageBusiness');
const server = require('./server');
const http = require('serverless-http');


module.exports.appendText = (event, context, callback) => {
    if(typeof event === 'string'){event = JSON.parse(event);}

    const text = event.queryStringParameters.text;
    manageFile.appendText(text).then(result => {
        const response = {
          statusCode: 200,
          body: JSON.stringify({
            result
          })
        };

        callback(null, response);
    });
};

module.exports.deleteText = (event, context, callback) => {
  
  manageFile.deleteText().then(result => {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        result
      })
    };
    callback(null, response);
  });
  
};

module.exports.register = (event, context, callback) => {
    if(typeof event === 'string'){event = JSON.parse(event);}

    const paramAction = event.queryStringParameters.action;
    const dataOb = event.body;

    if (paramAction === 'deactivate') {
        manageBusiness.deregister(dataOb).then(result => {
          const response = {
            statusCode: 200,
            body: JSON.stringify({
              result
            })
          };
          callback(null, response);
        });
    } else if (paramAction === 'activate') {
        manageBusiness.register(dataOb).then(result => {
          const response = {
            statusCode: 200,
            body: JSON.stringify({
              result
            })
          };
          callback(null, response);
        });
    }
};

module.exports.validation = (event, context, callback) => {
    if(typeof event === 'string'){event = JSON.parse(event);}
  const dataOb = event.body;
  manageBusiness.validate(dataOb).then(result => {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        result
      })
    };
    callback(null, response);
  });
};

module.exports.confirmation = (event, context, callback) => {
    if(typeof event === 'string'){event = JSON.parse(event);}
  const dataOb = event.body;
  manageBusiness.confirm(dataOb).then(result => {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        result
      })
    };
    callback(null, response);
  });
};

module.exports.client = http(server);