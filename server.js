const { Server } = require('net')

const host = '0.0.0.0'
const END = 'quit'
const connections = new Map()

const error = (message) => {
  console.error(message)
  process.exit(1)
}

// Send the message to all users except origin
const sendMessage = (message, origin) => {
  for (let socket of connections.keys()) {
    if (socket !== origin) {
      socket.write(message)
    }
  }
}

const listen = (port) => {
  const server = new Server()

  server.on('connection', (socket) => {
    let remoteSocket = `${socket.remoteAddress}:${socket.remotePort}`

    console.log(`New connection from: ${remoteSocket}`)
    socket.setEncoding('utf-8')

    socket.on('data', (message) => {
      if (!connections.has(socket)) {
        console.log(`Username ${message} set for connection ${remoteSocket}`)
        connections.set(socket, message)
      } else if (message === END) {
        connections.delete(socket)
        socket.end()
      } else {
        // Send the message to all the clients
        const fullMessage = `[${connections.get(socket)}] → ${message}`
        console.log(`${remoteSocket} → ${fullMessage}`)

        sendMessage(fullMessage, socket)
      }
    })

    socket.on('close', () => {
      console.log(`Connection with ${remoteSocket} closed`)
    })
  })

  server.listen({ port, host }, () => {
    console.log(`Listening on port: ${port}`)
  })

  server.on('error', (err) => error(err.message))
}

const main = () => {
  if (process.argv.length !== 3) error(`Usage: node ${__filename} port`)

  let port = process.argv[2]

  if (isNaN(port)) error(`Invalid port ${port}`)

  port = parseInt(port)
  listen(port)
}

// Main function in JavaScript
if (require.main === module) {
  main()
}
