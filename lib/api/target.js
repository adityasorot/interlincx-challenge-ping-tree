const targets = require('../targets')

module.exports = {
  postTarget,
  getAllTargets,
  getTarget,
  updateTarget
}

function postTarget (req, res) {
  const chunks = []
  let body = ''
  req.on('data', chunk => chunks.push(chunk))
  req.on('end', () => {
    const data = Buffer.concat(chunks)
    body = JSON.parse(data.toString())
    targets.addTarget(body, req, res)
  })
}

function getAllTargets (req, res) {
  targets.getAllTargets(req, res)
}

function getTarget (req, res, id) {
  targets.getTarget(req, res, id)
}

function updateTarget (req, res, id) {
  const chunks = []
  let body = ''
  req.on('data', chunk => chunks.push(chunk))
  req.on('end', () => {
    const data = Buffer.concat(chunks)
    body = JSON.parse(data.toString())
    body.id = id
    targets.updateTarget(body, req, res)
  })
}
