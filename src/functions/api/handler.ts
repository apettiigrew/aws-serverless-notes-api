import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, Callback } from 'aws-lambda';

interface CreateNoteRequest {
    userId: string;
    name: string;
}

interface CreateNoteResponse {
    userId: string;
    name: string;
    message: string;
}

export const createNote = async (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>): Promise<void> => {
    console.log('Event:', event);

    const response: APIGatewayProxyResult = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
    };

    callback(null, response);
};