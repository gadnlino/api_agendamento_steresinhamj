const awsService = require("../../services/awsService.js");
const AWS = require("aws-sdk");
const DynamoDBLockClient = require("dynamodb-lock-client");

const dynamodb = new AWS.DynamoDB.DocumentClient(
    {
        region: process.env.AWS_REGION
    }
);

exports.handler = async (event, context, callback) => {

    try {

        console.log(event);

        const scheduling = JSON.parse(event.body);
        const { massId, email } = scheduling;

        const failOpenClient = new DynamoDBLockClient.FailOpen(
            {
                dynamodb,
                lockTable: process.env.LOCK_TABLE_NAME,
                partitionKey: "id",
                heartbeatPeriodMs: 3e3,
                leaseDurationMs: 1e4
            }
        );

        const lockName = `lock_${massId}`;

        function tryDeleteScheduling() {
            return new Promise(resolve => {

                failOpenClient.acquireLock(lockName, async (error, lock) => {

                    function tryReleaseLock(){
                        return new Promise((resolve, reject)=>{
                            lock.release(error=>{
                                if(error){
                                    console.error(error);
                                    reject(error);
                                }
                                else{
                                    console.log("released fail open lock");
                                    resolve();
                                }
                            });
                        });
                    }

                    if (error) {
                        console.log(error);

                        await tryReleaseLock();

                        resolve({
                            statusCode: 500,
                            body: JSON.stringify(error)
                        });
                    }
                    else {
                        console.log("acquired fail open lock");
                        
                        const queryRespMass = await awsService.dynamodb.queryItems(
                            process.env.MASS_TABLE_NAME,
                            "#id = :value",
                            { "#id": "uuid" },
                            { ":value": massId }
                        );

                        const mass = queryRespMass.Items[0];

                        if (!mass) {
                            await tryReleaseLock();

                            resolve({
                                statusCode: 400,
                                body: 'Could not find mass with id=' + massId
                            });
                        }
                        else {
                            const massPeople = mass.people || [];

                            if (massPeople.find(p =>
                                p.email.toLowerCase() === email.toLowerCase())) {

                                const newMassPeople = massPeople.filter(p =>
                                    p.email.toLowerCase() !== email.toLowerCase()) || [];

                                await awsService.dynamodb.updateItem(
                                    process.env.MASS_TABLE_NAME,
                                    { "uuid": massId },
                                    "set people = :value",
                                    { ":value": newMassPeople }
                                );
                                
                                await tryReleaseLock();

                                resolve({
                                    statusCode: 200,
                                });
                            }
                            else {

                                await tryReleaseLock();

                                resolve({
                                    statusCode: 400,
                                    body: 'Could not person mass with email=' + email
                                });
                            }
                        }
                    }
                });
            });
        }

        const response = await tryDeleteScheduling();

        console.log("response", response);

        callback(null, response);
    }
    catch (e) {
        console.log(e);
        callback(null, {
            statusCode: 500,
            body: JSON.stringify(e)
        });
    }


}