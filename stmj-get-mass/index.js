const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {

    const { massId, start_date, end_date } = event;

    if (massId && (!start_date && !end_date)) {
        const queryResp = await awsService.dynamodb.queryItems(
            process.env.MASS_TABLE_NAME,
            "#id = :value",
            { "#id": "uuid" },
            { ":value": massId }
        );

        callback(null, queryResp.Items[0]);
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

        callback(null, queryResp.Items);
    }
}