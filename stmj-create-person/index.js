const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {

    const person = JSON.parse(event.body);

    const tableName = process.env.PERSON_TABLE_NAME;

    try {
        const response = await awsService.dynamodb.putItem(tableName, person);

        if (response.$response.error) {
            callback(null, {
                statusCode: 500,
                body: JSON.stringify(response.$response.error)
            });
        }
        else {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(response.$response.data)
            });
        }
    }
    catch (e) {
        callback(null, {
            statusCode: 500,
            body: JSON.stringify(e)
        });
    }

}