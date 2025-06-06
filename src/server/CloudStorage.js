import { cloneDeep, throttle } from 'lodash-es'

export class CloudStorage {
  constructor(storageManager) {
    this.storageManager = storageManager
    this.data = {}
    this.loaded = false
    
    // Throttle saves to avoid too many writes
    this.save = throttle(() => this.persist(), 1000, { leading: true, trailing: true })
  }

  /**
   * Initialize the storage by loading existing data
   */
  async init() {
    try {
      this.data = await this.storageManager.loadStorageData()
      this.loaded = true
      console.log('Storage data loaded successfully')
    } catch (err) {
      console.error('Error loading storage data:', err)
      this.data = {}
      this.loaded = true
    }
  }

  get(key) {
    if (!this.loaded) {
      console.warn('Storage not yet loaded, returning undefined')
      return undefined
    }
    return this.data[key]
  }

  set(key, value) {
    if (!this.loaded) {
      console.warn('Storage not yet loaded, cannot set value')
      return
    }
    
    try {
      // Ensure value is serializable
      value = JSON.parse(JSON.stringify(value))
      this.data[key] = value
      this.save()
    } catch (err) {
      console.error('Error setting storage value:', err)
    }
  }

  async persist() {
    if (!this.loaded) {
      console.warn('Storage not yet loaded, cannot persist')
      return
    }
    
    try {
      await this.storageManager.saveStorageData(this.data)
      // console.log('Storage data persisted successfully')
    } catch (err) {
      console.error('Failed to persist storage:', err)
    }
  }

  /**
   * Force an immediate save (bypass throttling)
   */
  async forcePersist() {
    return await this.persist()
  }
} 