const awsService = require("./services/awsService.js");
const uuid = require("uuid");

exports.handler = async (event, context, callback) => {
    
    const { massId, name, email, phone } = event;
    
    let error;

    const queryRespMass = await awsService.dynamodb.queryItems(
        process.env.MASS_TABLE_NAME,
        "#id = :value",
        { "#id": "uuid" },
        { ":value": massId }
    );

    const mass = queryRespMass.Items[0];

    if (!mass) {
        error = new Error('Could not find mass with id=' + massId);
        callback(error, null);
    }

    let person = {
        name,
        email,
        phone,
        scheduledAt : new Date().toISOString()
    };

    const massPeople = mass.people || [];

    if (massPeople.length <= parseInt(process.env.MASS_SCHEDULE_LIMIT)) {
        const newMassPeople = [...massPeople, person];

        try {

            // await awsService.dynamodb.updateItem(
            //     process.env.PERSON_TABLE_NAME,
            //     { "uuid": personId },
            //     "set masses = :value",
            //     { ":value": newPersonMasses }
            // );

            await awsService.dynamodb.updateItem(
                process.env.MASS_TABLE_NAME,
                { "uuid": massId },
                "set people = :value",
                { ":value": newMassPeople }
            );
        }
        catch (e) {
            error = e;
        }
    }

    callback(error, null);
}