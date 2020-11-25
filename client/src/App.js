import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import TextField from '@material-ui/core/TextField';
import './App.css';

const { getRandPrime, getE, generatePrivateKey, encrypt, decrypt } = require('./utils/helperFunctions');
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

const socket = io.connect("http://localhost:4000");

const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] }); // big_red_donkey}

function App() {
  const [state, setState] = useState({
    name: randomName,
    message: "",
    publicKey: [],
    privateKey: ""
  });
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on('message', ({name, message, encryptionData}) => {
      const {publicKey, privateKey} = encryptionData;

      
      const decryptedMessage = decrypt(JSON.parse(message), privateKey, publicKey[0]);
      const bytesToString = String.fromCharCode.apply(null, decryptedMessage);
      
      console.log("------------------------------------------")
      console.log(`Mensaje de ${name}`)
      console.log(`Encriptado: ${message}`);
      console.log(`Desencriptado: ${bytesToString}`);
      console.log(`Encriptado con llave publica [${publicKey}] y llave privada ${privateKey}`)
      console.log("------------------------------------------")


      setChat([...chat, {name, message: bytesToString}]);
    })
  }, [state]);

  // On first render
  useEffect(() => {
    if (!localStorage.getItem('name')) {
      // data from the rsa algorithm
      const p = getRandPrime(500, 1000);
      const q = getRandPrime(500, 1000);
      const n = p * q;
      const phi = (p-1) * (q-1);
      const e = getE(phi);
      const privateKey = generatePrivateKey(phi, e);

      const encryptionData = {
        publicKey: [n,e],
        privateKey
      }

      setState({...state, name: randomName, publicKey: encryptionData.publicKey, privateKey: encryptionData.privateKey});
      localStorage.setItem('name', randomName);
      localStorage.setItem("encrypt-data", JSON.stringify(encryptionData));

    } else {
      const storedData = JSON.parse(localStorage.getItem('encrypt-data'));
      
      setState({...state, name: localStorage.getItem('name'), publicKey: [...storedData.publicKey], privateKey: storedData.privateKey})
    }
  }, []);

  const renderChat = () => {
    return chat.map(({name, message}, index) => (
      <div key={index} className="message">
        <h3>{name}:  <span>{message}</span></h3>
      </div>
    ))
  }


  const onMessageSubmit = (e) => {
      e.preventDefault();
      const {name, message} = state;

      const encryptedMessage = encrypt(message, state.publicKey[1], state.publicKey[0]);
    
      socket.emit('message', { name, message: JSON.stringify(encryptedMessage), encryptionData: {
        publicKey: state.publicKey,
        privateKey: state.privateKey
      }});
      setState({...state, message: ""});
  }

  const onTextChange = e => {
    setState({
      ...state,
      [e.target.name]: e.target.value
    });
  }

  return (
    <div className="card">
      <form onSubmit={onMessageSubmit}>
        <h1>Chat</h1>
        <div className="name-field">
          <TextField
              name="name"
              onChange={e => onTextChange(e)}
              value={state.name}
              label="Name"
              disabled
            />
        </div>
        <div>
          <TextField
              name="message"
              onChange={e => onTextChange(e)}
              value={state.message}
              id="outlined-multiline-static"
              variant="outlined"
              label="Message"
            />
        </div>

        <button>Send</button>

        <div>
          <h2>Dev</h2>
          <p>My public key: {state.publicKey[0]}, {state.publicKey[1]}</p>
          <p>My private key: {state.privateKey}</p>
        </div>
      </form>
      <div className="render-chat">
        <h1>Chat log</h1>
        {renderChat()}
      </div>
    </div>
  );
}

export default App;
