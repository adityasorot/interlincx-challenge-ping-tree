process.env.NODE_ENV = 'test'

var test = require('ava')
var servertest = require('servertest')

var server = require('../lib/server')

test.serial.cb('healthcheck', function (t) {
  var url = '/health'
  servertest(server(), url, { encoding: 'json' }, function (err, res) {
    t.falsy(err, 'no error')
    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.status, 'OK', 'status is ok')
    t.end()
  })
})

test.serial.cb('get all targets when data is not present', function (t) {
  const url = '/api/targets'
  servertest(server(), url, {
    encoding: 'json',
    method: 'GET'
  }, function (err, res) {
    t.falsy(err, 'no error')
    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.success, true, 'Succesfully run the api call')
    t.is(res.body.message, 'No targets present', 'No targets found as data is not inserted right now.')
    t.end()
  }
  )
})

test.serial.cb('post a target', function (t) {
  const url = '/api/targets'
  const req = servertest(server(), url, {
    encoding: 'json',
    method: 'POST'
  }, function (err, res) {
    t.falsy(err, 'no error')
    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.success, true, 'Succesfully added redis data')
    t.end()
  }
  )
  req.end(JSON.stringify({
    id: '1',
    url: 'http://example.com',
    value: '0.50',
    maxAcceptsPerDay: '1',
    accept: {
      geoState: {
        $in: ['ca', 'ny']
      },
      hour: {
        $in: ['13', '14', '15']
      }
    }
  }))
})

test.serial.cb('post a target with id which is already there', function (t) {
  const url = '/api/targets'
  const req = servertest(server(), url, {
    encoding: 'json',
    method: 'POST'
  }, function (err, res) {
    t.falsy(err, 'no error')
    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.error, 'Target is already added with the given id: 1', 'Succesfully returns an error message')
    t.end()
  }
  )
  req.end(JSON.stringify({
    id: '1',
    url: 'http://example.com',
    value: '0.50',
    maxAcceptsPerDay: '1',
    accept: {
      geoState: {
        $in: ['ca', 'ny']
      },
      hour: {
        $in: ['13', '14', '15']
      }
    }
  }))
})

test.serial.cb('get all targets', function (t) {
  const url = '/api/targets'
  servertest(server(), url, {
    encoding: 'json',
    method: 'GET'
  }, function (err, res) {
    t.falsy(err, 'no error')
    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.success, true, 'Succesfully added redis data')
    t.end()
  }
  )
})

test.serial.cb('get a single target', function (t) {
  const url = '/api/target/1'
  servertest(server(), url, {
    encoding: 'json',
    method: 'GET'
  }, function (err, res) {
    t.falsy(err, 'no error')
    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.success, true, 'Succesfully found data')
    t.is(res.body.data.id, '1', 'Succesfully found data and checked the id')
    t.end()
  }
  )
})

test.serial.cb('get a single target when the id is not present', function (t) {
  const url = '/api/target/2'
  servertest(server(), url, {
    encoding: 'json',
    method: 'GET'
  }, function (err, res) {
    t.falsy(err, 'no error')
    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.error, 'No such target with given id: 2', 'Succesfully tested that id 2 is not present')
    t.end()
  }
  )
})

test.serial.cb('update a target value', function (t) {
  const url = '/api/target/1'
  const req = servertest(server(), url, {
    encoding: 'json',
    method: 'POST'
  }, function (err, res) {
    t.falsy(err, 'no error')
    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.success, true, 'Succesfully updated the target data')
    t.end()
  }
  )
  req.end(JSON.stringify({
    id: '1',
    url: 'http://example.com',
    value: '0.70',
    maxAcceptsPerDay: '1',
    accept: {
      geoState: {
        $in: ['ca', 'ny']
      },
      hour: {
        $in: ['13', '14', '15']
      }
    }
  }))
})

test.serial.cb('update a target value with an id which is not present', function (t) {
  const url = '/api/target/2'
  const req = servertest(server(), url, {
    encoding: 'json',
    method: 'POST'
  }, function (err, res) {
    t.falsy(err, 'no error')
    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.error,
      'No such target to update with given id: 2',
      'Succesfully tested that id 2 is not present and can\'t be updated')
    t.end()
  }
  )
  req.end(JSON.stringify({
    id: '2',
    url: 'http://example.com',
    value: '0.70',
    maxAcceptsPerDay: '10',
    accept: {
      geoState: {
        $in: ['ca', 'ny']
      },
      hour: {
        $in: ['13', '14', '15']
      }
    }
  }))
})

test.serial.cb('Get route positive decision', function (t) {
  const url = '/route'
  const req = servertest(server(), url, {
    encoding: 'json',
    method: 'POST'
  }, function (err, res) {
    t.falsy(err, 'no error')
    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.decision, 'http://example.com', 'Succesfully found the url')
    t.end()
  }
  )
  req.end(JSON.stringify({
    geoState: 'ca',
    publisher: 'abc',
    timestamp: '2018-07-19T15:28:59.513Z'
  }))
})

test.serial.cb('Get route negative decision', function (t) {
  const url = '/route'
  const req = servertest(server(), url, {
    encoding: 'json',
    method: 'POST'
  }, function (err, res) {
    t.falsy(err, 'no error')
    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.decision, 'reject', 'Succesful reject found')
    t.end()
  }
  )
  req.end(JSON.stringify({
    geoState: 'ca',
    publisher: 'abc',
    timestamp: '2018-07-19T23:28:59.513Z'
  }))
})
