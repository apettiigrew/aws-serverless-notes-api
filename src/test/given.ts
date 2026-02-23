import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AuthFlowType,
} from "@aws-sdk/client-cognito-identity-provider";
import { testConfig } from "./init";

/**
 * Signs in a user via the Cognito Admin API and returns the ID token.
 * Uses testConfig from init (USER_POOL_ID, CLIENT_ID, USERNAME, PASSWORD, AWS_REGION from .env).
 */
export async function signInAndGetIdToken(
  username?: string,
  password?: string
): Promise<string> {
  const poolId = testConfig.cognito.userPoolId;
  const appClientId = testConfig.cognito.clientId;
  const user = username ?? testConfig.testUser.username
  const pass = password ?? testConfig.testUser.password;
  const region = testConfig.aws.region;

  // console.log(poolId, appClientId, user, pass, region);
  if (!poolId || !appClientId || !user || !pass) {
    throw new Error(
      "Cognito sign-in requires USER_POOL_ID, CLIENT_ID, USERNAME, and PASSWORD in .env"
    );
  }

  const client = new CognitoIdentityProviderClient({ region });

  const command = new AdminInitiateAuthCommand({
    UserPoolId: poolId,
    ClientId: appClientId,
    AuthFlow: AuthFlowType.ADMIN_USER_PASSWORD_AUTH,
    AuthParameters: {
      USERNAME: user,
      PASSWORD: pass,
    },
  });

  const response = await client.send(command);

  const idToken = response.AuthenticationResult?.IdToken;
  if (!idToken) {
    const challenge = response.ChallengeName
      ? ` Challenge: ${response.ChallengeName}`
      : "";
    throw new Error(
      `Cognito AdminInitiateAuth did not return an IdToken.${challenge}`
    );
  }

  return idToken;
}
