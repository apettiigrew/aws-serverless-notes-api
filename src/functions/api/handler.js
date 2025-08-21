'use strict'

module.exports.hello = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Go serverless, you function executed successfully",
            input: event
        })
    }
}