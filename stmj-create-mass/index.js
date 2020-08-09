const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {

    const tableName = process.env.MASS_TABLE_NAME;

    const response = await awsService.dynamodb.putItem(tableName, event);

    callback(response.$response.error, response.$response.data,);
}