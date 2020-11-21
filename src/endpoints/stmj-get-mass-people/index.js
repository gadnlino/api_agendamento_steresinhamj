const awsService = require("../../services/awsService.js");

exports.handler = async (event, context, callback) => {
    try {
        const { massId } = event.pathParameters || {};

        if (!massId) {
            callback(null, {
                statusCode: 400,
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

            if (!mass) {
                callback(null, {
                    statusCode: 404,
                    body: 'Could not find mass with id=' + massId
                });
            }
            else {
                callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(mass.people || [])
                });
            }
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