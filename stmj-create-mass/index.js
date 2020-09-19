const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {

    const mass = JSON.parse(event.body);

    try {
        const response = await awsService.dynamodb.putItem(process.env.MASS_TABLE_NAME, mass);

        console.log(response);

        callback(null, {
            statusCode: 200,
            body: JSON.stringify(response.$response.data)
        });
    }
    catch (error) {
        callback(null, {
            statusCode: 500,
            body: JSON.stringify(error)
        });
    }

}