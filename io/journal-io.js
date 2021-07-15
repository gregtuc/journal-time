//UUID and Encryption
const { v4: uuid_v4 } = require('uuid');
const encryptor = require('../encryption/encryptor');

//Schemas
const journalModel = require('../models/journal');
const dictionaryModel = require('../models/dictionary');

//Storage
const Store = require('electron-store');
const journalStore = new Store({ journalModel });
const dictionaryStore = new Store({ dictionaryModel });

/**
 * Method to indicate whether journals already exist or not.
 * 
 * @returns boolean
 */
function journalsExist() {
    const keys = dictionaryStore.get("dictionary");
    return keys.length >= 1
}

/**
 * Save a uuid to the list of uuids.
 * 
 * @param {string} uuid 
 */
function addKeyToDictionary(uuid) {
    const keys = dictionaryStore.get("dictionary");
    if (!keys) {
        dictionaryStore.set("dictionary", [uuid]);
    } else {
        dictionaryStore.set("dictionary", keys.concat(uuid));
    }
}

/**
 * Remove a uuid from the list of uuids
 * 
 * @param {string} uuid 
 */
function removeKeyFromDictionary(uuid) {
    const keys = dictionaryStore.get("dictionary");
    if (keys) {
        dictionaryStore.set("dictionary", keys.filter(e => e !== uuid));
    }
}

/**
 * Save a new journal
 * 
 * @param {string} title 
 * @param {string} body 
 */
function saveNewJournal(title, body) {
    const userId = uuid_v4();
    journalStore.set(userId, {
        title: title,
        body: encryptor.encrypt(body, process.env.PASSWORD)
    })
    if (!journalStore.get(userId)) {
        console.warn("Failed to save the journal.");
    } else {
        addKeyToDictionary(userId);
    }
}

/**
 * Overwrite an existing journal
 * 
 * @param {string} uuid 
 * @param {string} title 
 * @param {string} body 
 */
function saveExistingJournal(uuid, title, body) {
    journalStore.set(uuid, {
        title: title,
        body: encryptor.encrypt(body, process.env.PASSWORD)
    })
    if (!journalStore.get(uuid)) {
        console.warn("Failed to save the journal.");
    }
}

/**
 * Get a specific journal
 * 
 * @param {string} uuid 
 * @returns a single journal object
 */
function getJournal(uuid) {
    const data = journalStore.get(uuid);
    if (!data) {
        console.warn("Failed to get data for the given uuid");
        return false;
    } else {
        const decryptedText = encryptor.decrypt(data.body, process.env.PASSWORD);
        if (decryptedText !== false) {
            return {
                uuid: uuid,
                title: data.title,
                body: decryptedText
            };
        } else {
            console.warn("Decryption failed");
            return false;
        }
    }
}

/**
 * Get all journals
 * 
 * @returns an array of journal objects
 */
function getAllJournals() {
    let journals = [];
    const keys = dictionaryStore.get("dictionary");

    if (!keys) {
        return false;
    }
    for (var i = 0; i < keys.length; i++) {
        const currentJournal = getJournal(keys[i], process.env.PASSWORD);
        if (currentJournal === false) {
            return false;
        } else {
            journals.push(currentJournal);
        }
    }
    return journals;
}

/**
 * Delete a specific journal
 * 
 * @param {string} uuid 
 * @returns true if successful, false if failed
 */
function deleteJournal(uuid) {
    journalStore.delete(uuid);
    if (journalStore.get(uuid)) {
        console.warn("Failed to delete.");
        return false;
    } else {
        removeKeyFromDictionary(uuid);
        return true;
    }
}

function deleteAllJournals() {
    const keys = dictionaryStore.get("dictionary");
    if (!keys) {
        return false;
    } else {
        for (var i = 0; i < keys.length; i++) {
            deleteJournal(keys[i]);
        }
    }
}

console.log(journalsExist());
module.exports = { journalsExist, saveNewJournal, saveExistingJournal, getJournal, getAllJournals, deleteJournal, deleteAllJournals }