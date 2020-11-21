const awsService = require("../../services/awsService.js");
const uuid = require("uuid");

exports.handler = async (event, context, callback) => {

    try {
        console.log(event);
        
        const person = {
            ...JSON.parse(event.body),
            uuid: uuid.v1()
        };

        const tableName = process.env.PERSON_TABLE_NAME;
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
                body: JSON.stringify(person)
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