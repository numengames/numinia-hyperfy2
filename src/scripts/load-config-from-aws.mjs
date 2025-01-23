import path from 'path';
import fs from 'fs/promises';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import '@aws-sdk/crc64-nvme-crt';

export default async function loadConfigFromAWS() {
    try {
        if (!process.env.ECOSYSTEM_FILE_NAME || !process.env.ECOSYSTEM_FILE_BUCKET) {
            throw new Error('ECOSYSTEM_FILE_NAME and ECOSYSTEM_FILE_BUCKET environment variables are required');
        }

        console.log('🚀 Starting config configuration...');
        console.log('📂 Current working directory:', process.cwd());

        // Download ecosystem file from S3
        console.log('📥 Downloading ecosystem file from S3...');
        const s3Client = new S3Client({ region: 'eu-west-1' });
        const s3Command = new GetObjectCommand({
            Bucket: process.env.ECOSYSTEM_FILE_BUCKET,
            Key: process.env.ECOSYSTEM_FILE_NAME
        });

        const s3Response = await s3Client.send(s3Command);
        const ecosystemContent = await s3Response.Body.transformToString();

        // Write the ecosystem file
        const ecosystemPath = path.join(process.cwd(), 'ecosystem.config.json');
        console.log('📝 Writing ecosystem file to:', ecosystemPath);
        await fs.writeFile(ecosystemPath, ecosystemContent, { encoding: 'utf8', flag: 'w', mode: 0o644 });
        console.log('✅ Ecosystem file written successfully');

        // Read and process the ecosystem file
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

        // Create .env file content
        let envContent = ' ';
        const envPath = path.join(process.cwd(), '.env');
        console.log('📝 Writing .env file to:', envPath);

        try {
            await fs.writeFile(envPath, envContent, { encoding: 'utf8', flag: 'w' });
            console.log('✅ Secrets written to .env file successfully');
            console.log('🎉 Configuration completed successfully!');
        } catch (error) {
            console.error('❌ Error writing or verifying .env file:', error);
            throw error;
        }
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
