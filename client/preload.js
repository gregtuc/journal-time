const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
try {
    contextBridge.exposeInMainWorld(
        "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["toGetJournalsExist", "toDeleteAllJournals", "toSaveExistingJournal", "toSaveNewJournal", "toGetAllJournals", "toSavePassword"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = ["fromGetJournalsExist", "fromGetAllJournals"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
    );
} catch (error) {

}
