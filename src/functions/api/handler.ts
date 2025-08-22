import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, Callback } from 'aws-lambda';
import { ddbDocClient } from '../database/dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { createNoteSchema, Note } from '../model/notes';
import { APIError, validateRequestBody, ValidationError } from '../util/api-error-handling';
import { PutCommand } from "@aws-sdk/lib-dynamodb"

interface CreateNoteResponse {
    userId: string;
    name: string;
    message: string;
}

export const createNote = async (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>): Promise<void> => {
    if (event.body === null) {
        return callback(null, {
            statusCode: 400,
            body: JSON.stringify({ message: "Body is required" }),
        });
    }

    try {
        const parsedBody = JSON.parse(event.body);
        console.log(parsedBody);
        const validatedData = validateRequestBody(createNoteSchema, parsedBody);
        const note: Note = {
            id: uuidv4(),
            name: validatedData.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const command = new PutCommand({
            TableName: "notes-table",
            Item: note,
            ConditionExpression: "attribute_not_exists(id)",
        });

        const result = await ddbDocClient.send(command);
        
        return callback(null, {
            statusCode: 200,
            body: JSON.stringify(note),
        });
        
    } catch (error) {
        if (error instanceof ValidationError) {
            return callback(null, {
                statusCode: 400,
                body: JSON.stringify({ message: error.message, error: error.error }),
            });
        }

        if (error instanceof APIError) {
            return callback(null, {
                statusCode: error.statusCode,
                body: JSON.stringify({ message: error.message }),
            });
        }

    }
};

export const updateNote = async (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>): Promise<void> => {
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


export const deleteNote = async (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>): Promise<void> => {
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

export const fetchNoteById = async (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>): Promise<void> => {
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


export const fetchNotes = async (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>): Promise<void> => {
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