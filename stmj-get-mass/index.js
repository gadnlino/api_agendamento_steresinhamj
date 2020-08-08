const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {

    const { massId } = event;

    const queryResp = await awsService.dynamodb.queryItems(
        process.env.MASS_TABLE_NAME,
        "#id = :value",
        { "#id": "uuid" },
        { ":value": massId }
    );

    callback(null, queryResp.Items[0]);
}