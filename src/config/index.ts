import dotenv from "dotenv";

dotenv.config();

export const config = {
    aws: {
        region: process.env.AWS_REGION,
    },
    dynamodb: {
        tableName: process.env.NOTES_TABLE_NAME,
    },
}
