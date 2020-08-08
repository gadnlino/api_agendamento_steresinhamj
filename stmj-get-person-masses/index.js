const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {
    const { personId } = event;

    const queryResp = await awsService.dynamodb.queryItems(
        process.env.PERSON_TABLE_NAME,
        "#id = :value",
        { "#id": "uuid" },
        { ":value": personId }
    );

    const person = queryResp.Items[0];

    let error;
    let data;

    if (!person) {
        error = new Error('Could not find person with id=' + personId);
    }
    else {
        data = person.masses || [];
    }

    callback(error, data);
}