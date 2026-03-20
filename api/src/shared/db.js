const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', 'data');

/**
 * Reads and returns the array from data/{name}.json.
 * Creates the file with an empty array if it does not exist.
 */
function getCollection(name) {
    const filePath = path.join(DATA_DIR, `${name}.json`);
    try {
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
            fs.writeFileSync(filePath, '[]', 'utf8');
            return [];
        }
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error(`Error reading collection "${name}":`, err);
        return [];
    }
}

/**
 * Writes the array to data/{name}.json.
 */
function saveCollection(name, data) {
    const filePath = path.join(DATA_DIR, `${name}.json`);
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error(`Error saving collection "${name}":`, err);
        throw err;
    }
}

/**
 * Finds an item by id in an array.
 */
function findById(collection, id) {
    return collection.find(item => item.id === id) || null;
}

/**
 * Generates a new UUID.
 */
function generateId() {
    return uuidv4();
}

module.exports = {
    getCollection,
    saveCollection,
    findById,
    generateId
};
