const loadConfigFromAWS = require('./load-config-from-aws.mjs')

switch (process.env.CONFIG_PROVIDER) {
    case 'aws':
        await loadConfigFromAWS()
        break
    default:
        console.log('No config provider specified')
}
