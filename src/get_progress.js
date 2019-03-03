const url = require('url')
const db = require('./db')
const authorize = require('./authorize')

module.exports = (req, res) => {
  const username = authorize(
    req.headers['x-auth-user'],
    req.headers['x-auth-key']
  )

  const { document } = url.parse(req.url, true).query

  if (username) {
    if (document) {
      const doc = db.get('documents')
        .filter({ key: username + document })
        .value()

      if (doc.length) {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(doc[0]))
      } else {
        res.writeHead(502, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Unknown server error.' }))
      }
    } else {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Field "document" not provided.' }))
    }
  } else {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Unauthorized' }))
  }
}
