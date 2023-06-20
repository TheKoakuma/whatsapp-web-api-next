import { Server } from 'socket.io'
import { Client, LocalAuth } from 'whatsapp-web.js'

const client=new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ],
  },
  authStrategy: new LocalAuth()
})

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running on port')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false
    });
    res.socket.server.io = io

    client.initialize()

    io.on('connection', function(socket) {
      socket.emit('message', 'Connecting...');
    
      client.on('qr', (qr) => {
        console.log('QR RECEIVED', qr);
        qrcode.toDataURL(qr, (err, url) => {
          socket.emit('qr', url);
          socket.emit('message', 'QR Code received, scan please!');
        });
      });
    
      client.on('ready', () => {
        socket.emit('ready', 'Whatsapp is ready!');
        socket.emit('message', 'Whatsapp is ready!');
      });
    
      client.on('authenticated', () => {
        socket.emit('authenticated', 'Whatsapp is authenticated!');
        socket.emit('message', 'Whatsapp is authenticated!');
        console.log('AUTHENTICATED');
      });
    
      client.on('auth_failure', function(session) {
        socket.emit('message', 'Auth failure, restarting...');
      });
    
      client.on('disconnected', (reason) => {
        socket.emit('message', 'Whatsapp is disconnected!');
        client.destroy();
        client.initialize();
      });
    });
  }
  res.end()
}

export default SocketHandler