const awsService = require("./services/awsService.js");
const xlsx = require('node-xlsx').default;

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
        //data.push("Nome,Email,Telefone");
        data.push(["Nome", "Email", "Telefone", "Data de agendamento", "Agendado por"]);
        
        if(mass.people){
            mass.people.forEach(person=>{
                //data.push(`${person.name || ""},${person.email && person.email.toLowerCase() || ""},${person.phone|| ""}`);
                data.push([
                    person.name || "", 
                    person.email && person.email.toLowerCase() || "", 
                    person.phone|| "", 
                    person.scheduledAt || "", 
                    person.scheduledBy && person.scheduledBy.name || ""
                ]);
            });
        }
    }

    var buffer = xlsx.build([{name: `missa_${mass.date}`, data: data}]);
    let base64data = buffer.toString('base64');

    callback(error, {data: base64data});
}