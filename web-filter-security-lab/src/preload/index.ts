import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { IMyAPI } from './index.d'

const api: IMyAPI = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  readFile: (path) => require('fs').readFileSync(path, 'utf-8')
}

// ❌ BAD API - Mất an toàn
const badAPI = {
  send: (channel, payload) => ipcRenderer.send(channel, payload)
  // RỦI RO: Renderer có thể gửi bất kỳ channel nào, 
  // dễ bị tấn công khai thác IPC.
}

// ✅ SAFE API - Bảo mật
const safeAPI = {
  ping: () => ipcRenderer.send('ping')
  // AN TOÀN: Renderer chỉ được gọi đúng hàm 'ping'.
  // Kiểm soát chặt chẽ đầu vào.
}

const userAPI = {
  updateProfile: (profile) => ipcRenderer.invoke('user:update-profile', profile)
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
  contextBridge.exposeInMainWorld('badAPI', badAPI)
  contextBridge.exposeInMainWorld('safeAPI', safeAPI)
  contextBridge.exposeInMainWorld('userAPI', userAPI)

  contextBridge.exposeInMainWorld('isolationDemo', {
    status: 'Renderer nhan API thong qua contextBridge',
    isIsolated: true
  })
} else {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.electron = electronAPI
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.api = api
}
