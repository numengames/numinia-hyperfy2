import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import fs from 'fs';
import path from 'path';

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

    // Crear contenido del archivo .env
    let envContent = '';
    Object.entries(secrets).forEach(([key, value]) => {
        envContent += `${key}="${value}"\n`;
    });

    // Escribir el archivo .env
    const envPath = path.join(process.cwd(), '.env');
    fs.writeFileSync(envPath, envContent, { encoding: 'utf8', flag: 'w' });

    console.log('✅ Secrets written to .env file successfully');
} catch (error) {
    console.error('❌ Error loading secrets:', error);
    process.exit(1);
} 