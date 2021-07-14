const journalFolder = './entries/';
const path = __dirname + "/entries/";
const encryptor = require('./encryption');
var stringify = require('json-stringify-safe');

async function getEncryptedJournals() {
    return new Promise(function (resolve, reject) {
        let journals = [];
        let fs = require('fs');
        fs.readdir(journalFolder, (err, files) => {
            if (files.length < 1) {
                resolve(false);
            }
            files.forEach(file => {
                try {
                    var data = JSON.parse(fs.readFileSync(path + file, 'utf8'));
                    journals.push(
                        {
                            filename: file,
                            contents: data["contents"],
                        }
                    );
                    resolve(journals);
                } catch (e) {
                    console.log('Error:', e.stack);
                }
            });
        });
    })
}

//0: No files
//1: Failed decryption
async function getJournals(password) {
    return new Promise(function (resolve, reject) {
        let journals = [];
        let fs = require('fs');
        fs.readdir(journalFolder, (err, files) => {
            if (files.length < 1) {
                resolve(0);
            }
            files.forEach(file => {
                try {
                    var data = JSON.parse(fs.readFileSync(path + file, 'utf8'));
                    var decryptedContents = encryptor.decrypt(data["contents"], password);

                    if (decryptedContents === false) {
                        //Decryption failed, forward message to calling function.
                        resolve(1);
                    } else {
                        journals.push(
                            {
                                filename: file,
                                contents: decryptedContents,
                            }
                        );
                    }
                } catch (e) {
                    console.log('Error:', e.stack);
                }
            });
            resolve(journals);
        });
    })
}

async function writeJournal(title, body) {
    var trimmedTitle = extensionTrimmer(title);
    const journal = stringify({
        title: trimmedTitle,
        contents: encryptor.encrypt(body, "password"),
    });
    let fs = require('fs');
    fs.writeFile(path + trimmedTitle + ".json", journal, function (err) {
        if (err) return console.log("Couldn't Write.");
    });
}

async function journalsExist() {
    const fs = require('fs');
    const dir = './entries';
    return new Promise(function (resolve, reject) {
        fs.readdir(dir, (err, files) => {
            if (files.length >= 1) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    })
}

function extensionTrimmer(title) {
    return title.replace(/\.[^/.]+$/, "");
}

module.exports = { getJournals, writeJournal, getEncryptedJournals, journalsExist, extensionTrimmer }