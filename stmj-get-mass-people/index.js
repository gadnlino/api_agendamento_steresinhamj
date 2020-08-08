const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {
    const { massId } = event;

    const queryResp = await awsService.dynamodb.queryItems(
        process.env.MASS_TABLE_NAME,
        "#id = :value",
        { "#id": "uuid" },
        { ":value": massId }
    );

    const mass = queryResp.Items[0];

    let error;
    let data;

    if (!mass) {
        error = new Error('Could not find mass with id=' + massId);
    }
    else {
        data = mass.people || [];
    }

    callback(error, data);
}