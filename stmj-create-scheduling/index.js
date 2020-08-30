const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {
    const { massId, name, email, phone } = event;

    const queryRespMass = await awsService.dynamodb.queryItems(
        process.env.MASS_TABLE_NAME,
        "#id = :value",
        { "#id": "uuid" },
        { ":value": massId }
    );

    const mass = queryRespMass.Items[0];

    let error;

    if (!mass) {
        error = new Error('Could not find mass with id=' + massId);
    }
    else {
        const massPeople = mass.people || [];

        if (massPeople.length <= parseInt(process.env.MASS_SCHEDULE_LIMIT) &&
            !massPeople.find(p => p.email.toLowerCase() === email.toLowerCase())) {
            const newMassPeople = [...massPeople, {
                name,
                email,
                phone,
                scheduledAt: new Date().toISOString(),
            }];

            await awsService.dynamodb.updateItem(
                process.env.MASS_TABLE_NAME,
                { "uuid": massId },
                "set people = :value",
                { ":value": newMassPeople }
            );
        }
    }

    callback(error, null);
}