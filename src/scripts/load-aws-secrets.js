import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export async function loadSecrets() {
    try {
        // Validate required variables
        const requiredEnvVars = [
            'AWS_SECRET_NAME',
            'AWS_REGION'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }

        // AWS SDK will automatically look for credentials in:
        // 1. Environment variables
        // 2. Shared credentials (~/.aws/credentials)
        // 3. IAM roles (if running on AWS)
        const client = new SecretsManagerClient({
            region: process.env.AWS_REGION
        });

        const command = new GetSecretValueCommand({
            SecretId: process.env.AWS_SECRET_NAME,
        });

        const response = await client.send(command);
        const secrets = JSON.parse(response.SecretString);

        // Inject secrets as environment variables
        Object.entries(secrets).forEach(([key, value]) => {
            process.env[key] = value;
        });

        console.log('✅ Secrets loaded successfully');
    } catch (error) {
        console.error('❌ Error loading secrets:', error);
        throw error; // Re-throw the error to be handled by the wrapper
    }
}