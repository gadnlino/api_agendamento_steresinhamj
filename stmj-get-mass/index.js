const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {

    console.log(JSON.stringify(event));

    try {
        const { massId } = event.pathParameters || {};

        if (!massId) {
            callback(null, {
                statusCode: 400
            });
        }
        else {
            const queryResp = await awsService.dynamodb.queryItems(
                process.env.MASS_TABLE_NAME,
                "#id = :value",
                { "#id": "uuid" },
                { ":value": massId }
            );

            const mass = queryResp.Items[0];

            callback(null, mass ? {
                statusCode: 200,
                body: JSON.stringify(mass)
            } : { statusCode: 204 });
        }
    }
    catch (e) {
        console.log(e);
        callback(null, {
            statusCode: 500,
            body: JSON.stringify(e)
        });
    }
}