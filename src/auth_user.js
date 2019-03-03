const authorize = require('./authorize')

module.exports = (req, res) => {
  const user = authorize(
    req.headers['x-auth-user'],
    req.headers['x-auth-key']
  )

  if (user) {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ authorized: 'OK' }))
  } else {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Unauthorized' }))
  }
}
