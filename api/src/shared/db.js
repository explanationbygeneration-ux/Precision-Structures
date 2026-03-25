const { CosmosClient } = require('@azure/cosmos');
const { v4: uuidv4 } = require('uuid');

const COSMOS_ENDPOINT = process.env.COSMOS_ENDPOINT;
const COSMOS_KEY = process.env.COSMOS_KEY;
const DATABASE_NAME = process.env.COSMOS_DATABASE || 'precision-portal';

// Container partition keys
const CONTAINER_CONFIG = {
    users: '/id',
    snapshots: '/page',
    audit: '/id',
    media: '/id'
};

let client = null;
let database = null;
const containers = {};

/**
 * Get or create the Cosmos DB client and database.
 * Lazily initializes on first call.
 */
async function getDatabase() {
    if (database) return database;

    if (!COSMOS_ENDPOINT || !COSMOS_KEY) {
        throw new Error(
            'Cosmos DB not configured. Set COSMOS_ENDPOINT and COSMOS_KEY environment variables.'
        );
    }

    client = new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY });
    const { database: db } = await client.databases.createIfNotExists({ id: DATABASE_NAME });
    database = db;
    return database;
}

/**
 * Get or create a container by name.
 */
async function getContainer(name) {
    if (containers[name]) return containers[name];

    const db = await getDatabase();
    const partitionKey = CONTAINER_CONFIG[name] || '/id';

    const { container } = await db.containers.createIfNotExists({
        id: name,
        partitionKey: { paths: [partitionKey] }
    });

    containers[name] = container;
    return container;
}

/**
 * Read all items from a container.
 * Returns an array of documents (without Cosmos metadata).
 */
async function getCollection(name) {
    try {
        const container = await getContainer(name);
        const { resources } = await container.items.readAll().fetchAll();
        // Strip Cosmos metadata fields
        return resources.map(stripCosmosFields);
    } catch (err) {
        console.error(`Error reading collection "${name}":`, err);
        return [];
    }
}

/**
 * Insert or update a single item in a container.
 * Returns the upserted item.
 */
async function upsertItem(name, item) {
    const container = await getContainer(name);
    const { resource } = await container.items.upsert(item);
    return stripCosmosFields(resource);
}

/**
 * Delete a single item from a container by id.
 * For containers with partition key /id, pass the id as partition key value.
 * For containers with other partition keys, pass the partition key value.
 */
async function deleteItem(name, id, partitionKeyValue) {
    const container = await getContainer(name);
    const pkValue = partitionKeyValue || id;
    await container.item(id, pkValue).delete();
}

/**
 * Find an item by id in a pre-fetched array.
 */
function findById(collection, id) {
    return collection.find(item => item.id === id) || null;
}

/**
 * Generate a new UUID.
 */
function generateId() {
    return uuidv4();
}

/**
 * Remove Cosmos DB system properties from a document.
 */
function stripCosmosFields(doc) {
    if (!doc) return doc;
    const { _rid, _self, _etag, _attachments, _ts, ...clean } = doc;
    return clean;
}

module.exports = {
    getCollection,
    upsertItem,
    deleteItem,
    findById,
    generateId,
    getContainer
};
