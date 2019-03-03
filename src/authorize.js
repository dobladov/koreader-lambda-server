const db = require('./db')

module.exports = (user, password) => {
  if (user && password) {
    const res = db.get('users')
      .find({ username: user })
      .value()

    if (res && res.password === password) {
      return user
    }
  }
  return null
}
