import { APIGatewayRequestAuthorizerEvent, Context } from "aws-lambda";
import { CognitoJwtVerifier } from "aws-jwt-verify";

const COGNITO_USERPOOL_ID = process.env.COGNITO_USERPOOL_ID;
const COGNITO_WEBCLIENT_ID = process.env.COGNITO_WEBCLIENT_ID;

const jwtVerify = CognitoJwtVerifier.create({
    userPoolId:COGNITO_USERPOOL_ID ?? "",
    tokenUse: "id",
    clientId:COGNITO_WEBCLIENT_ID ?? ""
})

interface PolicyDocument {
    Version: string;
    Statement: Array<{
        Action: string;
        Effect: string;
        Resource: string;
    }>;
}

interface AuthResponse {
    principalId: string;
    policyDocument?: PolicyDocument;
    context?: Record<string, any>;
}

const generatePolicy = (
    principalId: string,
    effect: string,
    resource: string
): AuthResponse => {
    const authResponse: AuthResponse = {
        principalId,
    };

    if (effect && resource) {
        const policyDocument: PolicyDocument = {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: effect,
                    Resource: resource,
                },
            ],
        };
        authResponse.policyDocument = policyDocument;
    }

    // Eg of passing information back to the lambda function in the workflow
    authResponse.context = {
        foo: "bar",
    };

    return authResponse;
};

export const handler = async (event:APIGatewayRequestAuthorizerEvent,context:Context,callback:CallableFunction) => {
    console.log(event)
    const token = (event as { authorizationToken?: string }).authorizationToken
    console.log(token);
    if (!token) {
        console.log("token not present")
        return generatePolicy("user", "Deny", event.methodArn!);
    }
    
    try {
        const payload = await jwtVerify.verify(token);
        return generatePolicy(payload.sub ?? "user", "Allow", event.methodArn!);
    } catch (err) {
        console.log(err);
        return generatePolicy("user", "Deny", event.methodArn!);
    }
}


/**
 * Used for string based lambda authorization by setting "Authorization" header key value pair
 */
// export const handler = async (event: APIGatewayRequestAuthorizerEvent) => {

//     const token = event.headers?.Authorization;
    
//     if (!token) {
//         return generatePolicy("user", "Deny", event.methodArn!);
//     }

//    switch(token) {
//     case "allow":
//         return generatePolicy("user", "Allow", event.methodArn!);
//     case "deny":
//         return generatePolicy("user", "Deny", event.methodArn!);
//     default:
//         return generatePolicy("user", "Deny", event.methodArn!);
//    }
// };
