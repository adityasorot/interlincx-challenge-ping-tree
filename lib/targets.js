const sendJson = require('send-data/json')
const redis = require('./redis')

module.exports = {
  addTarget,
  getAllTargets,
  getTarget,
  updateTarget
}

function addTarget ({
  id,
  url,
  value,
  maxAcceptsPerDay,
  accept
}, req, res) {
  redis.hgetall(`target:${id}`, function (err, result) {
    if (err) {
      sendJson(req, res, { error: err })
      return
    }
    if (result) {
      sendJson(req, res, {
        error: `Target is already added with the given id: ${id}`
      })
      return
    }
    redis.sadd('targets', id)
    redis.hmset(`target:${id}`, {
      id,
      url,
      value,
      maxAcceptsPerDay,
      accept: maxAcceptsPerDay,
      geoState: accept.geoState.$in.join(','),
      hour: accept.hour.$in.join(',')
    })
    accept.geoState.$in.forEach(geo => {
      accept.hour.$in.forEach(hour => {
        redis.zadd(`${geo}:${hour}`, value, `target:${id}`)
      })
    })
    sendJson(req, res, { success: true })
  })
}

function getAllTargets (req, res) {
  getAllTargetsHelper(function (dataList) {
    if (dataList.error) {
      sendJson(req, res, {
        error: dataList.error
      })
      return
    }
    const returnData = {
      success: true,
      data: []
    }
    if (dataList.length === 0) {
      sendJson(req, res, {
        success: true,
        message: 'No targets present'
      })
      return
    }
    dataList.forEach((data) => {
      delete data.accept
      data.accept = {
        geoState: {
          $in: data.geoState.split(',')
        },
        hour: {
          $in: data.hour.split(',')
        }
      }
      delete data.geoState
      delete data.hour
      returnData.data.push(data)
    })
    sendJson(req, res, returnData)
  }, res)
}

function getAllTargetsHelper (callbackFunc) {
  let setList = []
  const dataList = []
  redis.smembers('targets', function (err, result) {
    if (err) {
      callbackFunc({ error: err })
      return
    }
    if (result.length === 0) {
      if (typeof callbackFunc === 'function') {
        callbackFunc(dataList)
      }
    }
    setList = result
    for (let i = 0; i < setList.length; i++) {
      redis.hgetall(`target:${setList[i]}`, function (err, result) {
        if (err) {
          callbackFunc({ error: err })
          return
        } else {
          if (result != null) {
            dataList.push(result)
          }
        }
        if (dataList.length === setList.length) {
          if (typeof callbackFunc === 'function') {
            callbackFunc(dataList)
          }
        }
      })
    }
  })
}

function getTarget (req, res, id) {
  redis.hgetall(`target:${id}`, function (err, result) {
    if (err) {
      sendJson(req, res, {
        error: err
      })
      return
    }
    if (!result) {
      sendJson(req, res, {
        error: `No such target with given id: ${id}`
      })
      return
    }
    delete result.accept
    result.accept = {
      geoState: {
        $in: result.geoState.split(',')
      },
      hour: {
        $in: result.hour.split(',')
      }
    }
    delete result.geoState
    delete result.hour
    sendJson(req, res, {
      success: true,
      data: result
    })
  })
}

function updateTarget ({
  id,
  url,
  value,
  maxAcceptsPerDay,
  accept
}, req, res) {
  redis.hgetall(`target:${id}`, function (err, result) {
    if (err) {
      sendJson(req, res, {
        error: err
      })
      return
    }
    if (!result) {
      sendJson(req, res, {
        error: `No such target to update with given id: ${id}`
      })
      return
    }
    redis.hmset(`target:${id}`, {
      id,
      url,
      value,
      maxAcceptsPerDay,
      accept: maxAcceptsPerDay,
      geoState: accept.geoState.$in.join(','),
      hour: accept.hour.$in.join(',')
    })
    result.geoState.split(',').forEach(geo => {
      result.hour.split(',').forEach(hour => {
        redis.zrem(`${geo}:${hour}`, `target:${id}`)
      })
    })
    accept.geoState.$in.forEach(geo => {
      accept.hour.$in.forEach(hour => {
        redis.zadd(`${geo}:${hour}`, value, `target:${id}`)
      })
    })
    sendJson(req, res, { success: true })
  })
}
