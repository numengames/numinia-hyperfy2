import loadEnvFromAWS from './load-env-from-aws.mjs'

switch (process.env.CONFIG_PROVIDER) {
    case 'aws':
        await loadEnvFromAWS()
        break
    default:
        console.log('No config provider specified')
}