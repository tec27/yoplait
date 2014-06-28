var oauth = {
  consumer_key: 'iPmwrhjFVCYwL4ZZlicpCIeyJIbRUuXvPhLMCxOs',
  consumer_secret: 'el1a5N7RYxE7C0KWT609QmPpO4ZM9rpEsNqgopGS'
}
var baseUrl = 'https://api.parse.com/2/'

var request = require('request').defaults({ oauth: oauth })
  , uuid = require('uuid').v4


function YoInstall(version, installId) {
  this.version = version
  this.installId = installId
}

function convertError(serverData) {
  var error = new Error('Server returned an error')
  error.serverError = serverData.error
  error.serverCode = serverData.code
  return error
}

YoInstall.prototype._clientFunction = function(name, data, cb) {
  var requestData = {
    data: data,
    v: this.version,
    uuid: uuid(),
    iid: this.installId,
    'function': name
  }

  request({ method: 'POST', uri: baseUrl + 'client_function', json: requestData },
    function(err, res, data) {
      if (err) {
        return cb(err)
      }

      if (data.error) {
        return cb(convertError(data))
      }

      return cb(null, data.result)
    })
}

YoInstall.prototype.getUserByUdid = function(udid, cb) {
  this._clientFunction('getUserByUDID', { udid: udid }, function(err, user) {
    if (err) {
      if (err.serverCode != 141) {
        return cb(err)
      } else {
        return cb(null, null)
      }
    }

    return cb(null, user)
  })
}

YoInstall.prototype.getUserByUsername = function(username, myUdid, cb) {
  this._clientFunction('getUserByUsername', { username: username, udid: myUdid },
    function(err, user) {
      if (err) {
        if (err.serverCode != 141) {
          return cb(err)
        } else {
          return cb(null, null)
        }
      }

      return cb(null, user)
    })
}

YoInstall.prototype.signUp = function(email, username, udid, cb) {
  var requestData = {
    data: {
        email: email,
        username: username,
        deviceType: 'android',
        udid: udid
      },
    v: this.version,
    user_password: '',
    uuid: uuid(),
    iid: this.installId,
    'classname': '_User'
  }

  request({ method: 'POST', uri: baseUrl + 'user_signup', json: requestData },
    function(err, res, data) {
      if (err) {
        return cb(err)
      } else if (data.error) {
        return cb(convertError(data))
      }

      return cb(null, data.result)
    })
}

YoInstall.prototype.create = function(username, timeZone, cb) {
  var requestData = {
    data: {
        appName: 'Yo',
        appVersion: '1.07',
        deviceType: 'android',
        appIdentifier: 'com.justyo',
        channels: {
          objects: [ username ],
          '__op': 'AddUnique'
        },
        installationId: this.installId,
        timeZone: timeZone,
        parseVersion: this.version.substring(1)
      },
    v: this.version,
    uuid: uuid(),
    iid: this.installId,
    session_token: 'null',
    classname: '_Installation'
  }

  request({ method: 'POST', uri: baseUrl + 'create', json: requestData }, function(err, res, data) {
    if (err) {
      return cb(err)
    } else if (data.error) {
      return cb(convertError(data))
    }

    cb(null, data.result)
  })
}

YoInstall.prototype.sendYo = function(to, myUdid, cb) {
  this._clientFunction('yo', { to: to, sound: 'yo.mp3', udid: myUdid }, function(err, result) {
    if (err) {
      return cb(err)
    } else if (result != 'OK') {
      return cb(new Error('Non-OK result: ' + result))
    }

    return cb(null)
  })
}

YoInstall.prototype.block = function(target, myUdid, cb) {
  this._clientFunction('block', { username: target, udid: myUdid }, function(err, result) {
    if (err) {
      return cb(err)
    } else if (result != 'OK') {
      return cb(new Error('Non-OK result: ' + result))
    }

    return cb(null)
  })
}

YoInstall.prototype.unblock = function(target, myUdid, cb) {
  this._clientFunction('unblock', { username: target, udid: myUdid }, function(err, result) {
    if (err) {
      return cb(err)
    } else if (result != 'OK') {
      return cb(new Error('Non-OK result: ' + result))
    }

    return cb(null)
  })
}

var PARSE_VERSION = 'a1.4.1'

function Yoplait(udid, installId) {
  this.install = new YoInstall(PARSE_VERSION, installId)
  this.udid = udid
}

Yoplait.prototype.sendYo = function(to, cb) {
  this.install.sendYo(to, this.udid, cb)
}

Yoplait.prototype.block = function(target, cb) {
  this.install.block(target, this.udid, cb)
}

Yoplait.prototype.unblock = function(target, cb) {
  this.install.unblock(target, this.udid, cb)
}

function signUp(username, udid, cb) {
  var installId = uuid()
    , version = PARSE_VERSION
    , install = new YoInstall(version, installId)
    , email = username.split(/[^0-9a-zA-Z+-\/_.]/).join('_') + '@yo.com'
  install.signUp(email, username, udid, function(err, result) {
    if (err) {
      return cb(err)
    }

    var yoplait = new Yoplait(udid, installId)
    cb(null, yoplait)
  })
}

function getExistingUser(username, udid, cb) {
  var installId = uuid()
  process.nextTick(function() {
    cb(null, new Yoplait(udid, installId))
  })
}

function lookupUdid(udid, cb) {
  var install = new YoInstall(PARSE_VERSION, uuid())
  install.getUserByUdid(udid, cb)
}

function genUdid() {
  var firstPart = (Math.random() * 4294967295) | 0
    , secondPart = (Math.random() * 4294967295) | 0

  return ('00000000' + firstPart.toString(16)).slice(-8) +
    ('00000000' + secondPart.toString(16)).slice(-8)
}

function lookupUsername(username, cb) {
  var install = new YoInstall(PARSE_VERSION, uuid())
  install.getUserByUsername(username, genUdid(), cb)
}

module.exports = {
  newUser: signUp,
  existingUser: getExistingUser,
  lookupUdid: lookupUdid,
  lookupUsername: lookupUsername,
  genUdid: genUdid
}
