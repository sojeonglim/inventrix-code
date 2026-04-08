import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config/environments';

interface ComputeStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
  vpc: ec2.IVpc;
  publicSecurityGroup: ec2.SecurityGroup;
  appSecurityGroup: ec2.SecurityGroup;
  dbEndpoint: string;
  dbPort: string;
}

export class ComputeStack extends cdk.Stack {
  public readonly instance: ec2.Instance;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const role = new iam.Role(this, 'Ec2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      description: 'Inventrix EC2 instance role',
    });

    // SSM read access for secrets
    role.addToPolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameter', 'ssm:GetParameters'],
      resources: [`arn:aws:ssm:${props.config.region}:*:parameter/inventrix/${props.config.envName}/*`],
    }));

    // SES send email
    role.addToPolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
    }));

    // Bedrock invoke model
    role.addToPolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'],
    }));

    // CloudWatch logs and metrics
    role.addToPolicy(new iam.PolicyStatement({
      actions: [
        'logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents',
        'cloudwatch:PutMetricData',
      ],
      resources: ['*'],
    }));

    // CloudWatch agent managed policy
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'));

    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      '#!/bin/bash',
      'set -euo pipefail',
      '',
      '# System updates',
      'dnf update -y',
      '',
      '# Install Node.js 22',
      'curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -',
      'dnf install -y nodejs',
      '',
      '# Install pnpm',
      'npm install -g pnpm',
      '',
      '# Install PM2',
      'npm install -g pm2',
      '',
      '# Install Nginx',
      'dnf install -y nginx',
      'systemctl enable nginx',
      '',
      '# Install CloudWatch Agent',
      'dnf install -y amazon-cloudwatch-agent',
      '',
      '# Install certbot for SSL',
      'dnf install -y certbot python3-certbot-nginx',
      '',
      '# Create app directory',
      'mkdir -p /var/www/inventrix',
      'mkdir -p /var/log/inventrix',
      'chown -R ec2-user:ec2-user /var/www/inventrix /var/log/inventrix',
      '',
      `echo "Inventrix ${props.config.envName} instance ready"`,
    );

    this.instance = new ec2.Instance(this, 'AppInstance', {
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      instanceType: new ec2.InstanceType(props.config.ec2InstanceType),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup: props.publicSecurityGroup,
      role,
      userData,
      keyPair: ec2.KeyPair.fromKeyPairName(this, 'KeyPair', `inventrix-${props.config.envName}-key`),
      blockDevices: [{
        deviceName: '/dev/xvda',
        volume: ec2.BlockDeviceVolume.ebs(20, {
          volumeType: ec2.EbsDeviceVolumeType.GP3,
          encrypted: true,
        }),
      }],
      requireImdsv2: true,
    });

    // Also attach app security group
    this.instance.addSecurityGroup(props.appSecurityGroup);

    // Elastic IP
    const eip = new ec2.CfnEIP(this, 'ElasticIp');
    new ec2.CfnEIPAssociation(this, 'EipAssoc', {
      instanceId: this.instance.instanceId,
      allocationId: eip.attrAllocationId,
    });

    new cdk.CfnOutput(this, 'InstanceId', { value: this.instance.instanceId });
    new cdk.CfnOutput(this, 'PublicIp', { value: eip.attrPublicIp });
  }
}
