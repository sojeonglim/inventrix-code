import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config/environments';

interface MonitoringStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
  ec2Instance: ec2.Instance;
  alertEmail: string;
}

export class MonitoringStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    const prefix = `/inventrix/${props.config.envName}`;

    // Log Groups
    new logs.LogGroup(this, 'NginxLogs', {
      logGroupName: `${prefix}/nginx`,
      retention: props.config.logRetentionDays as unknown as logs.RetentionDays,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new logs.LogGroup(this, 'AppLogs', {
      logGroupName: `${prefix}/app`,
      retention: props.config.logRetentionDays as unknown as logs.RetentionDays,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // SNS Topic for alerts
    const alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: `inventrix-${props.config.envName}-alerts`,
      displayName: `Inventrix ${props.config.envName} Alerts`,
    });
    alertTopic.addSubscription(new subscriptions.EmailSubscription(props.alertEmail));

    // Alarm: High CPU
    const cpuAlarm = new cloudwatch.Alarm(this, 'HighCpuAlarm', {
      alarmName: `inventrix-${props.config.envName}-high-cpu`,
      metric: new cloudwatch.Metric({
        namespace: 'AWS/EC2',
        metricName: 'CPUUtilization',
        dimensionsMap: { InstanceId: props.ec2Instance.instanceId },
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      threshold: 80,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: 'CPU utilization exceeds 80% for 5 minutes',
    });
    cpuAlarm.addAlarmAction(new actions.SnsAction(alertTopic));

    // Alarm: High Status Check Failed
    const statusAlarm = new cloudwatch.Alarm(this, 'StatusCheckAlarm', {
      alarmName: `inventrix-${props.config.envName}-status-check`,
      metric: new cloudwatch.Metric({
        namespace: 'AWS/EC2',
        metricName: 'StatusCheckFailed',
        dimensionsMap: { InstanceId: props.ec2Instance.instanceId },
        period: cdk.Duration.minutes(5),
        statistic: 'Maximum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      alarmDescription: 'EC2 instance status check failed',
    });
    statusAlarm.addAlarmAction(new actions.SnsAction(alertTopic));

    new cdk.CfnOutput(this, 'AlertTopicArn', { value: alertTopic.topicArn });
  }
}
