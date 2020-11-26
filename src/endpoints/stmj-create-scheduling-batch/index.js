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

		const schedulingBatch = JSON.parse(event.body);

		const failOpenClient = new DynamoDBLockClient.FailOpen(
			{
				dynamodb,
				lockTable: process.env.LOCK_TABLE_NAME,
				partitionKey: "id",
				heartbeatPeriodMs: 3e3,
				leaseDurationMs: 1e4
			}
		);

		schedulingBatch.forEach(s => {

			const { massId, name, email, phone, scheduledBy } = s;

			const lockName = `lock_${massId}`;

			function tryCreateScheduling() {
				return new Promise(resolve => {
					failOpenClient.acquireLock(lockName, async (error, lock) => {

						function tryReleaseLock() {
							return new Promise((resolve, reject) => {
								lock.release(error => {

									if (error) {
										console.error(error);
										reject(error);
									}
									else {
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
							// do stuff
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

								if (massPeople.length <= mass.totalVacancies &&
									!massPeople.find(p =>
										p.email.toLowerCase() === email.toLowerCase())) {

									const personOrder = {
										name,
										email,
										phone,
										scheduledAt: new Date().toISOString(),
										scheduledBy
									};

									const newMassPeople = [...massPeople, personOrder];

									await awsService.dynamodb.updateItem(
										process.env.MASS_TABLE_NAME,
										{ "uuid": massId },
										"set people = :value",
										{ ":value": newMassPeople }
									);

									await tryReleaseLock();

									resolve({
										statusCode: 200,
										body: JSON.stringify(personOrder)
									});
								}
								else {
									await tryReleaseLock();

									resolve({
										statusCode: 409,
										body: `Já está agendado ou todas as vagas da missa com id=${massId} já foram ocupadas`
									});
								}
							}
						}
					});
				});
			}

			const response = await tryCreateScheduling();

			console.log("response ", response);
		});

		callback(null, response);
	}
	catch (ex) {
		console.log(e);
		callback(null, {
			statusCode: 500,
			body: JSON.stringify(e)
		});
	}
}