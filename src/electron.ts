import { app, Menu, Tray } from 'electron'
import opener from 'opener'
import { openDashboardInBrowser } from './browser'
import { runLauncher } from './launcher'
import { BeeManager } from './lifecycle'
import { createNotification } from './notify'
import { getAssetPath, paths } from './path'

let tray: Tray

export function rebuildElectronTray() {
  if (!tray) {
    return
  }
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Web UI',
      click: openDashboardInBrowser,
    },
    { type: 'separator' },
    {
      label: BeeManager.isRunning() ? 'Stop Bee' : 'Start Bee',
      click: () => {
        if (BeeManager.isRunning()) {
          BeeManager.stop()
        } else {
          runLauncher()
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Logs',
      click: async () => {
        opener(paths.log)
      },
    },
    {
      label: 'Quit',
      click: async () => {
        BeeManager.stop()
        await BeeManager.waitForSigtermToFinish()
        app.quit()
      },
    },
  ])
  tray.setContextMenu(contextMenu)
}

export function runElectronTray() {
  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', () => {
      createNotification('Swarm is already running. Please close the previous instance first.')
    })
  }

  app.whenReady().then(() => {
    if (app.dock) {
      app.dock.setIcon(getAssetPath('icon.png'))
      app.dock.hide()
    }
    tray = new Tray(getAssetPath('trayTemplate.png'))
    rebuildElectronTray()
  })
}
