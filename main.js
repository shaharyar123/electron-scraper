const {app, BrowserWindow} = require('electron')
require('electron-debug')({showDevTools: false, enabled: true});

const path = require('path')
const url = require('url')

let win

function createWindow () {
  win = new BrowserWindow({width: 1200, height: 600,  title: "Makhtutaat"})

  // load the dist folder from Angular
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools optionally:
  // win.webContents.openDevTools()

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
