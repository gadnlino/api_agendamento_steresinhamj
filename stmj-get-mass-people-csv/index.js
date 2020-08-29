const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {
    const { massId } = event;

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
        error = new Error('Could not find mass with id=' + massId);
    }
    else {
        data.push("Nome,Email,Telefone");
        
        if(mass.people){
            mass.people.forEach(person=>{
                data.push(`${person.name || ""},${person.email && person.email.toLowerCase() || ""},${person.phone|| ""}`);
            });
        }
    }

    const csv = data.join("\r\n");

    let buff = Buffer.from(csv);
    let base64data = buff.toString('base64');

    callback(error, base64data);
}