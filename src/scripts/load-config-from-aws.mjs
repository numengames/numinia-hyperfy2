import path from 'path';
import fs from 'fs/promises';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

try {
    if (!process.env.ECOSYSTEM_FILE_NAME || !process.env.ECOSYSTEM_FILE_BUCKET) {
        throw new Error('ECOSYSTEM_FILE_NAME and ECOSYSTEM_FILE_BUCKET environment variables are required');
    }

    console.log('🚀 Starting config configuration...');

    // Descargar ecosystem file de S3
    console.log('📥 Downloading ecosystem file from S3...');
    const s3Client = new S3Client({ region: 'eu-west-1' });
    const s3Command = new GetObjectCommand({
        Bucket: process.env.ECOSYSTEM_FILE_BUCKET,
        Key: process.env.ECOSYSTEM_FILE_NAME
    });

    const s3Response = await s3Client.send(s3Command);
    const ecosystemContent = await s3Response.Body.transformToString();

    // Escribir el ecosystem file
    const ecosystemPath = path.join(process.cwd(), 'ecosystem.config.json');
    await fs.writeFile(ecosystemPath, ecosystemContent, { encoding: 'utf8', flag: 'w' });
    console.log('✅ Ecosystem file written successfully');

    // Leer y procesar el ecosystem file
    const ecosystemConfig = JSON.parse(ecosystemContent);
    const AWS_REGION = ecosystemConfig.apps[0].env.AWS_REGION;
    const AWS_SECRET_NAME = ecosystemConfig.apps[0].env.AWS_SECRET_NAME;

    if (!AWS_REGION) {
        throw new Error('AWS_REGION is required');
    } else if (!AWS_SECRET_NAME) {
        throw new Error('AWS_SECRET_NAME is required');
    }

    // AWS SDK will automatically look for credentials in:
    // 1. Environment variables
    // 2. Shared credentials (~/.aws/credentials)
    // 3. IAM roles (if running on AWS)
    const secretsClient = new SecretsManagerClient({ region: AWS_REGION });

    const secretsCommand = new GetSecretValueCommand({ SecretId: AWS_SECRET_NAME });

    const secretsResponse = await secretsClient.send(secretsCommand);
    const secrets = JSON.parse(secretsResponse.SecretString);

    // Crear contenido del archivo .env
    let envContent = '';
    Object.entries(secrets).forEach(([key, value]) => {
        envContent += `${key}="${value}"\n`;
    });

    // Escribir el archivo .env
    const envPath = path.join(process.cwd(), '.env');
    fs.writeFileSync(envPath, envContent, { encoding: 'utf8', flag: 'w' });

    console.log('✅ Secrets written to .env file successfully');
    console.log('🎉 Configuration completed successfully!');
} catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
}
