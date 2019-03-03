const db = require('./db')
const authorize = require('./authorize')

module.exports = (req, res) => {
  const username = authorize(
    req.headers['x-auth-user'],
    req.headers['x-auth-key']
  )

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

      if (username) {
        const timestamp = +new Date()
        const {
          percentage,
          progress,
          device,
          device_id,
          document
        } = body

        if (document) {
          if (percentage && progress && device) {
            const recordExists = db.get('documents')
              .filter({ key: username + document })
              .value()

            if (recordExists.length) {
              db.get('documents')
                .find({ key: username + document })
                .assign({
                  key: username + document,
                  percentage,
                  progress,
                  device,
                  device_id,
                  timestamp
                })
                .write()
            } else {
              db.get('documents')
                .push({
                  key: username + document,
                  percentage,
                  progress,
                  device,
                  device_id,
                  timestamp
                })
                .write()
            }
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ document, timestamp }))
          }
        } else {
          res.writeHead(403, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ message: 'Field "document" not provided.' }))
        }
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Unauthorized' }))
      }
    } catch (error) {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Invalid request' }))
    }
  })
}
