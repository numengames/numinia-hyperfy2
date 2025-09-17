import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3'
import { importApp } from '../core/extras/appTools'
import { assets } from './assets'

export class CollectionsS3 {
  constructor() {
    // Parse S3 URI: s3://access_key:secret_key@endpoint/bucket/prefix
    // or for AWS: s3://access_key:secret_key@bucket.s3.region.amazonaws.com/prefix
    // or simple AWS: s3://access_key:secret_key@bucket/prefix (defaults to us-east-1)
    const uri = process.env.COLLECTIONS_S3_URI
    if (!uri) {
      throw new Error('COLLECTIONS_S3_URI environment variable is required')
    }

    const config = this.parseURI(uri)
    this.bucketName = config.bucket
    this.prefix = config.prefix || 'collections/'

    // Initialize S3 client
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: config.forcePathStyle,
    })
  }

  parseURI(uri) {
    try {
      // Remove s3:// prefix
      if (!uri.startsWith('s3://')) {
        throw new Error('URI must start with s3://')
      }
      uri = uri.slice(5)

      // Split by @ to separate credentials from endpoint/bucket
      const [credentials, endpointBucket] = uri.split('@')
      if (!credentials || !endpointBucket) {
        throw new Error('Invalid S3 URI format')
      }

      const [accessKeyId, secretAccessKey] = credentials.split(':')
      if (!accessKeyId || !secretAccessKey) {
        throw new Error('Missing access key or secret key')
      }

      // Parse endpoint/bucket/prefix
      const parts = endpointBucket.split('/')
      const endpointBucketPart = parts[0]
      const prefix = parts.slice(1).join('/')

      // Determine if this is AWS or custom endpoint
      let region = 'us-east-1'
      let endpoint = undefined
      let forcePathStyle = false
      let bucket = endpointBucketPart

      if (endpointBucketPart.includes('.s3.') && endpointBucketPart.includes('.amazonaws.com')) {
        // AWS format: bucket.s3.region.amazonaws.com
        const match = endpointBucketPart.match(/^(.+)\.s3\.(.+)\.amazonaws\.com$/)
        if (match) {
          bucket = match[1]
          region = match[2]
        }
      } else if (endpointBucketPart.includes('://')) {
        // Custom endpoint format: https://endpoint/bucket
        const url = new URL(endpointBucketPart)
        endpoint = `${url.protocol}//${url.host}`
        bucket = url.pathname.slice(1) // Remove leading slash
        forcePathStyle = true
      } else {
        // Simple AWS format: bucket (defaults to us-east-1)
        bucket = endpointBucketPart
      }

      return {
        accessKeyId,
        secretAccessKey,
        bucket,
        region,
        endpoint,
        forcePathStyle,
        prefix,
      }
    } catch (error) {
      throw new Error(`Failed to parse S3 URI: ${error.message}`)
    }
  }

  async init({ rootDir, worldDir }) {
    console.log('[collections] initializing from S3')
    this.list = []
    this.blueprints = new Set()

    // List all collection folders in S3
    const collectionFolders = await this.listCollectionFolders()
    
    for (const folderName of collectionFolders) {
      try {
        const collection = await this.loadCollection(folderName)
        if (collection) {
          this.list.push(collection)
          for (const blueprint of collection.blueprints) {
            this.blueprints.add(blueprint)
          }
        }
      } catch (error) {
        console.error(`[collections] Failed to load collection ${folderName}:`, error)
      }
    }
  }

  async listCollectionFolders() {
    const folders = new Set()
    let continuationToken = undefined

    do {
      try {
        const response = await this.client.send(
          new ListObjectsV2Command({
            Bucket: this.bucketName,
            Prefix: this.prefix,
            Delimiter: '/',
            ContinuationToken: continuationToken,
          })
        )

        if (response.CommonPrefixes) {
          for (const prefix of response.CommonPrefixes) {
            // Extract folder name from prefix
            const folderPath = prefix.Prefix.replace(this.prefix, '')
            const folderName = folderPath.replace('/', '')
            if (folderName) {
              folders.add(folderName)
            }
          }
        }

        continuationToken = response.NextContinuationToken
      } catch (error) {
        throw new Error(`Failed to list S3 collection folders: ${error.message}`)
      }
    } while (continuationToken)

    // Sort folders, keeping "default" first
    return Array.from(folders).sort((a, b) => {
      if (a === 'default') return -1
      if (b === 'default') return 1
      return a.localeCompare(b)
    })
  }

  async loadCollection(folderName) {
    try {
      // Load manifest.json
      const manifestKey = `${this.prefix}${folderName}/manifest.json`
      const manifestResponse = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: manifestKey,
        })
      )
      
      const manifestBuffer = await manifestResponse.Body.transformToByteArray()
      const manifest = JSON.parse(Buffer.from(manifestBuffer).toString())

      const blueprints = []
      
      // Load each app file
      for (const appFilename of manifest.apps) {
        const appKey = `${this.prefix}${folderName}/${appFilename}`
        const appResponse = await this.client.send(
          new GetObjectCommand({
            Bucket: this.bucketName,
            Key: appKey,
          })
        )
        
        const appBuffer = await appResponse.Body.transformToByteArray()
        const appFile = new File([appBuffer], appFilename, {
          type: 'application/octet-stream',
        })
        
        const app = await importApp(appFile)
        
        // Upload assets to the main assets system
        for (const asset of app.assets) {
          await assets.upload(asset.file)
        }
        
        blueprints.push(app.blueprint)
      }

      return {
        id: folderName,
        name: manifest.name,
        blueprints,
      }
    } catch (error) {
      console.error(`Failed to load collection ${folderName}:`, error)
      return null
    }
  }
}
