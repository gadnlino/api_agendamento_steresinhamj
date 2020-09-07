const awsService = require("./services/awsService.js");

exports.handler = async (event, context, callback) => {
    const { uuid, name, email } = event;

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

    callback(null, permissions);
}