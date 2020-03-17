/// <reference types='@altv/types'/>
import * as alt from 'alt-client'
import game from 'natives'
import chat from 'chat'
import * as util from './util'

let localPlayer = alt.Player.local
let debug = true

let npcs = {}

class npc {
  constructor(id, model, pos, rot, controllerID, task) {
    Object.assign(this, {id, model, pos, rot, controllerID, task})
    model = alt.hash(model)
    alt.loadModel(model)
    this.handle = game.createPed(0, model, pos.x, pos.y, pos.z, rot, false, true)
    npcs[id] = this
  }

  sendToServer() {
    alt.emitServer('npc:update', {id: this.id, pos: this.pos, rot: this.rot})
  }

  setRot(rot) {
    game.setEntityHeading(this.handle, rot)
  }

  setPos(pos) {
    game.setEntityCoords(this.handle, pos.x, pos.y, pos.z, false, false, false, false)
  }

  easeRotation(rot) {
    let angledPos = util.inFrontOf(this.pos, rot, 5)
    game.taskTurnPedToFaceCoord(this.handle, angledPos.x, angledPos.y, angledPos.z, 0)
  }

  walkTo(pos, rot) {
    game.taskGoStraightToCoord(this.handle, pos.x, pos.y, pos.z, 1, -1, rot, 0)
  }

  destroy(streamOut) {
    delete npcs[this.id]
    game.deletePed(this.handle)
    /* if (streamOut) {
      // streamOut == true when ped is too far (checked for every tick) 
      // change streamer of the ped
      alt.emitServer ...
    } */
  }
}

alt.onServer('npc:spawn', _npc => {
  let ped = new npc(_npc.id, _npc.model, _npc.pos, _npc.rot, _npc.controllerID)
  debugText('npc:spawn '+JSON.stringify(ped))
})

alt.onServer('npc:update', _npc=> {
  let ped = npcs[_npc.id]
  if (ped) {
    Object.assign(ped, _npc)
    ped.walkTo(ped.pos, ped.rot)
    debugText('npc:update: ' +JSON.stringify(npcs[_npc.id]))
  }
})

alt.setInterval(()=> {
  for (let id in npcs) {
    let ped = npcs[id]
    if (ped.controllerID == localPlayer.id) {
      let p1 = game.getEntityCoords(ped.handle, false)
      let p2 = ped.pos
      let d = game.getDistanceBetweenCoords(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, true)
      if (d >= 0.1) {
        ped.pos = p1
        ped.rot = game.getEntityHeading(ped.rot)
        ped.sendToServer()
      }
    }
  }
}, 250)

// cleanup the world
alt.on('disconnect', ()=> {
  for (let id in npcs)
    npcs[id].destroy()
})



// ******** for debug
function debugText(str) {
  chat.pushLine(str+'')
}


alt.on('keydown', key=> {
  // H
  if (key == 72 ) {
    chat.pushMessage('npcs', JSON.stringify(npcs))
  }
  // O
  if (key == 79 ) {
    let ped = npcs[Object.keys(npcs)[0]].handle
    game.taskWanderStandard(ped, 10,10)
    chat.pushLine(`setTaskWander ped ${ped}`)
  }
  // L
  if (key == 76 ) {
    let ped = npcs[Object.keys(npcs)[0]].handle
    game.clearPedTasks(ped)
    chat.pushLine(`clearPedTasks ped ${ped}`)
  }
})

alt.setInterval(()=> {
  if (!debug) return
  let p = alt.Player.local.pos
  if (!Object.keys(npcs)[0]) return
  let firstPed = npcs[Object.keys(npcs)[0]].handle
  util.drawText('isPedWalking: '+game.isPedWalking(firstPed), 0.5, 0.025, 0.5, 0, 255,255,255,255)
  // let p2 = {x:0,y:0,z:71}
  let p2 = game.getEntityCoords(firstPed, false)
  let d = game.getDistanceBetweenCoords(p.x,p.y,p.z, p2.x,p2.y,p2.z, true)
  d = d.toFixed(4)
  util.drawText('distance: '+d, 0.5, 0.05, 0.5, 0, 255,255,255,255)
}, 0)