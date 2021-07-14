var CryptoJS = require("crypto-js");

function encrypt(body, password) {
    var bodyWithSignature = "$DECRYPTED$" + body;
    var encryptedBytes = CryptoJS.AES.encrypt(bodyWithSignature, password);
    return encryptedBytes;
}

function decrypt(encryptedAES, password) {
    var decryptedBytes = CryptoJS.AES.decrypt(encryptedAES, password);
    var decryptedBytesToText = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (decryptedBytesToText.search(/\$DECRYPTED\$/) !== -1) {
        return decryptedBytesToText.replace(/\$DECRYPTED\$/, "");
    } else {
        return false;
    }
}



module.exports = { encrypt, decrypt }