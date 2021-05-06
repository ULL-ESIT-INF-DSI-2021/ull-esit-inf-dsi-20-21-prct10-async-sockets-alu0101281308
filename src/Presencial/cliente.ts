import * as yargs from 'yargs';
import * as net from 'net';
import chalk = require('chalk');
import {MessageEventEmitterClient} from './eventemitter';

export type RequestType = {
    type: 'send';
    mensaje: string;
}

const client = net.connect({port: 60300});
const clientEvent = new MessageEventEmitterClient(client);

clientEvent.on('message', (message) => {
    console.log(chalk.green(message.mensaje));
  });
  

yargs.command({
    command: 'msn',
    describe: 'Mensaje para enviar',
    builder: {
      mensaje: {
        describe: 'mensaje a enviar',
        demandOption: true,
        type: 'string',
      },
    },
    handler(argv) {
      if ((typeof argv.mensaje === 'string') ) {
        const request: RequestType = {
          type: 'send',
          mensaje: argv.mensaje,
        };
        client.write(JSON.stringify(request) + '\n');
      }
    },
  });

yargs.parse();

