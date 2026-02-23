import * as dotenv from "dotenv";

dotenv.config();

export const testConfig = {
  aws: {
    region: process.env.AWS_REGION ?? "us-east-1",
    provider: process.env.PROVIDER ?? "",
  },
  cognito: {
    userPoolId: process.env.COGNITO_USERPOOL_ID ?? "",
    clientId: process.env.COGNITO_WEBCLIENT_ID ?? "",
  },
  tables: {
    notes: process.env.NOTES_TABLE ?? "",
  },
  serverless: {
    accessKey: process.env.SERVERLESS_ACCESS_KEY ?? "",
  },
  testUser: {
    username: process.env.USERNAME ?? "",
    password: process.env.PASSWORD ?? "",
  },
  api: {
    baseUrl: process.env.TEST_ROOT ?? "",
  },
} as const;

export type TestConfig = typeof testConfig;
