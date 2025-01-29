import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export default async function loadEnvFromAWS() {
    const pm2Env = JSON.parse(process.env.pm2_env);

    const AWS_REGION = pm2Env.AWS_REGION;
    const AWS_SECRET_NAME = pm2Env.AWS_SECRET_NAME;

    if (!AWS_REGION || !AWS_SECRET_NAME) {
        throw new Error('AWS_REGION and AWS_SECRET_NAME are required');
    }

    // AWS SDK will automatically look for credentials in:
    // 1. Environment variables
    // 2. Shared credentials (~/.aws/credentials)
    // 3. IAM roles (if running on AWS)
    const secretsClient = new SecretsManagerClient({ region: AWS_REGION });
    const secretsCommand = new GetSecretValueCommand({ SecretId: AWS_SECRET_NAME });

    try {
        const secretsResponse = await secretsClient.send(secretsCommand);
        const secrets = JSON.parse(secretsResponse.SecretString);

        Object.entries(secrets).forEach(([key, value]) => {
            process.env[key] = value;
        });

        console.log('✅ Environment variables loaded from AWS Secrets Manager');
    } catch (error) {
        console.error('❌ Error loading secrets from AWS:', error.message);
        throw error;
    }
}