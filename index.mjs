import alt from 'alt-server'
import { distance, forEachInRange } from './util'
import chat from 'chat'

let npcs = {}
class npc {
  constructor(model, pos = {x:20}, rot, controllerID) {
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
      if (player.id == controllerID) {
        player.setSyncedMeta('npc:'+this.id, ent)
      }
      alt.emitClient(player, 'npc:spawn', this)
    })
    return npcs[this.id] = this
  }

  static generateID() {
    let str = ''
    for (let i = 0; i < 5; i++)
      str += String.fromCharCode(Math.floor(Math.random() * (125 - 64) + 64))
    return str
  }
}

chat.registerCmd('ped', (player)=> {
  let pos = player.pos
  let ent = new npc('player_one', pos, 0, player.id)
  console.log(ent.model, ent.id)
})
