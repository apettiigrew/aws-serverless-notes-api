import { z } from "zod"

export class APIError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message)
        this.name = 'APIError'
    }
}

export class ValidationError extends APIError {
    public error?: z.ZodError
    constructor(message: string, details?: z.ZodError) {
        super(message, 400, 'VALIDATION_ERROR')
        this.name = 'ValidationError'
        this.error = details
    }
}

export function validateRequestBody<T>(
    schema: z.ZodSchema<T>,
    body: unknown
): T {
    try {
        return schema.parse(body)
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new ValidationError('Request validation failed', error)
        }
        throw error
    }
}