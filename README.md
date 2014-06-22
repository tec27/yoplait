#yoplait
A simple wrapper around the unofficial Yo API, allowing you to sign up new accounts, register new
installs as existing users, block and unblock users, and, of course, send yos.

[![NPM](https://img.shields.io/npm/v/yoplait.svg?style=flat)](https://www.npmjs.org/package/yoplait)

[![NPM](https://nodei.co/npm/yoplait.png)](https://www.npmjs.org/package/yoplait)

## Usage
```javascript
var yoplait = require('yoplait')

var udid = yoplait.genUdid()
  , username = 'yoplait ' + Date.now()

console.log('signing up \'' + username + '\' with udid ' + udid)
yoplait.newUser(username, udid, function(err, yo) {
  if (err) {
    return console.log('sign up failed!: ', err)
  }

  console.log('yoing TEC27')
  yo.sendYo('TEC27', function(err) {
    if (err) {
      console.log('yoing failed yo :(')
      console.dir(err)
    } else {
      console.log('YO TEC27')
    }
  })
})
```

## API
`var yoplait = require('yoplait')`

####<b><code>yoplait#newUser(username, udid, cb)</code></b>
Sign up a new Yo account with the specified username and udid (device ID). Callback is in the form
of `cb(err, yoplaitUser)`.

####<b><code>yoplait#existingUser(username, udid, cb)</code></b>
Register a new install for an existing Yo user. Callback is in the form of `cb(err, yoplaitUser)`.

####<b><code>yoplait#lookupUdid(udid, cb)</code></b>
Look up a udid and see if it has an attached Yo account. Callback is in the form of
`cb(err, username)`. If `username` is null, the udid does not have a Yo account associated with it.

####<b><code>yoplait#lookupUsername(username, cb)</code></b>
Look up a username to see if it exists as a Yo account. Callback is in the form of
`cb(err, username`. If `username` is null, the username is not registered.

####<b><code>yoplait#genUdid()</code></b>
Helper method that generates a new, properly-formatted udid. Use this if you don't have a device ID
in mind, ideally creating unique device ID's per account.

### YoplaitUser
Get a user object by calling `yoplait#newUser` or `yoplait#existingUser`.

####<b><code>user#sendYo(to, cb)</b></code>
Sends a yo to the username specified by `to`. Callback is in the form of `cb(err)`.

####<b><code>user#block(target, cb)</b></code>
Blocks the username specified by `target`. Callback is in the form of `cb(err)`.

####<b><code>user#unblock(target, cb)</b></code>
Unblocks the username specified by `target`. Callback is in the form of `cb(err)`.

####<b><code>user#gcmUpdate(deviceToken, deviceTokenLastModified, cb)</b></code>
Updates the GCM registration for a particular user, changing how Yo will handle push notifications
for a device. Callback is in the form of `cb(err, result)`. This method is *probably* not very
useful to you.


## Installation
`npm install yoplait`

## License
MIT

## Yo
Yo
