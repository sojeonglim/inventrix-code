import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config/environments';

interface DatabaseStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
  vpc: ec2.IVpc;
  dbSecurityGroup: ec2.SecurityGroup;
}

export class DatabaseStack extends cdk.Stack {
  public readonly dbEndpoint: string;
  public readonly dbPort: string;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const dbInstance = new rds.DatabaseInstance(this, 'InventrixDb', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      instanceType: new ec2.InstanceType(props.config.dbInstanceClass.replace('db.', '')),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroups: [props.dbSecurityGroup],
      databaseName: 'inventrix',
      credentials: rds.Credentials.fromGeneratedSecret('inventrix_admin', {
        secretName: `/inventrix/${props.config.envName}/db-credentials`,
      }),
      allocatedStorage: props.config.dbAllocatedStorage,
      storageType: rds.StorageType.GP3,
      storageEncrypted: true,
      multiAz: props.config.dbMultiAz,
      deletionProtection: props.config.dbDeletionProtection,
      backupRetention: cdk.Duration.days(7),
      removalPolicy: props.config.dbDeletionProtection
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      parameterGroup: new rds.ParameterGroup(this, 'DbParams', {
        engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_16 }),
        parameters: {
          'rds.force_ssl': '1',
        },
      }),
    });

    this.dbEndpoint = dbInstance.dbInstanceEndpointAddress;
    this.dbPort = dbInstance.dbInstanceEndpointPort;

    new cdk.CfnOutput(this, 'DbEndpoint', { value: this.dbEndpoint });
    new cdk.CfnOutput(this, 'DbPort', { value: this.dbPort });
  }
}
