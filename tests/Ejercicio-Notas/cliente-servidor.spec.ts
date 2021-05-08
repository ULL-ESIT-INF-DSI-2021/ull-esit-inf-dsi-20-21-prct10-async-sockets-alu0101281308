import 'mocha';
import {expect} from 'chai';
import {EventEmitter} from 'events';
import {MessageEventEmitterClient} from '../../src/Presencial/eventemitter';

describe('Clace EventEmiter en Ejercicio Notas', () => {
  it('El cliente recibe el mensaje completo mandado por el servidor', (done) => {
    const socket = new EventEmitter();
    const client = new MessageEventEmitterClient(socket);

    client.on('message', (message) => {
      expect(message).to.be.eql({'type': 'add', 'success': true});
      done();
    });

    socket.emit('data', '{"type": "add",');
    socket.emit('data', ' "success": true');
    socket.emit('data', '}');
    socket.emit('data', '\n');
  });
});