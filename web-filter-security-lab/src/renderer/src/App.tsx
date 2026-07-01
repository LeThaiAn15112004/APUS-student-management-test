import { useState } from 'react'
import Versions from './components/Versions'
import CspLab from './components/csp-lab/CspLab'
import electronLogo from './assets/electron.svg'

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function App(): React.JSX.Element {
  const [outputResult, setOutputResult] = useState<string>('')
  const [isError, setIsError] = useState<boolean>(false)
  const [isBadModalOpen, setIsBadModalOpen] = useState<boolean>(false)
  const [badChannel, setBadChannel] = useState<string>('danger:delete-all-data')
  const [badPayload, setBadPayload] = useState<string>(
    '{"reason":"generic send(channel, payload) lets Renderer choose any Main channel"}'
  )

  const badBridgePresets = [
    {
      label: 'Delete data',
      channel: 'danger:delete-all-data',
      payload: '{"table":"students","confirmedByRenderer":true}'
    },
    {
      label: 'Set admin',
      channel: 'auth:set-role',
      payload: '{"userId":"guest","role":"admin"}'
    },
    {
      label: 'Disable filter',
      channel: 'webfilter:disable',
      payload: '{"disabled":true,"reason":"bypass from renderer"}'
    },
    {
      label: 'Write settings',
      channel: 'settings:write',
      payload: '{"key":"security.contextIsolation","value":false}'
    },
    {
      label: 'Run command',
      channel: 'debug:run-command',
      payload: '{"command":"whoami"}'
    }
  ]

  const ipcHandle = (): void => {
    try {
      console.log('[Renderer/F12] Dang thu goi window.electron.ipcRenderer.send("ping")')

      if (!window.electron) {
        throw new Error('window.electron la undefined! (Do BAT Context Isolation)')
      }

      window.electron.ipcRenderer.send('ping')
      console.log('[Renderer/F12] Gui IPC ping thanh cong')
    } catch (err: unknown) {
      console.error('[Renderer/F12] Loi IPC:', err)
      setOutputResult(`Loi IPC: ${getErrorMessage(err)}`)
      setIsError(true)
    }
  }

  const handleReadFile = (): void => {
    try {
      console.log('[Renderer/F12] Dang thu goi window.api.readFile(...)')

      if (!window.api) {
        throw new Error(
          'window.api la undefined! Khong the goi ham doc file tu Renderer (Do BAT Context Isolation va khong dung contextBridge).'
        )
      }

      const path =
        'C:/Users/ADMIN/Documents/GitHub/APUS-code-demo-test/web-filter-security-lab/package.json'
      const content = window.api.readFile(path)

      console.log('[Renderer/F12] Doc file thanh cong:', {
        path,
        length: content.length
      })

      setOutputResult(content)
      setIsError(false)
    } catch (err: unknown) {
      console.error('[Renderer/F12] Loi doc file:', getErrorMessage(err))
      setOutputResult(getErrorMessage(err))
      setIsError(true)
    }
  }

  const handleBadBridgeDemo = (): void => {
    setIsBadModalOpen(true)
  }

  const parseBadPayload = (): unknown => {
    try {
      return JSON.parse(badPayload)
    } catch {
      return badPayload
    }
  }

  const sendBadBridgeMessage = (): void => {
    try {
      console.warn(
        `[Renderer/F12] BAD demo: Renderer dang tu chon channel "${badChannel}" de gui sang Main`
      )

      const payload = parseBadPayload()
      window.badAPI.send(badChannel, payload)

      setOutputResult(
        `BAD bridge da gui channel "${badChannel}". Hay xem terminal npm run dev de thay Main nhan payload.`
      )
      setIsError(false)
      setIsBadModalOpen(false)
    } catch (err: unknown) {
      console.error('[Renderer/F12] Loi bad bridge demo:', err)
      setOutputResult(getErrorMessage(err))
      setIsError(true)
    }
  }

  const handleSafeBridgeDemo = (): void => {
    try {
      console.log(
        '[Renderer/F12] SAFE demo: Renderer chi goi duoc safeAPI.ping(), khong truyen channel tuy y'
      )
      window.safeAPI.ping()
      setOutputResult('SAFE bridge chi expose ham ping(). Renderer khong duoc chon channel tuy y.')
      setIsError(false)
    } catch (err: unknown) {
      console.error('[Renderer/F12] Loi safe bridge demo:', err)
      setOutputResult(getErrorMessage(err))
      setIsError(true)
    }
  }

  const handleSafeProfileDemo = async (): Promise<void> => {
    try {
      const result = await window.userAPI.updateProfile({
        displayName: 'Demo User',
        bio: 'Renderer chi gui y dinh cap nhat profile.',
        themeColor: 'green'
      })

      setOutputResult(JSON.stringify(result, null, 2))
      setIsError(false)
    } catch (err: unknown) {
      setOutputResult(getErrorMessage(err))
      setIsError(true)
    }
  }

  const handleRejectedProfileDemo = async (): Promise<void> => {
    try {
      const unsafePayload = {
        displayName: 'A',
        bio: 'x'.repeat(140),
        themeColor: 'admin-red',
        role: 'admin',
        writePath: 'C:/Windows/System32/config'
      } as never

      await window.userAPI.updateProfile(unsafePayload)
      setOutputResult('Unexpected: Main accepted invalid profile payload.')
      setIsError(false)
    } catch (err: unknown) {
      setOutputResult(`Main rejected invalid Renderer payload: ${getErrorMessage(err)}`)
      setIsError(true)
    }
  }

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '45px 0',
        boxSizing: 'border-box'
      }}
    >
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>

      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>

      <div className="actions">
        <div className="action">
          <a onClick={handleReadFile}>Read package.json</a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
        <div className="action">
          <a onClick={handleBadBridgeDemo}>Bad bridge demo</a>
        </div>
        <div className="action">
          <a onClick={handleSafeBridgeDemo}>Safe bridge demo</a>
        </div>
        <div className="action">
          <a onClick={handleSafeProfileDemo}>Safe profile IPC</a>
        </div>
        <div className="action">
          <a onClick={handleRejectedProfileDemo}>Rejected profile IPC</a>
        </div>
      </div>

      <CspLab />

      {isBadModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsBadModalOpen(false)}>
          <div className="bad-bridge-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Bad bridge: generic send(channel, payload)</h2>
                <p>Renderer can choose any Main process channel.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setIsBadModalOpen(false)}
              >
                X
              </button>
            </div>

            <div className="preset-row">
              {badBridgePresets.map((preset) => (
                <button
                  key={preset.channel}
                  type="button"
                  onClick={() => {
                    setBadChannel(preset.channel)
                    setBadPayload(preset.payload)
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <label className="modal-field">
              <span>Channel</span>
              <input value={badChannel} onChange={(event) => setBadChannel(event.target.value)} />
            </label>

            <label className="modal-field">
              <span>Payload</span>
              <textarea
                value={badPayload}
                rows={6}
                onChange={(event) => setBadPayload(event.target.value)}
              />
            </label>

            <div className="modal-actions">
              <button type="button" onClick={() => setIsBadModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="danger-button" onClick={sendBadBridgeMessage}>
                Send arbitrary IPC
              </button>
            </div>
          </div>
        </div>
      )}

      {outputResult && (
        <div
          style={{
            marginTop: '20px',
            textAlign: 'left',
            background: isError ? '#2c1f1f' : '#2f343f',
            border: `1px solid ${isError ? '#ff6b6b' : '#61dafb'}`,
            padding: '15px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            margin: '20px auto',
            overflowX: 'auto'
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', color: isError ? '#ff6b6b' : '#61dafb' }}>
            {isError ? 'LOI XAY RA:' : 'KET QUA DOC FILE:'}
          </h3>
          <textarea
            readOnly
            value={outputResult}
            rows={10}
            style={{
              width: '100%',
              background: 'transparent',
              color: isError ? '#ff8b8b' : '#abb2bf',
              border: 'none',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          />
        </div>
      )}

      <Versions></Versions>
    </div>
  )
}

export default App
