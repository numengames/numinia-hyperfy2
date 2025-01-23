import '@aws-sdk/crc64-nvme-crt';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export default async function loadEnvFromAWS() {
    try {
        const AWS_REGION = process.env.AWS_REGION;
        const AWS_SECRET_NAME = process.env.AWS_SECRET_NAME;

        console.log('AWS_REGION', AWS_REGION);
        console.log('AWS_SECRET_NAME', AWS_SECRET_NAME);

        // AWS SDK will automatically look for credentials in:
        // 1. Environment variables
        // 2. Shared credentials (~/.aws/credentials)
        // 3. IAM roles (if running on AWS)
        const secretsClient = new SecretsManagerClient({ region: AWS_REGION });

        const secretsCommand = new GetSecretValueCommand({ SecretId: AWS_SECRET_NAME });

        const secretsResponse = await secretsClient.send(secretsCommand);
        const secrets = JSON.parse(secretsResponse.SecretString);

        Object.entries(secrets).forEach(([key, value]) => {
            process.env[key] = value;
        });
    } catch (error) {
        console.error('❌ Error loading environment variables from AWS:', error);
        process.exit(1);
    }
}