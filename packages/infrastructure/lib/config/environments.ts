export interface EnvironmentConfig {
  envName: string;
  account?: string;
  region: string;
  ec2InstanceType: string;
  dbInstanceClass: string;
  dbAllocatedStorage: number;
  dbDeletionProtection: boolean;
  dbMultiAz: boolean;
  logRetentionDays: number;
  pm2Instances: number | 'max';
}

export const environments: Record<string, EnvironmentConfig> = {
  staging: {
    envName: 'staging',
    region: 'ap-northeast-2',
    ec2InstanceType: 't3.small',
    dbInstanceClass: 'db.t3.micro',
    dbAllocatedStorage: 20,
    dbDeletionProtection: false,
    dbMultiAz: false,
    logRetentionDays: 30,
    pm2Instances: 2,
  },
  production: {
    envName: 'production',
    region: 'ap-northeast-2',
    ec2InstanceType: 't3.medium',
    dbInstanceClass: 'db.t3.small',
    dbAllocatedStorage: 20,
    dbDeletionProtection: true,
    dbMultiAz: false,
    logRetentionDays: 90,
    pm2Instances: 'max',
  },
};

export function getConfig(envName: string): EnvironmentConfig {
  const config = environments[envName];
  if (!config) {
    throw new Error(`Unknown environment: ${envName}. Use 'staging' or 'production'.`);
  }
  return config;
}
