import 'mocha';
import {expect} from 'chai';
import {EventEmitter} from 'events';
import {MessageEventEmitterClient} from '../../src/Presencial/eventemitter';

describe('Clase EventEmiter Ejercicio Presencial', () => {
  it('El cliente recibe el mensaje completo mandado por el servidor', (done) => {
    const socket = new EventEmitter();
    const client = new MessageEventEmitterClient(socket);

    client.on('message', (message) => {
      expect(message).to.be.eql({'type': 'send', 'mensaje': "hola mundo"});
      done();
    });

    socket.emit('data', '{"type": "send", "mensaje": "hola mundo"} \n');
  });
});