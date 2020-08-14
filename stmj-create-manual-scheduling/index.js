const awsService = require("./services/awsService.js");
const uuid = require("uuid");

exports.handler = async (event, context, callback) => {
    const { massId, name, email, phone } = event;

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

    let personId;

    const queryRespPerson = await awsService.dynamodb.queryItems(
        process.env.PERSON_TABLE_NAME,
        "#name = :name OR #email = :email OR #phone = :phone",
        { "#name": "name", "#email": "email", "#phone": "phone" },
        { ":name": name, ":email": email, ":phone": phone }
    );

    let person = queryRespPerson.Items[0];

    let error;

    if (!person) {
        personId = uuid.v1();

        person = {
            uuid: personId,
            name,
            email,
            phone,
            masses: []
        };

        await awsService.dynamodb.putItem(process.env.PERSON_TABLE_NAME, person);
    }

    const personMasses = person.masses || [];
    const massPeople = mass.people || [];

    if (massPeople.length <= parseInt(process.env.MASS_SCHEDULE_LIMIT) &&
        !personMasses.find(m => m.uuid === massId) &&
        !massPeople.find(p => p.uuid === personId)) {
        const newPersonMasses = [...personMasses, mass];
        const newMassPeople = [...massPeople, person];

        try {

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
        catch (e) {
            error = e;
        }
    }

    callback(error, null);
}