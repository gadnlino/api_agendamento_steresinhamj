const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {
    console.log(event);
    console.log(context);
    const { email } = event.pathParameters;

    const queryResp = await awsService.dynamodb.scan(
        event.stageVariables.PERSON_TABLE_NAME
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
            body: null,
        };

    callback(null, response);
}