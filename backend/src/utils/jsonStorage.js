const fs = require('fs').promises;
const path = require('path');

class JsonStorage {
  constructor() {
    this.dataDir = process.env.DATA_DIR || './data';
    this.ensureDataDir();
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
  }

  getFilePath(collection) {
    return path.join(this.dataDir, `${collection}.json`);
  }

  async readCollection(collection) {
    try {
      const filePath = this.getFilePath(collection);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return []; // File doesn't exist, return empty array
      }
      throw error;
    }
  }

  async writeCollection(collection, data) {
    try {
      const filePath = this.getFilePath(collection);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing to ${collection}:`, error);
      throw error;
    }
  }

  async findOne(collection, query) {
    const data = await this.readCollection(collection);
    return data.find(item => this.matchesQuery(item, query)) || null;
  }

  async find(collection, query = {}) {
    const data = await this.readCollection(collection);
    if (Object.keys(query).length === 0) {
      return data;
    }
    return data.filter(item => this.matchesQuery(item, query));
  }

  async findById(collection, id) {
    return this.findOne(collection, { _id: id });
  }

  async insertOne(collection, document) {
    const data = await this.readCollection(collection);
    
    // Generate ID if not provided
    if (!document._id) {
      document._id = this.generateId();
    }
    
    // Add timestamps
    document.createdAt = new Date().toISOString();
    document.updatedAt = new Date().toISOString();
    
    data.push(document);
    await this.writeCollection(collection, data);
    
    return document;
  }

  async updateOne(collection, query, update) {
    const data = await this.readCollection(collection);
    const index = data.findIndex(item => this.matchesQuery(item, query));
    
    if (index === -1) {
      return null;
    }
    
    // Apply update
    if (update.$set) {
      Object.assign(data[index], update.$set);
    } else {
      Object.assign(data[index], update);
    }
    
    data[index].updatedAt = new Date().toISOString();
    
    await this.writeCollection(collection, data);
    return data[index];
  }

  async findOneAndUpdate(collection, query, update, options = {}) {
    let document = await this.findOne(collection, query);
    
    if (!document && options.upsert) {
      // Create new document
      document = { ...query, ...update };
      return this.insertOne(collection, document);
    }
    
    if (document) {
      return this.updateOne(collection, query, update);
    }
    
    return null;
  }

  async deleteOne(collection, query) {
    const data = await this.readCollection(collection);
    const index = data.findIndex(item => this.matchesQuery(item, query));
    
    if (index === -1) {
      return null;
    }
    
    const deleted = data.splice(index, 1)[0];
    await this.writeCollection(collection, data);
    
    return deleted;
  }

  matchesQuery(item, query) {
    return Object.keys(query).every(key => {
      if (key.includes('.')) {
        // Handle nested properties like 'onboarding.step2.accessToken'
        const value = this.getNestedValue(item, key);
        return value === query[key];
      }
      return item[key] === query[key];
    });
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Utility method to count documents
  async countDocuments(collection, query = {}) {
    const documents = await this.find(collection, query);
    return documents.length;
  }
}

module.exports = new JsonStorage();