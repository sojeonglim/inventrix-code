import * as cdk from 'aws-cdk-lib';
import * as ses from 'aws-cdk-lib/aws-ses';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config/environments';

interface SESStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
  domain: string;
}

export class SESStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SESStackProps) {
    super(scope, id, props);

    const emailIdentity = new ses.EmailIdentity(this, 'DomainIdentity', {
      identity: ses.Identity.domain(props.domain),
    });

    new cdk.CfnOutput(this, 'SesDomain', { value: props.domain });
    new cdk.CfnOutput(this, 'DkimNote', {
      value: 'Add DKIM CNAME records to your DNS. Check SES console for values.',
    });
  }
}
