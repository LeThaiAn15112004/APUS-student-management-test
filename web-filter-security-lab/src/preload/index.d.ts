import { ElectronAPI } from '@electron-toolkit/preload'

export interface IMyAPI {
  readFile: (path: string) => string
}

export interface UserProfileInput {
  displayName: string
  bio?: string
  themeColor: 'blue' | 'green' | 'purple'
}

export interface UserProfileResult {
  ok: true
  savedProfile: UserProfileInput
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: IMyAPI
    badAPI: {
      send: (channel: string, payload?: unknown) => void
    }
    safeAPI: {
      ping: () => void
    }
    userAPI: {
      updateProfile: (profile: UserProfileInput) => Promise<UserProfileResult>
    }
    isolationDemo: {
      status: string
      isIsolated: boolean
    }
  }
}
