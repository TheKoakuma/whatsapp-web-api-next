import { useEffect, useState } from 'react'
import io from 'socket.io-client'
let socket;

const Home = () => {
  const [input, setInput] = useState('')

  useEffect(() => socketInitializer(), [])

  const socketInitializer = async () => {
    await fetch('/api/connect');
    socket = io(undefined,{
        path:"/api/socket_io"
    })

    socket.on('connect', () => {
      console.log('connected')
    })

    socket.on('update-input', msg => {
      setInput(msg)
    })

    socket.on('message', function(msg) {
      $('.logs').append($('<li>').text(msg));
    });

    socket.on('qr', function(src) {
      $('#qrcode').attr('src', src);
      $('#qrcode').show();
    });

    socket.on('ready', function(data) {
      $('#qrcode').hide();
    });

    socket.on('authenticated', function(data) {
      $('#qrcode').hide();
    });
  }

  const onChangeHandler = (e) => {
    setInput(e.target.value)
    socket.emit('input-change', e.target.value)
  }

  return (
    <div>
      <h1>Whatsapp API</h1>
      <p>Powered by TheKoakuma</p>
      <img src="" alt="QR Code" id="qrcode"></img>
      <h3>Logs:</h3>
      <ul class="logs"></ul>
    </div>
  )
}

export default Home;