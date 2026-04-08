#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { getConfig } from '../lib/config/environments';
import { NetworkStack } from '../lib/stacks/network-stack';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { SecretsStack } from '../lib/stacks/secrets-stack';
import { ComputeStack } from '../lib/stacks/compute-stack';
import { MonitoringStack } from '../lib/stacks/monitoring-stack';
import { SESStack } from '../lib/stacks/ses-stack';

const app = new cdk.App();
const envName = app.node.tryGetContext('env') || 'staging';
const config = getConfig(envName);

const env: cdk.Environment = {
  account: config.account || process.env.CDK_DEFAULT_ACCOUNT,
  region: config.region,
};

const prefix = `Inventrix-${config.envName}`;

const networkStack = new NetworkStack(app, `${prefix}-Network`, {
  env,
  config,
  deployerIp: app.node.tryGetContext('deployerIp') || '0.0.0.0/32',
});

const databaseStack = new DatabaseStack(app, `${prefix}-Database`, {
  env,
  config,
  vpc: networkStack.vpc,
  dbSecurityGroup: networkStack.dbSecurityGroup,
});

const secretsStack = new SecretsStack(app, `${prefix}-Secrets`, {
  env,
  config,
});

const computeStack = new ComputeStack(app, `${prefix}-Compute`, {
  env,
  config,
  vpc: networkStack.vpc,
  publicSecurityGroup: networkStack.publicSecurityGroup,
  appSecurityGroup: networkStack.appSecurityGroup,
  dbEndpoint: databaseStack.dbEndpoint,
  dbPort: databaseStack.dbPort,
});

const monitoringStack = new MonitoringStack(app, `${prefix}-Monitoring`, {
  env,
  config,
  ec2Instance: computeStack.instance,
  alertEmail: app.node.tryGetContext('alertEmail') || 'admin@inventrix.example.com',
});

new SESStack(app, `${prefix}-SES`, {
  env,
  config,
  domain: app.node.tryGetContext('domain') || 'inventrix.example.com',
});

app.synth();
