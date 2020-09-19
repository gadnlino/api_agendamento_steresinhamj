const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {
    try {
        console.log(event);
        const { email } = event.pathParameters || {};

        if (email) {
            const queryResp = await awsService.dynamodb.scan(
                process.env.PERSON_TABLE_NAME
            );

            const people = queryResp
                .Items
                .filter(p => p.email.toLowerCase() === email.toLowerCase());

            const response = people && people.length > 0 ?
                {
                    statusCode: 200,
                    body: JSON.stringify(people[0])
                } :
                {
                    statusCode: 204,
                };

            callback(null, response);
        }
        else {
            callback(null, {
                statusCode: 400
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