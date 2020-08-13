const awsService = require("./services/awsService.js");
const uuid = require("uuid");

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

exports.handler = async (event, context, callback) => {
    const currDate = new Date(event.date);

    let itemsToInsert = [];
    const totalVacancies = parseInt(process.env.TOTAL_VACANCIES)

    //Criar as missas para domingo
    if (currDate.getDay() === 0) {
        itemsToInsert.push({
            uuid: uuid.v1(),
            date: new Date(currDate.getUTCFullYear(), currDate.getUTCMonth(), currDate.getUTCDate(), 7, 0, 0).toISOString(),
            people: [],
            totalVacancies: totalVacancies
        });

        itemsToInsert.push({
            uuid: uuid.v1(),
            date: new Date(currDate.getUTCFullYear(), currDate.getUTCMonth(), currDate.getUTCDate(), 9, 0, 0).toISOString(),
            people: [],
            totalVacancies: totalVacancies
        });

        itemsToInsert.push({
            uuid: uuid.v1(),
            date: new Date(currDate.getUTCFullYear(), currDate.getUTCMonth(), currDate.getUTCDate(), 18, 0, 0).toISOString(),
            people: [],
            totalVacancies: totalVacancies
        });
    }
    //Criar as missas para sábado
    else if (currDate.getDay() === 6) {

        itemsToInsert.push({
            uuid: uuid.v1(),
            date: new Date(currDate.getUTCFullYear(), currDate.getUTCMonth(), currDate.getUTCDate(), 17, 0, 0).toISOString(),
            people: [],
            totalVacancies: totalVacancies
        });
    }

    const tableName = process.env.MASS_TABLE_NAME;

    for (let item of itemsToInsert) {
        const response = await awsService.dynamodb.putItem(tableName, item);
    }

    callback(null, null);
};