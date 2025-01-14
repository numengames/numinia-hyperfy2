import { css } from '@firebolt-dev/css'
import { useEffect, useRef, useState } from 'react'
import { BoxIcon, EyeIcon, FileCode2Icon, XIcon } from 'lucide-react'

import { hashFile } from '../../core/utils-client'
import { usePane } from './usePane'

export function InspectPane({ world, entity }) {
  if (entity.isApp) {
    return <AppPane world={world} app={entity} />
  }
  if (entity.isPlayer) {
    return <PlayerPane world={world} player={entity} />
  }
}

export function AppPane({ world, app }) {
  const paneRef = useRef()
  const headRef = useRef()
  usePane('inspect', paneRef, headRef)
  useEffect(() => {
    window.app = app
  }, [])
  const changeModel = async e => {
    const blueprint = app.blueprint
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.glb')) return
    // immutable hash the file
    const hash = await hashFile(file)
    // use hash as glb filename
    const filename = `${hash}.glb`
    // canonical url to this file
    const url = `asset://${filename}`
    // cache file locally so this client can insta-load it
    world.loader.insert('glb', url, file)
    // update blueprint locally (also rebuilds apps)
    const version = blueprint.version + 1
    world.blueprints.modify({ id: blueprint.id, version, model: url })
    // upload model
    await world.network.upload(file)
    // broadcast blueprint change to server + other clients
    world.network.send('blueprintModified', { id: blueprint.id, version, model: url })
  }
  const name = app.blueprint.name || ''
  const desc = app.blueprint.desc || ''
  return (
    <div
      ref={paneRef}
      className='apane'
      css={css`
        position: absolute;
        top: 20px;
        left: 20px;
        width: 320px;
        height: 450px;
        background: rgba(22, 22, 28, 1);
        border: 1px solid rgba(255, 255, 255, 0.03);
        border-radius: 10px;
        box-shadow: rgba(0, 0, 0, 0.5) 0px 10px 30px;
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        .apane-head {
          height: 40px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          padding: 0 0 0 10px;
          &-title {
            padding-left: 7px;
            font-weight: 500;
            flex: 1;
          }
          &-close {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }
        }
        .apane-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }
        .apane-info {
          display: flex;
          margin: 0 0 10px;
        }
        .apane-info-main {
          flex: 1;
        }
        .apane-info-name {
          display: block;
          flex: 1;
          height: 36px;
          background: #252630;
          border-radius: 10px;
          margin: 0 0 10px;
          padding: 0 10px;
          input {
            height: 36px;
            font-size: 14px;
          }
        }
        .apane-info-desc {
          display: block;
          flex: 1;
          min-height: 43px;
          background: #252630;
          border-radius: 10px;
          textarea {
            padding: 10px 10px 0 10px;
            min-height: 43px;
            min-width: 100%;
            max-width: 100%;
            font-size: 14px;
          }
        }
        .apane-info-icon {
          width: 88px;
          height: 88px;
          background: #252630;
          border-radius: 10px;
          margin-left: 10px;
        }
        .apane-dbl {
          display: flex;
          margin: -5px;
          &-item {
            flex-basis: 50%;
            padding: 5px;
          }
        }
        .apane-model {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #252630;
          border-radius: 10px;
          margin: 0 0 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 85px;
          overflow: hidden;
          cursor: pointer;
          &-icon {
            line-height: 0;
            margin: 0 0 4px;
          }
          span {
            font-size: 14px;
          }
          input {
            position: absolute;
            top: -9999px;
            left: -9999px;
          }
        }
        .apane-script {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #252630;
          border-radius: 10px;
          margin: 0 0 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 85px;
          cursor: pointer;
          &-icon {
            line-height: 0;
            margin: 0 0 4px;
          }
          span {
            font-size: 14px;
          }
        }
      `}
    >
      <div className='apane-head' ref={headRef}>
        <EyeIcon size={20} />
        <div className='apane-head-title'>Inspect</div>
        <div className='apane-head-close' onClick={() => world.emit('inspect', null)}>
          <XIcon size={20} />
        </div>
      </div>
      <div className='apane-content noscrollbar'>
        <div className='apane-dbl'>
          <div className='apane-dbl-item'>
            <label className='apane-model'>
              <input type='file' accept='.glb' onChange={changeModel} />
              <div className='apane-model-icon'>
                <BoxIcon size={20} />
              </div>
              <span>Model</span>
            </label>
          </div>
          <div className='apane-dbl-item'>
            <div className='apane-script' onClick={() => world.emit('code', app)}>
              <div className='apane-script-icon'>
                <FileCode2Icon size={20} />
              </div>
              <span>Script</span>
            </div>
          </div>
        </div>
        {/* <div className='apane-info'>
          <div className='apane-info-main'>
            <label className='apane-info-name'>
              <input type='text' value={name} onChange={e => setName(e.target.value)} placeholder='Name' />
            </label>
            <label className='apane-info-desc'>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder='Description' />
            </label>
          </div>
          <div className='apane-info-icon' />
        </div> */}
      </div>
    </div>
  )
}

function PlayerPane({ world, player }) {
  return <div>PLAYER INSPECT</div>
}
