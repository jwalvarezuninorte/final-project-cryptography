const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('./src/config/application.properties');

const KEY_VAULT_DATABASE = properties.get('KEY_VAULT_DATABASE');
const KEY_VAULT_COLLECTION = properties.get('KEY_VAULT_COLLECTION');
const MONGODB_URI = properties.get('MONGODB_URI');
const SHARED_LIB_PATH = properties.get('SHARED_LIB_PATH');

module.exports = {
    KEY_VAULT_DATABASE,
    KEY_VAULT_COLLECTION,
    MONGODB_URI,
    SHARED_LIB_PATH
};