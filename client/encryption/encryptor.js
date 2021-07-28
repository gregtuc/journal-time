var CryptoJS = require("crypto-js");

/**
 * Encrypt a string in AES with a password.
 * 
 * @param {string} body 
 * @param {string} password 
 * @returns 
 */
function encrypt(body, password) {
    const bodyWithSignature = "$DECRYPTED$" + body;
    return CryptoJS.AES.encrypt(bodyWithSignature, password).toString();
}

/**
 * Decrypt a string from AES with a password.
 * 
 * @param {string} encryptedAES 
 * @param {string} password 
 * @returns 
 */
function decrypt(encryptedAES, password) {
    const bytes = CryptoJS.AES.decrypt(encryptedAES, password);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);

    if (originalText.search(/\$DECRYPTED\$/) !== -1) {
        return originalText.replace(/\$DECRYPTED\$/, "");
    } else {
        return false;
    }
}

module.exports = { encrypt, decrypt }