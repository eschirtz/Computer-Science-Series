function getDistance (a, b) {
  return Math.sqrt(
    ((a.x - b.x) ** 2) + ((a.y - b.y) ** 2))
}

function getAveragePos (bucket) {
  const length = bucket.length
  let xSum = 0
  let ySum = 0
  for (let i = 0; i < length; i += 1) {
    xSum += bucket[i].x
    ySum += bucket[i].y
  }
  return {
    x: xSum / length,
    y: ySum / length
  }
}
/*
function getGroupedDistribution (width, height, numPoints, numGroups) {
  const points = []
  const groups = []
  const PADDING = 500 // pixel padding amount
  for (let i = 0; i < numGroups; i += 1) {
    groups.push({
      x: (Math.random() * (width - (2 * PADDING))) + (PADDING / 2),
      y: (Math.random() * (height - (2 * PADDING))) + (PADDING / 2)
    })
  }
  for (let i = 0; i < numPoints; i += 1) {
    const currGroup = Math.floor(Math.random() * numGroups)
    points.push(
      {
        x: groups[currGroup].x + ((PADDING * Math.random()) - 1),
        y: groups[currGroup].y + ((PADDING * Math.random()) - 1)
      }
    )
  }
  return points
}

*/

function getGroupedDistribution (width, height, numPoints, numGroups) {
  const points = []
  const groups = []
  const PADDING = 100
  let xDistr = 100
  let yDistr = 100

  let tempX, tempY
  for (let i = 0; i < numGroups; i += 1) {
    xDistr = 100 * (Math.random() + 1)
    yDistr = 100 * (Math.random() + 1)
    groups.push(
      {
	x: (Math.random() * (width - PADDING)),
	y: (Math.random() * (height - PADDING))
      }
    )
    for (let j = 0; j < numPoints; j += 1) {
      let g1 = getGauss() * xDistr
      let g2 = getGauss() * yDistr
      if (groups[i].x + g1 > width) {
        tempX = groups[i].x - g1
      } else {
	tempX = groups[i].x - g1
      }

      if (groups[i].y + g2 > height) {
	tempY = groups[i].y - g2
      } else {
	tempY = groups[i].y + g2
      }

      points.push(
        {
	x: tempX,
	y: tempY
        }
      )
    }
  }
  return points
}

function getGauss() {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt( -2.0 * Math.log( u )) * Math.cos( 2.0 * Math.PI * v)
}


export default { getDistance, getAveragePos, getGroupedDistribution }
