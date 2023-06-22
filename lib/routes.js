const sendJson = require('send-data/json')
const redis = require('./redis')

module.exports = {
  getRoute
}

function getRoute (req, res, body) {
  const hour = body.timestamp.split('T')[1].split(':')[0]
  redis.zrevrange(`${body.geoState}:${hour}`, 0, -1, function (err, result) {
    if (err) {
      sendJson(req, res, { error: err })
      return
    }
    if (result.length === 0) {
      sendJson(req, res, { decision: 'reject' })
      return
    }
    redis.hgetall(result[0], function (err, result) {
      if (err) {
        sendJson(req, res, { error: err })
        return
      }
      if (!result) {
        sendJson(req, res, { error: 'Some internal error occured. Target data not found.' })
        return
      }
      result.accept = Number(result.accept) - 1
      redis.hmset(`target:${result.id}`, result)
      if (result.accept === 0) {
        result.geoState.split(',').forEach(geo => {
          result.hour.split(',').forEach(hour => {
            redis.zrem(`${geo}:${hour}`, `target:${result.id}`)
          })
        })
        redis.del(`target:${result.id}`)
        redis.srem('targets', result.id)
      }
      sendJson(req, res, { decision: result.url })
    })
  })
}
