const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback)=>{

    console.log(event);

    const tableName = process.env.PERSON_TABLE_NAME;

    const response = await awsService.dynamodb.putItem(tableName, event);

    callback(null, {
        statusCode : response.$response.statusCode,
        data: response.$response.data,
        error: response.$response.error
    });
}