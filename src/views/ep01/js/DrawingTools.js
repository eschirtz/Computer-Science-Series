function drawHill (canvas, heights, options) {
  /* eslint-disable no-mixed-operators */
  // Setup
  const context = canvas.getContext('2d')
  const spacing = (options.width / (heights.length - 1))
  const x = options.x - options.width / 2
  const y = options.y
  // Draw
  context.beginPath()
  context.moveTo(x, y)
  for (let i = 0; i < heights.length; i += 1) {
    context.lineTo(x + i * spacing, y + heights[i] * options.height)
  }
  context.lineTo(x + (heights.length - 1) * spacing, y)
  context.lineTo(x, y)
  context.fillStyle = options.color
  context.fill()
  /* eslint-enable no-mixed-operators */
}

function drawBall (canvas, s, ss, options) {
  // Setup
  const spacing = options.width / (ss.scores.length - 1)
  const x = options.x - (canvas.width / 2)
  const y = options.y
  const radius = options.radius
  const context = canvas.getContext('2d')
  context.beginPath()
  context.arc(x + (spacing * s.coords[0]),
    y + (ss.scores[s.coords[0]] * options.height),
    radius, 0, 2 * Math.PI)
  context.lineWidth = options.lineWidth || 12
  context.strokeStyle = options.secondaryColor || 'gray'
  context.stroke()
  context.fillStyle = options.primaryColor || 'darkgray'
  context.fill()
}

/* eslint-disable import/prefer-default-export */
export {
  drawHill,
  drawBall
}
/* eslint-enable import/prefer-default-export */
