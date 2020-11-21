const awsService = require("../../services/awsService.js");

exports.handler = async (event, context, callback) => {
    const { personId } = event;

    const queryResp = await awsService.dynamodb.queryItems(
        process.env.PERSON_TABLE_NAME,
        "#id = :value",
        { "#id": "uuid" },
        { ":value": personId }
    );

    callback(null, queryResp.Items[0]);
}