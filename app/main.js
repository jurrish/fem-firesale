const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

//create a window for global scope.
let mainWindow = null;

//export this method so we can pull it in from the main process in our renderer
const getFileFromUserSelection = module.exports.getFileFromUserSelection = () => {
  //asks to open files. returns an array of paths for files they selected
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt', 'text'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] },
    ]
  });

  //if user presses cancel, we get undefined(a falsey avue) for files
  if(!files) return;

  const file = files[0];
  const content = fs.readFileSync(file).toString();

  //send the data we read in to a renderer, now we setup a listener inside the renderer! (IPC renderer module!)
  mainWindow.webContents.send('file-opened', file, content);
};

app.on('ready', () => {
  mainWindow = new BrowserWindow({ show: false });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  //releases window from memory when it's closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
