const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {
    const { massId, personId } = event;

    const queryRespMass = await awsService.dynamodb.queryItems(
        process.env.MASS_TABLE_NAME,
        "#id = :value",
        { "#id": "uuid" },
        { ":value": massId }
    );

    const mass = queryRespMass.Items[0];

    const queryRespPerson = await awsService.dynamodb.queryItems(
        process.env.PERSON_TABLE_NAME,
        "#id = :value",
        { "#id": "uuid" },
        { ":value": personId }
    );

    const person = queryRespPerson.Items[0];

    let error;

    if (!person && !mass) {
        const errorMessage = `Could not find mass with id=${massId} and person with id=${personId}`;
        error = new Error(errorMessage);
    }
    else if (!person) {
        error = new Error('Could not find person with id=' + personId);
    }
    else if (!mass) {
        error = new Error('Could not find mass with id=' + massId);
    }
    else {
        const personMasses = person.masses || [];
        const massPeople = mass.people || [];

        if (massPeople.length <= parseInt(process.env.MASS_SCHEDULE_LIMIT) && 
                !personMasses.find(m => m.uuid === massId) && 
                !massPeople.find(p => p.uuid === personId)) {
            const newPersonMasses = [...personMasses, {
                uuid : mass.uuid,
                date: mass.date
            }];
            const newMassPeople = [...massPeople, {
                name : person.name,
                email : person.email,
                phone : person.phone,
                isParishioner : person.isParishioner || false,
                uuid : person.uuid,
                scheduledAt : new Date().toISOString(),
            }];

            await awsService.dynamodb.updateItem(
                process.env.PERSON_TABLE_NAME,
                { "uuid": personId },
                "set masses = :value",
                { ":value": newPersonMasses }
            );

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