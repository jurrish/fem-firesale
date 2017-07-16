const marked = require('marked');
const { remote, ipcRenderer } = require('electron');
//import everything from our main process
//we could destructure here if we wanted to get different methods from mainProcess
const mainProcess = remote.require('./main');
const currentWindow = remote.getCurrentWindow();

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');

//this function takes whatever we write in our markdown editor and uses "marked" to render it to html
const renderMarkdownToHtml = (markdown) => {
  //grab our #html element and put this to the innerHtml property.
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

markdownView.addEventListener('keyup', (event) => {
  renderMarkdownToHtml(event.target.value);
  //on keyup, if our currentWindow was edited, we get visual cue
  currentWindow.setDocumentEdited(true);
});

newFileButton.addEventListener('click', () => {
  mainProcess.createWindow();
});

//use remote module to communicate between main and renderer
//we can openFile now, even though it's a main process!
openFileButton.addEventListener('click', () => {
  //this? or currentWindow? i think "this" would be in reference to the global window object, not necessarily the window instance being used.
  mainProcess.openFile(currentWindow);
});

//whenever we get a message from the "file-opened" CHANNEL, (what was sent from our main process), do this stuff.
//the event object is what we're working with first (from the main channel), then the file and contents!
ipcRenderer.on('file-opened', (event, file, content) => {
  markdownView.value = content;
  renderMarkdownToHtml(content);
});
