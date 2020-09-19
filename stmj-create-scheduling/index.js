const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {

    try {
        const scheduling = JSON.parse(event.body);
        const { massId, name, email, phone, scheduledBy } = scheduling;

        const queryRespMass = await awsService.dynamodb.queryItems(
            process.env.MASS_TABLE_NAME,
            "#id = :value",
            { "#id": "uuid" },
            { ":value": massId }
        );

        const mass = queryRespMass.Items[0];

        let error;

        if (!mass) {
            callback(null, {
                statusCode: 500,
                body: 'Could not find mass with id=' + massId
            });
        }
        else {
            const massPeople = mass.people || [];
            
            if (massPeople.length <= mass.totalVacancies &&
                !massPeople.find(p => p.email.toLowerCase() === email.toLowerCase())) {

                const personOrder = {
                    name,
                    email,
                    phone,
                    scheduledAt: new Date().toISOString(),
                    scheduledBy
                };

                const newMassPeople = [...massPeople, personOrder];

                await awsService.dynamodb.updateItem(
                    process.env.MASS_TABLE_NAME,
                    { "uuid": massId },
                    "set people = :value",
                    { ":value": newMassPeople }
                );

                callback(null, {
                    statusCode: 200,
                    body: JSON.stringify(personOrder)
                });
            }

            callback(error, {
                statusCode: 409
            });
        }
    }
    catch (e) {
        console.log(e);
        callback(null, {
            statusCode: 500,
            body: JSON.stringify(e)
        })
    }

}