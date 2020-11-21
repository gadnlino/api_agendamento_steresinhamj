const awsService = require("../../services/awsService.js");

exports.handler = async (event, context, callback) => {
    try {
        const { email } = event.queryStringParameters || {};
        
        if (!email) {
            callback(null, {
                statusCode: 400
            });
        }
        else {
            const admins = JSON.parse(process.env.ADMINS);

            let permissions = [
                {
                    component: "homePage",
                    type: "read"
                },
                {
                    component: "viewMyBookingsPage",
                    type: "read"
                },
            ];

            if (admins.includes(email.toLowerCase())) {
                permissions = [
                    ...permissions,
                    {
                        component: "viewScheduledListPage",
                        type: "read"
                    },
                    {
                        component: "scheduleManually",
                        type: "write"
                    },
                    {
                        component: "cancelThirdSchedulings",
                        type: "write"
                    }
                ];
            }

            callback(null, {
                statusCode: 200,
                body: JSON.stringify(permissions)
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