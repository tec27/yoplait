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

YoInstall.prototype._clientFunction = function(name, data, sessionToken, cb) {
  var requestData = {
    data: data,
    v: this.version,
    uuid: uuid(),
    iid: this.installId,
    session_token: sessionToken,
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
  this._clientFunction('getUserByUDID', { udid: udid }, undefined, function(err, user) {
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
  this._clientFunction('getUserByUsername', { username: username, udid: myUdid }, undefined,
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

YoInstall.prototype.signUp = function(email, username, password, udid, cb) {
  var requestData = {
    data: {
        email: email,
        username: username,
        deviceType: 'android',
        udid: udid,
        didEnterPassword: true
      },
    v: this.version,
    user_password: password,
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

YoInstall.prototype.logIn = function(username, password, cb) {
  var requestData = {
    username: username,
    user_password: password,
    v: this.version,
    uuid: uuid(),
    iid: this.installId,
  }

  request({ method: 'POST', uri: baseUrl + 'user_login', json: requestData },
    function(err, res, data) {
      if (err) {
        return cb(err)
      } else if (data.error) {
        return cb(convertError(data))
      } else if (!data.result) {
        return cb(new Error('No result!'))
      }

      cb(null, data.result)
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

YoInstall.prototype.updateUser = function(updateData, sessionToken, cb) {
  var requestData = {
    data: updateData,
    v: this.version,
    uuid: uuid(),
    iid: this.installId,
    session_token: sessionToken,
    classname: '_User'
  }

  request({ method: 'POST', uri: baseUrl + 'update', json: requestData }, function(err, res, data) {
    if (err) {
      return cb(err)
    } else if (data.error) {
      return cb(convertError(data))
    }

    cb(null, data.result)
  })
}

YoInstall.prototype.sendYo = function(to, myUdid, sessionToken, cb) {
  var data = { to: to, sound: 'yo.mp3', udid: myUdid }
  this._clientFunction('yo', data, sessionToken, function(err, result) {
    if (err) {
      return cb(err)
    } else if (result != 'OK') {
      return cb(new Error('Non-OK result: ' + result))
    }

    return cb(null)
  })
}

YoInstall.prototype.block = function(target, myUdid, sessionToken, cb) {
  var data = { username: target, udid: myUdid }
  this._clientFunction('block', data, sessionToken, function(err, result) {
    if (err) {
      return cb(err)
    } else if (result != 'OK') {
      return cb(new Error('Non-OK result: ' + result))
    }

    return cb(null)
  })
}

YoInstall.prototype.unblock = function(target, myUdid, sessionToken, cb) {
  var data = { username: target, udid: myUdid }
  this._clientFunction('unblock', data, sessionToken, function(err, result) {
    if (err) {
      return cb(err)
    } else if (result != 'OK') {
      return cb(new Error('Non-OK result: ' + result))
    }

    return cb(null)
  })
}

var PARSE_VERSION = 'a1.4.1'

function Yoplait(udid, installId, sessionToken, objectId) {
  this.install = new YoInstall(PARSE_VERSION, installId)
  this.udid = udid
  this.sessionToken = sessionToken
  this.objectId = objectId
}

Yoplait.prototype.sendYo = function(to, cb) {
  this.install.sendYo(to, this.udid, this.sessionToken, cb)
}

Yoplait.prototype.block = function(target, cb) {
  this.install.block(target, this.udid, this.sessionToken, cb)
}

Yoplait.prototype.unblock = function(target, cb) {
  this.install.unblock(target, this.udid, this.sessionToken, cb)
}

Yoplait.prototype._updateEnteredPasswordFlag = function(cb) {
  var data = { objectId: this.objectId, didEnterPassword: true }
  this.install.updateUser(data, this.sessionToken, cb)
}

function signUp(username, password, udid, cb) {
  var installId = uuid()
    , version = PARSE_VERSION
    , install = new YoInstall(version, installId)
    , email = username.split(/[^0-9a-zA-Z+-_.]/).join('_') + Date.now() + '@yo.com'
  install.signUp(email, username, password, udid, function(err, result) {
    if (err) {
      return cb(err)
    }

    var yoplait = new Yoplait(udid, installId, result.session_token, result.data.objectId)
    cb(null, yoplait)
  })
}

function logIn(username, password, udid, cb) {
  var installId = uuid()
    , version = PARSE_VERSION
    , install = new YoInstall(version, installId)
  install.logIn(username, password, function(err, result) {
    if (err) {
      return cb(err)
    }

    var yoplait = new Yoplait(udid, installId, result.session_token, result.data.objectId)
    cb(null, yoplait)
  })
}

function useExistingSession(udid, sessionToken, objectId, cb) {
  var installId = uuid()
  process.nextTick(function() {
    cb(null, new Yoplait(udid, installId, sessionToken, objectId))
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
  signUp: signUp,
  logIn: logIn,
  useExistingSession: useExistingSession,

  lookupUdid: lookupUdid,
  lookupUsername: lookupUsername,
  genUdid: genUdid
}
