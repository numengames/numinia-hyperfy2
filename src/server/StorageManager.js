import { FileStorage } from './FileStorage.js'
import { S3Storage } from './S3Storage.js'

export class StorageManager {
  constructor() {
    this.storage = null
    this.isS3 = false
  }

  /**
   * Initialize storage based on environment configuration
   */
  async initialize() {
    if (process.env.S3_BUCKET_NAME) {
      // Initialize S3 storage
      this.isS3 = true
      this.storage = new S3Storage({
        bucketName: process.env.S3_BUCKET_NAME,
        region: process.env.S3_REGION || 'us-east-1',
        assetsPrefix: process.env.S3_ASSETS_PREFIX || 'assets/',
        collectionsPrefix: process.env.S3_COLLECTIONS_PREFIX || 'collections/',
        storagePrefix: process.env.S3_STORAGE_PREFIX || 'storage/',
        cloudfrontUrl: process.env.CLOUDFRONT_URL, // Optional CloudFront URL
      })
      
      console.log('Initializing S3 storage...')
      await this.storage.initialize()
      
    } else {
      // Initialize local file storage
      this.isS3 = false
      this.storage = new FileStorage({
        assetsUrl: '/assets/',
      })
      
      console.log('Initializing local file storage...')
      await this.storage.initialize()
    }
  }

  /**
   * Get the assets URL based on storage type and CloudFront configuration
   * @returns {string} The assets URL
   */
  getAssetsUrl() {
    if (this.isS3) {
      // If CloudFront URL is configured, use it with assets prefix
      if (process.env.CLOUDFRONT_URL) {
        const baseUrl = process.env.CLOUDFRONT_URL.endsWith('/') 
          ? process.env.CLOUDFRONT_URL.slice(0, -1)  // Remove trailing slash
          : process.env.CLOUDFRONT_URL
        const assetsPrefix = (process.env.S3_ASSETS_PREFIX || 'assets/').replace(/\/$/, '') // Remove trailing slash
        return `${baseUrl}/${assetsPrefix}`
      }
      // Otherwise use S3 direct URL
      const assetsPrefix = (process.env.S3_ASSETS_PREFIX || 'assets/').replace(/\/$/, '') // Remove trailing slash
      return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${assetsPrefix}`
    } else {
      return process.env.PUBLIC_ASSETS_URL || '/assets'  // No trailing slash for local
    }
  }

  /**
   * Get paths for local storage (when not using S3)
   * @returns {object|null} Object with paths or null if using S3
   */
  getPaths() {
    if (!this.isS3 && this.storage.getPaths) {
      return this.storage.getPaths()
    }
    return null
  }

  /**
   * Check if using S3 storage
   * @returns {boolean}
   */
  isUsingS3() {
    return this.isS3
  }

  /**
   * Upload a file
   * @param {string} filename - The filename
   * @param {Buffer} buffer - The file data
   * @param {string} contentType - The MIME type
   * @returns {Promise<string>} The file URL
   */
  async uploadFile(filename, buffer, contentType) {
    if (!this.storage) {
      throw new Error('Storage not initialized')
    }
    return await this.storage.uploadFile(filename, buffer, contentType)
  }

  /**
   * Check if a file exists
   * @param {string} filename - The filename
   * @returns {Promise<boolean>}
   */
  async fileExists(filename) {
    if (!this.storage) {
      throw new Error('Storage not initialized')
    }
    return await this.storage.fileExists(filename)
  }

  /**
   * Get the public URL for a file
   * @param {string} filename - The filename
   * @returns {string}
   */
  getPublicUrl(filename) {
    if (!this.storage) {
      throw new Error('Storage not initialized')
    }
    return this.storage.getPublicUrl(filename)
  }

  /**
   * Delete a file
   * @param {string} filename - The filename
   * @returns {Promise<boolean>}
   */
  async deleteFile(filename) {
    if (!this.storage) {
      throw new Error('Storage not initialized')
    }
    return await this.storage.deleteFile(filename)
  }

  /**
   * List all files
   * @returns {Promise<string[]>}
   */
  async listFiles() {
    if (!this.storage) {
      throw new Error('Storage not initialized')
    }
    return await this.storage.listFiles()
  }

  /**
   * Get file stats
   * @param {string} filename - The filename
   * @returns {Promise<object|null>}
   */
  async getFileStats(filename) {
    if (!this.storage) {
      throw new Error('Storage not initialized')
    }
    return await this.storage.getFileStats(filename)
  }

  /**
   * Upload a collection file
   * @param {string} filename - The collection filename
   * @param {Buffer} buffer - The file data
   * @returns {Promise<string>} The file path/key
   */
  async uploadCollection(filename, buffer) {
    if (!this.storage) {
      throw new Error('Storage not initialized')
    }
    return await this.storage.uploadCollection(filename, buffer)
  }

  /**
   * Read a collection file
   * @param {string} filename - The collection filename
   * @returns {Promise<Buffer|null>} The file data or null if not found
   */
  async readCollection(filename) {
    if (!this.storage) {
      throw new Error('Storage not initialized')
    }
    return await this.storage.readCollection(filename)
  }

  /**
   * List collection files
   * @returns {Promise<string[]>} Array of collection filenames
   */
  async listCollections() {
    if (!this.storage) {
      throw new Error('Storage not initialized')
    }
    return await this.storage.listCollections()
  }

  /**
   * Save storage.json data
   * @param {object} data - The storage data
   * @returns {Promise<void>}
   */
  async saveStorageData(data) {
    if (!this.storage) {
      throw new Error('Storage not initialized')
    }
    return await this.storage.saveStorageData(data)
  }

  /**
   * Load storage.json data
   * @returns {Promise<object>} The storage data
   */
  async loadStorageData() {
    if (!this.storage) {
      throw new Error('Storage not initialized')
    }
    return await this.storage.loadStorageData()
  }

  /**
   * Get signed upload URL (S3 only)
   * @param {string} filename - The filename
   * @param {string} contentType - The MIME type
   * @param {number} expiresIn - Expiration time in seconds
   * @returns {Promise<string>}
   */
  async getPresignedUploadUrl(filename, contentType, expiresIn = 300) {
    if (!this.storage) {
      throw new Error('Storage not initialized')
    }
    if (!this.isS3) {
      throw new Error('Presigned URLs are only available with S3 storage')
    }
    return await this.storage.getPresignedUploadUrl(filename, contentType, expiresIn)
  }

  /**
   * Get signed download URL (S3 only)
   * @param {string} filename - The filename
   * @param {number} expiresIn - Expiration time in seconds
   * @returns {Promise<string>}
   */
  async getPresignedDownloadUrl(filename, expiresIn = 3600) {
    if (!this.storage) {
      throw new Error('Storage not initialized')
    }
    if (!this.isS3) {
      throw new Error('Presigned URLs are only available with S3 storage')
    }
    return await this.storage.getPresignedDownloadUrl(filename, expiresIn)
  }
} 