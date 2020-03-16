/// <reference types='@altv/types'/>
import * as alt from 'alt-client'
import game from 'natives'
import chat from 'chat'
import * as util from './util'

let npcs = {}

alt.onServer('npc:spawn', async (npc) => {
  let model = alt.hash(npc.model)
  game.requestModel(model)
  await util.repeatUntil(()=> game.hasModelLoaded(model))
  npc.handle = game.createPed(0, model, npc.pos.x, npc.pos.y, npc.pos.z, npc.rot, false, true)
  npcs[npc.id] = npc
  chat.pushLine(`npc:spawn: ${JSON.stringify(npc)}`)
})

alt.on('syncedMetaChange', (entity, key, npc)=> {
  if (entity == alt.Player.local) return
  // entity.type = 0 = player
  if (!key.startsWith('npc:') || entity.type != 0 ) return

  // update ped info
  if (npcs[npc.id]) {
    // copy npc data and keep npc.handle
    for (let prop in npc) {
      npcs[npc.id][prop] = npc[prop]
    }
    chat.pushLine('ped update: '+JSON.stringify(npcs[npc.id]))

    applyNPCProps(npcs[npc.id])
  }
})

function applyNPCProps(npc) {
  // game.setEntityHeading(npc.handle, npc.rot)
  // ease rotating ped instead of the above
  let angledPos = util.inFrontOf(npc.pos, npc.rot, 5)
  game.taskTurnPedToFaceCoord(npc.handle, angledPos.x, angledPos.y, angledPos.z, 0)
  // update position, tasks, etc
}

// cleanup the world
alt.on('disconnect', ()=> {
  for (let id in npcs)
    game.deletePed(npcs[id].handle)
})



// ******** for debug
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