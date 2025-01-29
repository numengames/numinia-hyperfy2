import path from 'path';
import fs from 'fs/promises';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export default async function loadConfigFromAWS() {
    try {
        if (!process.env.ECOSYSTEM_FILE_NAME || !process.env.ECOSYSTEM_FILE_BUCKET) {
            throw new Error('ECOSYSTEM_FILE_NAME and ECOSYSTEM_FILE_BUCKET environment variables are required');
        }

        console.log('🚀 Starting config configuration...');
        console.log('📂 Current working directory:', process.cwd());

        // Download ecosystem file from S3
        console.log('📥 Downloading ecosystem file from S3...');
        const s3Client = new S3Client({
            region: 'eu-west-1',
            responseChecksumValidation: "WHEN_REQUIRED"
        });
        const s3Command = new GetObjectCommand({
            Bucket: process.env.ECOSYSTEM_FILE_BUCKET,
            Key: process.env.ECOSYSTEM_FILE_NAME
        });

        const s3Response = await s3Client.send(s3Command);
        const ecosystemContent = await s3Response.Body.transformToString();

        // Write the ecosystem file
        const ecosystemPath = path.join(process.cwd(), 'ecosystem.config.json');
        console.log('📝 Writing ecosystem file to:', ecosystemPath);
        await fs.writeFile(ecosystemPath, ecosystemContent, { encoding: 'utf8' });
        console.log('✅ Ecosystem file written successfully');

        const envPath = path.join(process.cwd(), '.env');
        console.log('📝 Writing .env file to:', envPath);
        await fs.writeFile(envPath, '', { encoding: 'utf8' });
        console.log('🎉 Configuration completed successfully!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
