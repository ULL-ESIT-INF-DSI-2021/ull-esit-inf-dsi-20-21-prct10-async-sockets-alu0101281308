import 'mocha';
import {expect} from 'chai';
import {EventEmitter} from 'events';
import {MessageEventEmitterClient} from '../../src/Presencial/eventemitter';

describe('MessageEventEmitterClient', () => {
  it('Should emit a message event once it gets a complete message', (done) => {
    const socket = new EventEmitter();
    const client = new MessageEventEmitterClient(socket);

    client.on('message', (message) => {
      expect(message).to.be.eql({'type': 'send', 'mensaje': "hola mundo"});
      done();
    });

    socket.emit('data', '{"type": "send", "mensaje": "hola mundo"} \n');
  });
});