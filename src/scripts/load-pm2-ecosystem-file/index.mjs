import loadConfigFromAWS from './aws-s3.mjs'

switch (process.env.CONFIG_PROVIDER) {
    case 'aws':
        await loadConfigFromAWS()
        break
    default:
        console.log('No config provider specified')
}
