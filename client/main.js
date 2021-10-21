// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const journalIO = require('./io/journal-io');
const pairer = require('./pairing/pairing');
const sentimentDetector = require('./sentiment/sentimentDetector');

function createWindow() {

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  ipcMain.on("toGetJournalsExist", (event, args) => {
    result = journalIO.journalsExist();
    mainWindow.webContents.send("fromGetJournalsExist", result);
  });
  ipcMain.on("toDeleteAllJournals", (event, args) => {
    journalIO.deleteAllJournals();
  });
  ipcMain.on("toSaveExistingJournal", (event, args) => {
    journalIO.saveExistingJournal(args.data.uuid, args.data.title, args.data.body)
  });
  ipcMain.on("toSaveNewJournal", (event, args) => {
    journalIO.saveNewJournal(args.data.title, args.data.body)
  });
  ipcMain.on("toGetAllJournals", (event, args) => {
    result = journalIO.getAllJournals();
    mainWindow.webContents.send("fromGetAllJournals", result);
  });
  ipcMain.on("toSavePassword", (event, args) => {
    process.env.PASSWORD = args.data;
  });
  ipcMain.on("toGetSentiment", (event, args) => {
    var result = sentimentDetector.getSentiment(args.data.body);
    mainWindow.webContents.send("fromGetSentiment", result);
  });
  ipcMain.on("toPairDevices", (event, args) => {
    if (args.data.type == true) {
      pairer.alphaConnectionPartOne().then(result => {
        //Here I can send the code back to the renderer to display.
        mainWindow.webContents.send("fromPairDevices", result);
        pairer.alphaConnectionPartTwo(result).then(result => {
          //This will only be reached once the code was matched.
          //Log and then Save the new Journals.
          console.log(result);
          for (var i = 0; i < result.journals.length; i++) {
            journalIO.saveNewJournalFromPairing(result.journals[i].title, result.journals[i].body, result.journals[i].datetime);
          }
        })
      })
    } else {
      var code = args.data;
      pairer.betaConnection(code).then(result => {
        //This will only be reached once the code was matched.
        //Log and then Save the new Journals.
        console.log(result);
        for (var i = 0; i < result.journals.length; i++) {
          journalIO.saveNewJournalFromPairing(result.journals[i].title, result.journals[i].body, result.journals[i].datetime);
        }
      })
    }
    //mainWindow.webContents.send("fromPairDevices", result);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
