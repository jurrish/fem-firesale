const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

//create a window for global scope.
let newWindow = null;
//for multiple windows. when would we need new windows? on load? nah.
const windows = new Set();

const createWindow = exports.createWindow = () => {
  let newWindow = new BrowserWindow({ show: false });
  windows.add(newWindow);

  newWindow.loadURL(`file://${__dirname}/index.html`);

  newWindow.once('ready-to-show', () => {
    newWindow.show();
  });

  newWindow.on('close', (event) => {
    if(newWindow.isDocumentEdited()) {
      event.preventDefault();
      const result = dialog.showMessageBox(newWindow, {
        type: 'warning',
        title: 'Quit with Unsaved Changes?',
        message: 'Your changes will be lost if you do not save first',
        buttons: [
          'Quit Anyway',
          'Cancel'
        ],
        defaultId: 0,
        cancelId: 1
      });

      if(result === 0) newWindow.destroy();
    }
  });

  //releases window from memory when it's closed
  newWindow.on('closed', () => {
    //remove newWindow from the set
    windows.delete(newWindow);
    newWindow = null;
  });
};

//export this method so we can pull it in from the main process in our renderer
const getFileFromUserSelection = module.exports.getFileFromUserSelection = (targetWindow) => {
  //asks to open files. returns an array of paths for files they selected
  const files = dialog.showOpenDialog(targetWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt', 'text'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] },
    ]
  });

  //if user presses cancel, we get undefined(a falsey avue) for files
  if(!files) return;

  return files[0];
};

const openFile = exports.openFile = (targetWindow, filePath) => {
  //if filePath is falsy, do this other thing
  const file = filePath || getFileFromUserSelection(targetWindow);
  const content = fs.readFileSync(file).toString();
  //send the data we read in to a renderer, now we setup a listener inside the renderer! (IPC renderer module!)
  targetWindow.webContents.send('file-opened', file, content);
  //set the browser window name when it's created.
  targetWindow.setTitle(`${file} - Fire Sale`);
  //set representative file
  targetWindow.setRepresentedFilename(file);
};

app.on('ready', () => {
  createWindow();
});
