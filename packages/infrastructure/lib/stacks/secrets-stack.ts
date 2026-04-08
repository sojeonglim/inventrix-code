import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config/environments';

interface SecretsStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
}

export class SecretsStack extends cdk.Stack {
  public readonly jwtSecretParam: ssm.StringParameter;

  constructor(scope: Construct, id: string, props: SecretsStackProps) {
    super(scope, id, props);

    const prefix = `/inventrix/${props.config.envName}`;

    // JWT_SECRET — placeholder, update manually or via CLI after deploy
    this.jwtSecretParam = new ssm.StringParameter(this, 'JwtSecret', {
      parameterName: `${prefix}/JWT_SECRET`,
      stringValue: 'CHANGE_ME_AFTER_DEPLOY',
      description: 'JWT signing secret - update via AWS CLI after deployment',
      tier: ssm.ParameterTier.STANDARD,
    });

    new ssm.StringParameter(this, 'JwtExpiresIn', {
      parameterName: `${prefix}/JWT_EXPIRES_IN`,
      stringValue: '15m',
      description: 'JWT access token expiration time',
    });

    new ssm.StringParameter(this, 'JwtRefreshExpiresIn', {
      parameterName: `${prefix}/JWT_REFRESH_EXPIRES_IN`,
      stringValue: '7d',
      description: 'JWT refresh token expiration time',
    });

    new cdk.CfnOutput(this, 'JwtSecretParamName', { value: `${prefix}/JWT_SECRET` });
    new cdk.CfnOutput(this, 'Note', {
      value: `Run: aws ssm put-parameter --name ${prefix}/JWT_SECRET --type SecureString --value "<your-secret>" --overwrite`,
    });
  }
}
