const awsService = require("../../services/awsService.js");

exports.handler = async (event, context, callback) => {
    try {
        const { email } = event.queryStringParameters || {};

        if (email) {
            const queryResp = await awsService.dynamodb.scan(process.env.MASS_TABLE_NAME);

            const personMasses = [];

            queryResp.Items.forEach(mass => {
                mass.people.forEach(person => {
                    if (person.email && person.email.toLowerCase() === email.toLowerCase()) {
                        personMasses.push({ uuid: mass.uuid, date: mass.date });
                    }
                });
            });

            personMasses.sort((a, b) => {
                const date1 = new Date(a.date);
                const date2 = new Date(b.date);

                if (date1 > date2) {
                    return -1
                }
                else if (date1 < date2) {
                    return 1
                }

                return 0;
            });

            callback(null, {
                statusCode:200,
                body: JSON.stringify(personMasses)
            });
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