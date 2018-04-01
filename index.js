'use strict';

const rp = require("request-promise");
const path    = require("path");
const config = require(path.normalize(__dirname + "/config.js"));
const apiKey = config.apiKey;
const baseUrl = config.baseUrl;
const AWS = require('aws-sdk');

function dispatch(event, callback) {
    getHealthCheck().then(status => {
       let statusCode = status.statusCode;
       if(statusCode == '200'){
         console.log(`API online, status: ${statusCode}`)
       } else {
         console.log(`Error calling API, status: ${statusCode}`);
         sendOfflineNotification();
       }
   }).catch(function (err) {
       console.log(err);       
   });
}

function getHealthCheck(){
    const options = {
        uri: `${baseUrl}/health?apiKey=` + apiKey,
        json: true ,
        resolveWithFullResponse: true 
    };

    return rp(options)
}

function sendOfflineNotification(){
    const sns = new AWS.SNS();
    sns.publish({
        Message: 'Home automation API offline',
        TopicArn: config.topicArn
    }, function (err, data) {
        if (err) {
            console.log(err.stack);
            return;
        }

        console.log('push sent');
    });
}

exports.handler = (event, context, callback) => {
    try {
        dispatch(event, (response) => { callback(null, response); });
    } catch (err) {
        callback(err);
    }
};