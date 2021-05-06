import * as net from 'net';
import * as fs from 'fs';
import chalk = require('chalk');

const server = net.createServer({allowHalfOpen: true}, (connection) => {
    console.log('A client has connected.');
  
    let wholeData = '';
    connection.on('data', (dataChunk) => {
      wholeData += dataChunk;
      let messageLimit = wholeData.indexOf('\n');
      while (messageLimit !== -1) {
        const message = wholeData.substring(0, messageLimit);
        wholeData = wholeData.substring(messageLimit + 1);
        connection.emit('request', JSON.parse(message));
        messageLimit = wholeData.indexOf('\n');
      }
    });
  
    connection.on('request', (request) => {
      if (request.type === 'send') {
        fs.appendFileSync('Historial.txt', request.mensaje + '\n');
        const respuesta = '{"type": "send", "mensaje": "Mensaje enviado y guardado." }\n';
        connection.write(respuesta);
        console.log(chalk.green(request.mensaje + " guardado en Historial.txt"))
        connection.end();
      }
    });
  
    connection.on('close', () => {
      console.log('A client has disconnected');
    });
  });
  
  server.listen(60300, () => {
    console.log('Waiting for clients to connect.');
  });
