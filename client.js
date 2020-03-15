/// <reference types='@altv/types'/>
import * as alt from 'alt-client'
import game from 'natives'
import chat from 'chat'

let npcs = {}

alt.onServer('npc:spawn', (npc) => {
  npcs[npc.id] = npc
  chat.pushLine(`npc:spawn: ${JSON.stringify(npc)}`)
})
