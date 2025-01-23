const fs = require('fs');
const path = require('path');

function loadEnvFile() {
    const envFile = process.env.ENV_FILE;
    if (!envFile) {
        console.error('❌ ENV_FILE not specified');
        return;
    }

    const envPath = path.join(process.cwd(), envFile);

    try {
        if (!fs.existsSync(envPath)) {
            console.error(`❌ File not found: ${envPath}`);
            return;
        }

        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = envContent
            .split('\n')
            .filter(line => line.trim() && !line.startsWith('#'))
            .reduce((acc, line) => {
                const [key, ...values] = line.split('=');
                acc[key.trim()] = values.join('=').trim();
                return acc;
            }, {});

        // Inject variables into process.env
        Object.entries(envVars).forEach(([key, value]) => {
            process.env[key] = value;
        });

        console.log(`✅ Environment variables loaded from ${envFile}`);
    } catch (error) {
        console.error(`❌ Error loading ${envFile}:`, error.message);
    }
}

loadEnvFile();