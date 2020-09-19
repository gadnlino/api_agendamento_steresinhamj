const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {

    console.log(JSON.stringify(event));

    try {
        const { start_date, end_date } = event.queryStringParameters || {};

        if (!start_date && !end_date) {
            callback(null, {
                statusCode: 400
            });
        }
        else {
            const queryResp = await awsService.dynamodb.queryItems(
                process.env.MASS_TABLE_NAME,
                "#key BETWEEN :value1 AND :value2",
                { "#key": "date" },
                {
                    ":value1": start_date,
                    ":value2": end_date
                }
            );


            callback(null, {
                statusCode: 200,
                body: JSON.stringify(queryResp.Items)
            });
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