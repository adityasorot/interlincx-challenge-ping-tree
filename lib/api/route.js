const routes = require('../routes')

module.exports = {
  route
}

function route (req, res) {
  const chunks = []
  let body = ''
  req.on('data', chunk => chunks.push(chunk))
  req.on('end', () => {
    const data = Buffer.concat(chunks)
    body = JSON.parse(data.toString())
    routes.getRoute(req, res, body)
  })
}
