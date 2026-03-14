const { SerialPort } = require('serialport')
const { Server } = require('socket.io')

const port = new SerialPort({
    path: 'COM3',  // change to your Arduino port
    baudRate: 9600
})

const io = new Server(3001, {
    cors: { origin: "*" }
})

port.on('data', (data) => {
    const distance = data.toString().trim()
    console.log("Distance:", distance)

    io.emit("distance", distance)
})