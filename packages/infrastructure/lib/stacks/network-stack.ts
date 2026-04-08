import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config/environments';

interface NetworkStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
  deployerIp: string;
}

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.IVpc;
  public readonly publicSecurityGroup: ec2.SecurityGroup;
  public readonly appSecurityGroup: ec2.SecurityGroup;
  public readonly dbSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: NetworkStackProps) {
    super(scope, id, props);

    this.vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true });

    // Public SG: Nginx (HTTP/HTTPS + SSH from deployer)
    this.publicSecurityGroup = new ec2.SecurityGroup(this, 'PublicSG', {
      vpc: this.vpc,
      description: 'Nginx - HTTP/HTTPS public, SSH from deployer IP',
      allowAllOutbound: true,
    });
    this.publicSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP');
    this.publicSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS');
    this.publicSecurityGroup.addIngressRule(ec2.Peer.ipv4(props.deployerIp), ec2.Port.tcp(22), 'SSH from deployer');

    // App SG: Node.js (only from Public SG)
    this.appSecurityGroup = new ec2.SecurityGroup(this, 'AppSG', {
      vpc: this.vpc,
      description: 'Node.js app - port 3000 from Nginx only',
      allowAllOutbound: true,
    });
    this.appSecurityGroup.addIngressRule(this.publicSecurityGroup, ec2.Port.tcp(3000), 'App from Nginx');

    // DB SG: PostgreSQL (only from App SG)
    this.dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSG', {
      vpc: this.vpc,
      description: 'PostgreSQL - port 5432 from App only',
      allowAllOutbound: false,
    });
    this.dbSecurityGroup.addIngressRule(this.appSecurityGroup, ec2.Port.tcp(5432), 'PostgreSQL from App');

    new cdk.CfnOutput(this, 'VpcId', { value: this.vpc.vpcId });
  }
}
