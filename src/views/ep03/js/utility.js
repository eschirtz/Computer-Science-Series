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
export default { getDistance, getAveragePos, getGroupedDistribution }
