const target = require('./target')
const route = require('./route')

module.exports = {
  postTarget: target.postTarget,
  getAllTargets: target.getAllTargets,
  getTarget: target.getTarget,
  updateTarget: target.updateTarget,
  route: route.route
}
