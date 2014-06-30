var yoplait = require('./')

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
