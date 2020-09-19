const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {

    try {
        const scheduling = JSON.parse(event.body);
        const { massId, email } = scheduling;

        const queryRespMass = await awsService.dynamodb.queryItems(
            process.env.MASS_TABLE_NAME,
            "#id = :value",
            { "#id": "uuid" },
            { ":value": massId }
        );

        const mass = queryRespMass.Items[0];

        if (!mass) {
            callback(null, {
                statusCode: 400,
                body: 'Could not find mass with id=' + massId
            });
        }
        else {
            const massPeople = mass.people || [];

            if (massPeople.find(p => p.email.toLowerCase() === email.toLowerCase())) {

                const newMassPeople = massPeople.filter(p =>
                    p.email.toLowerCase() !== email.toLowerCase()) || [];

                await awsService.dynamodb.updateItem(
                    process.env.MASS_TABLE_NAME,
                    { "uuid": massId },
                    "set people = :value",
                    { ":value": newMassPeople }
                );

                callback(null, {
                    statusCode: 200,
                });
            }
            else {

                callback(null, {
                    statusCode: 400,
                    body: 'Could not person mass with email=' + email
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