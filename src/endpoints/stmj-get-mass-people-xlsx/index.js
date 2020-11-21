const awsService = require("../../services/awsService.js");
const xlsx = require('node-xlsx').default;

function buildDate(dateString) {
    const date = new Date(dateString);
    const yyyy = date.getUTCFullYear();
    const MM = date.getUTCMonth() + 1;
    const dd = date.getDate();

    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds();

    return `${dd}/${MM}/${yyyy} ${hh}:${mm}:${ss}`;
}

exports.handler = async (event, context, callback) => {
    try {
        const { massId } = event.pathParameters || {};

        if (!massId) {
            callback(null, {
                statusCode: 400,
            });
        }
        else {
            const queryResp = await awsService.dynamodb.queryItems(
                process.env.MASS_TABLE_NAME,
                "#id = :value",
                { "#id": "uuid" },
                { ":value": massId }
            );

            const mass = queryResp.Items[0];

            let error;
            let data = [];

            if (!mass) {
                callback(null, {
                    statusCode: 404,
                    body: 'Could not find mass with id=' + massId
                });
            }
            else {
                //data.push("Nome,Email,Telefone");
                data.push(["Nome", "Email", "Telefone", "Data de agendamento", "Agendado por"]);

                if (mass.people) {
                    mass.people.forEach(person => {
                        //data.push(`${person.name || ""},${person.email && person.email.toLowerCase() || ""},${person.phone|| ""}`);
                        data.push([
                            person.name || "",
                            person.email && person.email.toLowerCase() || "",
                            person.phone || "",
                            person.scheduledAt && buildDate(person.scheduledAt) || "",
                            person.scheduledBy && person.scheduledBy.name || ""
                        ]);
                    });
                }

                var buffer = xlsx.build([{ name: `missa_${mass.date && mass.date}`, data: data }]);
                let base64data = buffer.toString('base64');

                callback(error, {
                    statusCode: 200,
                    body: base64data,
                   // isBase64Encoded: true
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