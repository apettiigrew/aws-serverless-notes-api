'use strict'

module.exports.createNote = async (event, context, callback) => {
    console.log(event)
    
    const response = {
        statusCode: 200,
        body: JSON.stringify({ message: 'Hello World!' }),
    };
    callback(null, response);
}