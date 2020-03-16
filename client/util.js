import alt from 'alt-client'
import game from 'natives'

export function inFrontOf(pos, heading, dist) {
  pos = Object.assign({}, pos) // copy pos
  heading *= Math.PI / 180
  pos.x += (dist * Math.sin(-heading))
  pos.y += (dist * Math.cos(-heading))
  return pos
}

export function notify(txt, color = 2, blink = false) {
  game.beginTextCommandThefeedPost("CELL_EMAIL_BCON")
  game.addTextComponentSubstringPlayerName(txt)
  game.thefeedSetNextPostBackgroundColor(color)
  game.endTextCommandThefeedPostTicker(blink, false)
}

alt.onServer('notify', (...args) => notify(...args))

export function drawText(text, x,y, scale, fontType, r, g, b, a, useOutline = true, useDropShadow = true) {
  game.setTextFont(fontType)
  game.setTextProportional(false)
  game.setTextScale(scale, scale)
  game.setTextColour(r, g, b, a)
  game.setTextEdge(2, 0, 0, 0, 150)
  if (useDropShadow) {
    game.setTextDropshadow(0, 0, 0, 0, 255)
    game.setTextDropShadow()
  }
  if (useOutline)
    game.setTextOutline()

  game.setTextCentre(true)
  //game.setTextJustification(0)
  //game.setTextWrap(0.0, 1.0)

  game.beginTextCommandDisplayText("CELL_EMAIL_BCON")
  //Split text into pieces of max 99 chars blocks
  text.match(/.{1,99}/g).forEach(textBlock => {
    game.addTextComponentSubstringPlayerName(textBlock)
  })
  game.endTextCommandDisplayText(x, y, 0.0)
}

export function repeatUntil(fn) {
  return new Promise((resolve, reject) => {
    let interval = alt.setInterval(()=> {
      let result = fn()
      if (result) {
        alt.clearInterval(interval)
        resolve(result)
      }
    }, 500)
  })
}