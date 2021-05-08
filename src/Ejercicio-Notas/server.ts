import * as net from 'net';
import { FileManager } from './FileManager';
import { Usuario } from './Usuario';
import { Nota } from './Notas';
import chalk = require('chalk');
import { ResponseType } from './types';

const fm: FileManager = FileManager.getFileManagerInstance();

net.createServer((connection) => {
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
        let usuario: Usuario = new Usuario(request.user);
        let nota: Nota = new Nota(request.title, request.body, request.color);
        
        switch (request.type) {
            case 'add':
                if(fm.userFileExist(usuario)) {
                    if(!fm.userFileNoteJsonExist(usuario, nota.getTitulo())) {
                      fm.createFileNoteJson(usuario, nota);
                      let respuesta : ResponseType = {
                          type: 'add',
                          success: true,
                          notes: [nota]
                      }
                      connection.write(`${JSON.stringify(respuesta)}\n`)
                      connection.end()
                    } else {
                        let respuesta : ResponseType = {
                            type: 'add',
                            success: false,
                            notes: [nota]
                        }
                        connection.write(`${JSON.stringify(respuesta)}\n`)
                        connection.end()
                    }
                  }else {
                    fm.createUserFolder(usuario);
                    fm.createFileNoteJson(usuario, nota);
                    const respuesta : ResponseType = {
                        type: 'add',
                        success: true,
                        notes: [nota]
                    }
                    connection.write(`${JSON.stringify(respuesta)}\n`)
                    connection.end();
                  }
            break;

            case 'update':
                if(fm.userFileExist(usuario)){
                    if (fm.userFileNoteJsonExist(usuario, nota.getTitulo())) {
                       fm.createFileNoteJson(usuario, nota);
                       const respuesta : ResponseType = {
                        type: 'update',
                        success: true,
                    }
                    connection.write(`${JSON.stringify(respuesta)}\n`)
                    connection.end();
                    } else {
                        const respuesta : ResponseType = {
                            type: 'update',
                            success: false,
                        }
                        connection.write(`${JSON.stringify(respuesta)}\n`)
                        connection.end();
                    }
                  } else {
                    const respuesta : ResponseType = {
                        type: 'update',
                        success: false,
                    }
                    connection.write(`${JSON.stringify(respuesta)}\n`)
                    connection.end();
                  }
            break;

            case 'remove':
                if(fm.userFileExist(usuario)){
                    if (fm.userFileNoteJsonExist(usuario, request.title)) {
                       fm.removeFile(usuario, request.title);
                       const respuesta : ResponseType = {
                        type: 'remove',
                        success: true,
                    }
                    connection.write(`${JSON.stringify(respuesta)}\n`)
                    connection.end();
                    } else {
                        const respuesta : ResponseType = {
                            type: 'remove',
                            success: false,
                        }
                        connection.write(`${JSON.stringify(respuesta)}\n`)
                        connection.end();
                    }
                  } else {
                    const respuesta : ResponseType = {
                        type: 'remove',
                        success: false,
                    }
                    connection.write(`${JSON.stringify(respuesta)}\n`)
                    connection.end();
                  }
            break;
            
            case 'read':
                if(fm.userFileExist(usuario)){
                    if(fm.userFileExist(usuario)){
                        if (fm.userFileNoteJsonExist(usuario, request.title)) {
                           const nota : Nota = fm.parseJsonNote(usuario, request.title);
                           const respuesta : ResponseType = {
                            type: 'read',
                            success: true,
                            notes: [nota]
                           }
                           connection.write(`${JSON.stringify(respuesta)}\n`)
                           connection.end();
                        }  else {
                            const respuesta : ResponseType = {
                                type: 'read',
                                success: false,
                               }
                            connection.write(`${JSON.stringify(respuesta)}\n`)
                            connection.end();
                        }
                    } else {
                        const respuesta : ResponseType = {
                            type: 'read',
                            success: false,
                           }
                        connection.write(`${JSON.stringify(respuesta)}\n`)
                        connection.end();
                    }
                }
            break;

            case 'list':
                if (fm.userFileExist(usuario)) {
                    const notas: Nota[] = fm.listUserNoteJsonFiles(usuario);
                    const respuesta : ResponseType = {
                        type: 'list',
                        success: true,
                        notes: notas
                    }
                    connection.write(`${JSON.stringify(respuesta)}\n`)
                    connection.end();
   
                  } else {
                    const respuesta : ResponseType = {
                        type: 'list',
                        success: false,
                    }
                    connection.write(`${JSON.stringify(respuesta)}\n`)
                    connection.end();
                  }
            break;
        
            default:
                break;
        }
        
      });

    connection.on('close', () => {
      console.log('A client has disconnected.');
    });
  }).listen(60300, () => {
    console.log('Waiting for clients to connect.');
  });