import alt from 'alt-server'

export function forEachInRange(pos, radius, func) {
  alt.Player.all.forEach(player => {
    if (distance([pos.x, pos.y, pos.z], 
      [player.pos.x, player.pos.y, player.pos.z]) <= radius) {
      
      func(player)
    }
  }) 
}

export function distance(a, b) {
  var sum = 0
  var n
  for (n = 0; n < a.length; n++) {
    sum += Math.pow(a[n] - b[n], 2)
  }
  // sum is squared
  return Math.sqrt(sum)
}