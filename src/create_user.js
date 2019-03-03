const db = require('./db')

module.exports = (req, res) => {
  let body = ''
  req.on('data', (data) => {
    body += data
    if (body.length > 1e6) {
      req.connection.destroy()
    }
  })

  req.on('end', () => {
    try {
      body = JSON.parse(body)

      const { username, password } = body

      if (username && password) {
        const userExists = db.get('users')
          .filter({ username })
          .value()

        if (userExists.length) {
          res.writeHead(402, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Username is already registered.' }))
        } else {
          db.get('users')
            .push({ username, password })
            .write()

          res.writeHead(201, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ username }))
        }
      } else {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Invalid request' }))
      }
    } catch (error) {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Invalid request' }))
    }
  })
}
