#yoplait
A simple wrapper around the unofficial Yo API, allowing you to sign up new accounts, log in as
existing users, block and unblock users, and, of course, send yos.

[![NPM](https://img.shields.io/npm/v/yoplait.svg?style=flat)](https://www.npmjs.org/package/yoplait)

[![NPM](https://nodei.co/npm/yoplait.png)](https://www.npmjs.org/package/yoplait)

##Notes for usage
yoplait is best used as a module for creating bots that occupy single (or a limited number of) Yo
accounts, so as not to pollute the limited Yo namespace. If you plan to use yoplait for sending
messages from a large number of accounts, or using account names as messages, I would recommend
utilizing [yofor.me](http://yofor.me) instead. It's simpler to setup and use, and it keeps the
limited namespace available for others!

## Usage
```javascript
var yoplait = require('yoplait')

var udid = yoplait.genUdid()
  , username = 'yoplait ' + Date.now()

console.log('signing up \'' + username + '\' with udid ' + udid)
yoplait.signUp(username, udid, udid, function(err, yo) {
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

####<b><code>yoplait#signUp(username, password, udid, cb)</code></b>
Sign up a new Yo account with the specified username and udid (device ID). Callback is in the form
of `cb(err, yoplaitUser)`.

####<b><code>yoplait#logIn(username, password, udid, cb)</code></b>
Log in as an existing Yo user. Callback is in the form of `cb(err, yoplaitUser)`.

####<b><code>yoplait#useExistingSession(udid, sessionToken, objectId, cb)</code></b>
Create a YoplaitUser from a existing session information. Yo sessions are long-lived, and so are
safe to store the details of e.g. on disk for later retrieval/usage. Callback is in the form of
`cb(err, yoplaitUser)`.

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

####<b><code>user#udid</b></code>
The UDID of this YoplaitUser.

####<b><code>user#sessionToken</b></code>
The sessionToken for this Yo user's current session. Fairly long lived and safe to store for later
usage.

####<b><code>user#objectId</b></code>
The objectId corresponding to this Yo user's User object. Used for updating attributes, like the
password. This value lives as long as User object does, and is thus safe to store.

## Note for Yo accounts created pre-0.4.0
Yo accounts created before yoplait 0.4.0 don't have a password, and are now blocked by the Yo API.
If you receive an error with code `141` with the message `RESTART APP AND TRY AGAIN!!!` or
`ERROR 41`, this means your user account must set a password before being usable again.
Unfortunately, Yo uses GCM (or the iOS equivalent) to give out password change tokens, so this
library is unable to properly update their passwords and make the accounts usable again.

Thus, any accounts created before 0.4.0 are *broken permanently* (unless we find a way around this).
My recommendation would be to create an account with the same name, but with a space added (or
similar). Sorry for your loss :(

## Installation
`npm install yoplait`

## License
MIT

## Yo
Yo
