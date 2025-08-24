import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, Callback } from 'aws-lambda';
import { ddbDocClient } from '../../database/dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { createNoteSchema, updateNoteSchema, Note } from '../../model/notes';
import { APIError, validateRequestBody, ValidationError } from '../../util/api-error-handling';
import { PutCommand, UpdateCommand, DeleteCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb"
import { config } from '../../config';

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
            TableName: config.dynamodb.tableName,
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
    if (event.body === null) {
        return callback(null, {
            statusCode: 400,
            body: JSON.stringify({ message: "Body is required" }),
        });
    }

    if (!event.pathParameters || !event.pathParameters.id) {
        return callback(null, {
            statusCode: 400,
            body: JSON.stringify({ message: "Note ID is required in path parameters" }),
        });
    }

    try {
        const noteId = event.pathParameters.id;
        const parsedBody = JSON.parse(event.body);
        const validatedData = validateRequestBody(updateNoteSchema, parsedBody);

        const updateCommand = new UpdateCommand({
            TableName: config.dynamodb.tableName,
            Key: {
                id: noteId,
            },
            UpdateExpression: "SET #name = :name, updatedAt = :updatedAt",
            ExpressionAttributeNames: {
                "#name": "name",
            },
            ExpressionAttributeValues: {
                ":name": validatedData.name,
                ":updatedAt": new Date().toISOString(),
            },
            ConditionExpression: "attribute_exists(id)",
            ReturnValues: "ALL_NEW",
        });

        const result = await ddbDocClient.send(updateCommand);
        
        return callback(null, {
            statusCode: 200,
            body: JSON.stringify(result.Attributes),
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

        // Handle DynamoDB specific errors
        if (error.name === 'ConditionalCheckFailedException') {
            return callback(null, {
                statusCode: 404,
                body: JSON.stringify({ message: "Note not found" }),
            });
        }

        console.error('Error updating note:', error);
        return callback(null, {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        });
    }
};


export const deleteNote = async (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>): Promise<void> => {
    if (!event.pathParameters || !event.pathParameters.id) {
        return callback(null, {
            statusCode: 400,
            body: JSON.stringify({ message: "Note ID is required in path parameters" }),
        });
    }

    try {
        const noteId = event.pathParameters.id;

        const deleteCommand = new DeleteCommand({
            TableName: config.dynamodb.tableName,
            Key: {
                id: noteId,
            },
            ConditionExpression: "attribute_exists(id)",
            ReturnValues: "ALL_OLD",
        });

        const result = await ddbDocClient.send(deleteCommand);
        
        return callback(null, {
            statusCode: 200,
            body: JSON.stringify({ 
                message: "Note deleted successfully",
                deletedNote: result.Attributes 
            }),
        });
        
    } catch (error) {
        // Handle DynamoDB specific errors
        if (error.name === 'ConditionalCheckFailedException') {
            return callback(null, {
                statusCode: 404,
                body: JSON.stringify({ message: "Note not found" }),
            });
        }

        console.error('Error deleting note:', error);
        return callback(null, {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        });
    }
};

export const fetchNoteById = async (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>): Promise<void> => {
    if (!event.pathParameters || !event.pathParameters.id) {
        return callback(null, {
            statusCode: 400,
            body: JSON.stringify({ message: "Note ID is required in path parameters" }),
        });
    }

    try {
        const noteId = event.pathParameters.id;

        const getCommand = new GetCommand({
            TableName: config.dynamodb.tableName,
            Key: {
                id: noteId,
            },
        });

        const result = await ddbDocClient.send(getCommand);
        
        if (!result.Item) {
            return callback(null, {
                statusCode: 404,
                body: JSON.stringify({ message: "Note not found" }),
            });
        }
        
        return callback(null, {
            statusCode: 200,
            body: JSON.stringify(result.Item),
        });
        
    } catch (error) {
        console.error('Error fetching note:', error);
        return callback(null, {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        });
    }
};


export const fetchNotes = async (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>): Promise<void> => {
    try {
        const scanCommand = new ScanCommand({
            TableName: config.dynamodb.tableName,
        });

        const result = await ddbDocClient.send(scanCommand);
        
        return callback(null, {
            statusCode: 200,
            body: JSON.stringify({
                notes: result.Items || [],
                count: result.Count || 0,
                scannedCount: result.ScannedCount || 0
            }),
        });
        
    } catch (error) {
        console.error('Error fetching notes:', error);
        return callback(null, {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        });
    }
};