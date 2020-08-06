exports.handler = async (event, context, callback)=>{
    callback(null, {
        statusCode : 200,
        data: event
    });
}