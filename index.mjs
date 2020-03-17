import alt from 'alt-server'
import { forEachInRange } from './util'
import chat from 'chat'

let npcs = {}
export class npc {
  constructor(model, pos, rot, controllerID) {
    this.id = npc.generateID()
    this.model = model
    this.pos = {
      x: Number(pos.x.toFixed(4)),
      y: Number(pos.y.toFixed(4)),
      z: Number(pos.z.toFixed(4))
    }
    this.rot = rot
    this.controllerID = controllerID
    
    forEachInRange(pos, 500, player => {
      alt.emitClient(player, 'npc:spawn', this)
    })
    return npcs[this.id] = this
  }

  static generateID() {
    for (let id = 0; ; id++)
      if (!npcs[id])
        return id
  }
}

alt.onClient('npc:update', (player, _npc) => {
  let ped = npcs[_npc.id]
  if (ped) {
    Object.assign(ped, _npc)

    forEachInRange(ped.pos, 500, _player=> {
      if (player.id != _player.id) {
        alt.emitClient(_player, 'npc:update', _npc)
      }
    })
  }
})

chat.registerCmd('ped', (player)=> {
  let pos = player.pos
  let ent = new npc('player_one', pos, 0, player.id)
})
