import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  AuthFlowType,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import type { SignupRequest, LoginRequest } from "@retire-strong/shared-api";

export class AuthService {
  private client: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;

  constructor(userPoolId: string, clientId: string, region: string = "us-east-1") {
    this.client = new CognitoIdentityProviderClient({ region });
    this.userPoolId = userPoolId;
    this.clientId = clientId;
  }

  async signUp(input: SignupRequest) {
    const command = new SignUpCommand({
      ClientId: this.clientId,
      Username: input.email,
      Password: input.password,
      UserAttributes: [
        { Name: "email", Value: input.email },
        { Name: "given_name", Value: input.firstName },
        { Name: "family_name", Value: input.lastName },
      ],
    });

    const response = await this.client.send(command);
    return {
      userId: response.UserSub,
      email: input.email,
      requiresVerification: !response.UserConfirmed,
    };
  }

  async login(input: LoginRequest) {
    const command = new InitiateAuthCommand({
      ClientId: this.clientId,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: input.email,
        PASSWORD: input.password,
      },
    });

    const response = await this.client.send(command);

    if (!response.AuthenticationResult) {
      throw new Error("Authentication failed");
    }

    return {
      accessToken: response.AuthenticationResult.AccessToken || "",
      refreshToken: response.AuthenticationResult.RefreshToken,
      expiresIn: response.AuthenticationResult.ExpiresIn || 3600,
      idToken: response.AuthenticationResult.IdToken,
    };
  }
}

