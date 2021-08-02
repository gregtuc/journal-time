const axios = require('axios');

//Resolves the generated code.
async function alphaConnectionPartOne() {
    return new Promise((resolve, reject) => {
        axios.get('http://localhost:8080/initializePairing')
            .then((response) => {
                resolve(response.data);
            }).catch(function (error) {
                console.log(error);
            });
    });
}

//Waits for the generated code to be matched by a beta user.
async function alphaConnectionPartTwo(data) {
    return new Promise((resolve, reject) => {
        axios.post('http://localhost:8080/waitForMatch', JSON.stringify(data))
            .then((result) => {
                //Now that the code has been verified as match, initialize a file exchange with the server.
                if (result.data.matched == true) {
                    sendJournalsToServer(result.data.code).then(result => {
                        //The resolved result is the data from the other party.
                        resolve(result);
                    })
                }
            }).catch(function (error) {
                console.log(error);
            });
    });
}

//The party that has to enter the code on their screen
async function betaConnection(code) {
    return new Promise((resolve, reject) => {
        axios.post('http://localhost:8080/submitCode', JSON.stringify({ code: code }))
            .then((result) => {
                //Now that the code has been verified as match, initialize a file exchange with the server.
                if (result.data.matched == true) {
                    sendJournalsToServer(result.data.code).then(result => {
                        //The resolved result is the data from the other party.
                        resolve(result);
                    })
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    });
}


//Both parties will call this after verification and will upload their stuff, and receive each others stuff in the response
async function sendJournalsToServer(code) {
    return new Promise((resolve, reject) => {
        const journalIO = require('../io/journal-io');
        const journals = journalIO.getAllEncryptedJournals();
        const payload = {
            code: code,
            journals: journals
        }
        axios.post('http://localhost:8080/sendJournals', JSON.stringify(payload))
            .then((result) => {
                //We should now wait for a response containing all of the journals from the other device. The result will be what we want.
                resolve(result);
            })
            .catch(function (error) {
                console.log(error);
            });
    });
}

module.exports = {
    alphaConnectionPartOne,
    alphaConnectionPartTwo,
    betaConnection
}