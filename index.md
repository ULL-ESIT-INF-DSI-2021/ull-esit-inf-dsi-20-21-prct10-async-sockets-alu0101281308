![Logo](img/ull.png)

#### Ingeniería Informática
#### Desarrollo de sistemas informáticos
#### Elvis Nogueiras alu0101281308@ull.edu.es

# Práctica 10 - Cliente y servidor para una aplicación de procesamiento de notas de texto

## Introducción
En esta práctica tendrá que partir de la implementación de la aplicación de procesamiento de notas de texto que llevó a cabo en la Práctica 8 para escribir un servidor y un cliente haciendo uso de los sockets proporcionados por el módulo net de Node.js.

## Funcionamiento Ejercicio Notas

Para inciar el servidor se debe ejecutar en una terminal dentro del directorio raiz : `npm run sserver`
Para usar la aplicacion de notas como cliente se debe ejecutar en otra terminar el comando : `node dist/Ejercicio-Notas/client.js [add, remove, list, update, read] --[atributos segun sea el caso]`
ejemplo : `node dist/Ejercicio-Notas/client.js add --user=Elvis --title="nota 3" --body="prueba nota 3" --color=red`

## Funcionamiento Ejercicio Presencial chat

Para probar el ejercicio del chat, se debe abrir el servidor en una terminal con : `npm run pserver` y en otra terminal abrir el cliente y enviar por linea de comandos el mensaje con el comando `msn`, ejemplo :`node dist/Presencial/cliente.ts msn --mensaje="Hola mundo"`, Si todo ha salido correctamente, el mensaje se guarda en un fichero llamado `Historial.txt` en el directorio raiz del proyecto.

## Objetivos
Las operaciones que podrá solicitar el cliente al servidor deberán ser las mismas que ya implementó durante la Práctica 8, esto es, añadir, modificar, eliminar, listar y leer notas de un usuario concreto. Un usuario interactuará con el cliente de la aplicación, exclusivamente, a través de la línea de comandos. Al mismo tiempo, en el servidor, las notas se almacenarán como ficheros JSON en el sistema de ficheros y siguiendo la misma estructura de directorios utilizada durante la Práctica 8.
 
## Solución de diseño para el proyecto de notas cliente-servidor.

En la guia de la practica se nos proporcionan una serie de consejos que podrian simplificar la manera en la que podemos atacar este ejercicio, estos consejos son :

* Tendrá que implementar lo que se conoce como el patrón petición-respuesta, es decir, el cliente lleva a cabo una petición al servidor conectándose al mismo, el servidor procesa la petición, prepara y envía una respuesta de vuelta al cliente, cierra la conexión con el cliente y el cliente procesa la respuesta recibida.

* Todos los mensajes intercambiados entre el cliente y el servidor deben ser representaciones en cadena de objetos JSON válidos. Recuerde que un objeto JSON puede serializarse y deserializarse gracias al uso de los métodos JSON.stringify y JSON.parse, respectivamente.

* El cliente no puede utilizar el método end del socket de comunicación con el servidor para indicar que ha terminado de enviar una petición al servidor dado que, si lo hiciera, el servidor no podrá escribir la respuesta de vuelta al cliente en dicho socket. Piense, entonces, cómo podría hacer para que, dada una petición enviada por el cliente a través del socket, el servidor sea capaz de detectar que ha recibido una petición completa para, a continuación, hacer que el socket emita un evento request. Una vez hecho lo anterior, en el servidor, tendrá que añadir un manejador que se ejecute cada vez que el socket emita un evento de tipo request.

* Toda la lógica de negocio asociada a la gestión del sistema de ficheros tendrá que estar implementada en el lado del servidor. El servidor deberá ser capaz de procesar una petición. En primer lugar, deberá ser capaz de identificar el tipo de petición que ha recibido desde un cliente para, seguidamente, llevar a cabo las comprobaciones y operaciones necesarias con el sistema de ficheros. Además, deberá ser capaz de construir y enviar un mensaje de respuesta al cliente, el cual puede ser satisfactorio o no. Una vez enviado dicho mensaje, deberá cerrar el lado cliente del socket.

* Toda la lógica de negocio asociada al paso de parámetros desde línea de comandos y su procesamiento mediante yargs tendrá que estar implementada en el lado del cliente. El cliente deberá ser capaz de enviar una petición a un cliente. Para ello, deberá ser capaz de construir un mensaje en el que sea capaz de informar al servidor del tipo de operación que quiere llevar a cabo. Además, deberá ser capaz de recibir una respuesta del servidor y procesarla. Por ejemplo, si el cliente ha solicitado al servidor la lectura de una nota concreta y el servidor ha respondido con una respuesta satisfactoria (porque la nota existe), dicha respuesta contendrá la información de la nota que se desea leer. El cliente deberá mostrar la nota recibida en la petición por la consola utilizando chalk.

* Puede definir sus propios tipos o clases para las peticiones y respuestas en su aplicación, aunque se recomienda que, al menos, contengan los siguientes elementos de información:
~~~ typescript
export type RequestType = {
  type: 'add' | 'update' | 'remove' | 'read' | 'list';
  title?: string;
  body?: string;
  color?: Color;
}

export type ResponseType = {
  type: 'add' | 'update' | 'remove' | 'read' | 'list';
  success: boolean;
  notes?: Note[];
}
~~~

Tomando en cuenta cada uno de los consejos dados y los apuntes dados en clase agregue al directorio `Ejercicio-Notas` 4 ficheros nuevos : 

* types.ts : Contiene el codigo de los tipos de datos `RequestType` y `ResponseType` cuya unica modificacion del codigo original dado en la practica es que agregue el atributo `user` en el `ResponseType` para que luego el cliente envie esta informacion incluyendo el usuario al servidor.

~~~ typescript
import { Color, Nota } from "./Notas"

export type RequestType = {
    type: 'add' | 'update' | 'remove' | 'read' | 'list';
    user: string;
    title?: string;
    body?: string;
    color?: Color;
  }
  
  export type ResponseType = {
    type: 'add' | 'update' | 'remove' | 'read' | 'list';
    success: boolean;
    notes?: Nota[];
  }
~~~

* eventEmitterClient.ts : Es una clase que hereda de EventEmiter, esto permite crear una logica como la de verificar que la informacion que reciba el cliente por parte del servidor este completa y emitir un evento personalizado unicamente cuando dicha logica se cumpla.

~~~ typescript
import {EventEmitter} from 'events';

export class MessageEventEmitterClient extends EventEmitter {
  constructor(connection: EventEmitter) {
    super();

    let wholeData = '';
    connection.on('data', (dataChunk) => {
      wholeData += dataChunk;

      let messageLimit = wholeData.indexOf('\n');
      while (messageLimit !== -1) {
        const message = wholeData.substring(0, messageLimit);
        wholeData = wholeData.substring(messageLimit + 1);
        this.emit('message', JSON.parse(message));
        messageLimit = wholeData.indexOf('\n');
      }
    });
  }
}
~~~

* client.ts : Siguiendo los consejos anteriormente dichos, este fichero contiene la logica asociada al paso de parametros desde la linea de comandos y su processamiento mediante yargs, dependiendo de que comando se este utilizando se genera una constante de tipo `ResquestType` con la informacion pasada por linea de comandos, luego esta `peticion` se transforma en un `JSON` y es enviada por medio del `socket` de conexion con el metodo `write`. Por otro lado tambien contiene la logica para procesar la respuestas del servidor me diante la constante `client` de tipo `MessageEventEmitterClient` la cual asegura que la informacion enviada del servidor esta completa y emite el evento `message` que con el formato de tipo `ResponseType` y es mediante los atributos `type` y `success` que podemos saber si la `peticion` fue exitosa o erronea.

~~~ typescript
import chalk = require('chalk');
import {connect} from 'net';
import yargs = require('yargs');
import { RequestType } from '../Ejercicio-Notas/types';
import {MessageEventEmitterClient} from './eventEmitterClient';
import { Color, Nota } from './Notas';
import { Usuario } from './Usuario';

if (process.argv.length < 3) {
    console.log("Debe introducir un comando, puede ver los comandos disponibles usando: --help")
} else {

    yargs.command({
        command: 'add',
        describe: 'Agregar una nota a un usuario.',
        builder: {  
          user: {
            describe: 'Usuario propietario de la nota',
            demandOption: true,
            type: 'string',
          },
          title: {
            describe: 'Titulo de la nota',
            demandOption: true,
            type: 'string',
          },
          body: {
            describe: 'Contenido de la nota',
            demandOption: true,
            type: 'string',
          },
          color: {
            describe: 'Color del titulo de la nota -> yellow - green - red - blue.',
            demandOption: true,
            type: 'string',
          },
        },
        handler(argv) {
          if ((typeof argv.user === 'string') && (typeof argv.title === 'string') && (typeof argv.body === 'string') && (typeof argv.color === 'string')) { 
            let color_titulo: Color = Color.azul;
            
            
            Object.values(Color).forEach((color) => {
              if (color === argv.color) {
                color_titulo = color;
              }
            });
        
            const usuario = new Usuario(argv.user);
            const nota = new Nota(argv.title, argv.body, color_titulo)
            const peticion: RequestType = {
                type: 'add',
                user: usuario.getName(),
                title: nota.getTitulo(),
                body: nota.getCuerpo(),
                color: color_titulo
            }
            socket.write(`${JSON.stringify(peticion)}\n`)
            
          }
        },
    });

    yargs.command({
        command: 'list',
        describe: 'Listar las notas del usuario.',
        builder: {  
          user: {
            describe: 'Usuario propietario de la nota',
            demandOption: true,
            type: 'string',
          },
        },
        handler(argv) {
          if (typeof argv.user === 'string') { 
            const usuario: Usuario = new Usuario(argv.user);
            const peticion: RequestType = {
                type: 'list',
                user: usuario.getName()
            }
            socket.write(`${JSON.stringify(peticion)}\n`)
          }
        },
    });

    yargs.command({
        command: 'read',
        describe: 'Lee la nota del usuario.',
        builder: {  
          user: {
            describe: 'Usuario propietario de la nota',
            demandOption: true,
            type: 'string',
          },
          title: {
            describe: 'Titulo de la nota.',
            demandOption: true,
            type: 'string',
          },
        },
        handler(argv) {
          if ((typeof argv.user === 'string') && (typeof argv.title === 'string')) { 
            const usuario = new Usuario(argv.user);
            const peticion: RequestType = {
                type: 'read',
                user: usuario.getName(),
                title: argv.title
            }
            socket.write(`${JSON.stringify(peticion)}\n`)
          }
        },
      });

      yargs.command({
        command: 'remove',
        describe: 'Elimina la nota del usuario.',
        builder: {  
          user: {
            describe: 'Usuario propietario de la nota.',
            demandOption: true,
            type: 'string',
          },
          title: {
            describe: 'Titulo de la nota.',
            demandOption: true,
            type: 'string',
          },
        },
        handler(argv) {
          if ((typeof argv.user === 'string') && (typeof argv.title === 'string')) { 
            const usuario = new Usuario(argv.user);
            const peticion: RequestType = {
                type: 'remove',
                user: usuario.getName(),
                title: argv.title
            }
            socket.write(`${JSON.stringify(peticion)}\n`)
          }
        },
      });

      yargs.command({
        command: 'modify',
        describe: 'Modifica una nota del usuario ya existente.',
        builder: {  
          user: {
            describe: 'Usuario propietario de la nota',
            demandOption: true,
            type: 'string',
          },
          title: {
            describe: 'Titulo de la nota.',
            demandOption: true,
            type: 'string',
          },
          body: {
            describe: 'Contenido de la nota',
            demandOption: true,
            type: 'string',
          },
          color: {
            describe: 'Color del titulo de la nota -> yellow - green - red - blue.',
            demandOption: true,
            type: 'string',
          },
        },
        handler(argv) {
          if ((typeof argv.user === 'string') && (typeof argv.title === 'string') && (typeof argv.body === 'string') && (typeof argv.color === 'string')) { 
            let color_titulo: Color = Color.azul;
    
            Object.values(Color).forEach((color) => {
              if (color === argv.color) {
                color_titulo = color;
              }
            });
    
            const usuario = new Usuario(argv.user);
            const nota = new Nota(argv.title, argv.body, color_titulo)
            const peticion: RequestType = {
                type: 'update',
                user: usuario.getName(),
                title: nota.getTitulo(),
                body: nota.getCuerpo(),
                color: color_titulo
            }
            socket.write(`${JSON.stringify(peticion)}\n`)
            
          }
        },
      });

    const socket = connect({port: 60300});
    const client = new MessageEventEmitterClient(socket);

    client.on('message', (message) => {

        switch (message.type) {
            case 'add':
                if (message.success) {
                    console.log(chalk.green("Nota agregada con exito"));
                }else {
                    console.log(chalk.red("La nota ya existe."));
                }
            break;

            case 'update':
                if (message.success) {
                    console.log(chalk.green("Nota modificada con exito"));
                }else {
                    console.log(chalk.red("No existe el usuario o la nota."))
                }
            break;

            case 'remove':
                if (message.success) {
                    console.log(chalk.green("La nota se ha eliminado correctamente."))
                }else {
                    console.log(chalk.red("No existe el usuario o la nota."))
                }
            break;
            
            case 'read':
                if (message.success) {
                    let notas = message.notes;
                    console.log(chalk.keyword(notas[0].color)(notas[0].titulo));
                    console.log(chalk.keyword(notas[0].color)(notas[0].cuerpo));
                }else {
                    console.log(chalk.red("La nota o el usuario no existe."));
                }
            break;

            case 'list':
                if (message.success) {
                    console.log(chalk.cyan("Tus notas"))
                    let notas = message.notes;
                    for (let i = 0; i < notas.length; i++) {
                        console.log(chalk.keyword(notas[i].color)(notas[i].titulo))
                    }  
                }else {
                    console.log(chalk.red("No existe el usuario"))
                }
            break;
        
            default:
                break;
        }

    });
}

yargs.parse();
~~~

* server.ts : Este fichero contiene toda la logica asociada a la gestion del sistema de ficheros usnado la clase `FileManager` creada en la practica 8, crear el servidor y el manejo de informacion enviada por el cliente segun sea el caso, cuando se detecta el evento `data` se ejecuta la misma logica que usa la clase `MessageEventEmitterClient` para verificar que los datos que se reciben estan completos, luego de verificar esto se emite un evento `request` que tiene el formato de tipo `RequestType` enviado por el cliente, a traves del atributo `type` se sabe que operacion desea hacer el cliente y se hacen las validaciones de los ficheros correspondientes, luego de esto se crea una constante `respuesta` del tipo `ResponseType` para ser enviada al cliente dependiendo de si las validaciones fueron exitosas o erroneas mediante el `socket` de la conexion y el metodo `write`. 

~~~ typescript
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
~~~

## Conclusión

En esta práctica profundizamos los conocimientos en el lenguaje Typescript aplicando `sockets` para la comunicacion de `sevidor` y `cliente` asi como tambien el la herecia de la clase `EventEmiter` para crear eventos.

# Bibliografía
- [Guión de la práctica](https://ull-esit-inf-dsi-2021.github.io/prct10-async-sockets/)
- [Apuntes de clase](https://ull-esit-inf-dsi-2021.github.io/nodejs-theory/)
- [Communicating using Markdown](https://lab.github.com/githubtraining/communicating-using-markdown)
- [Que es visual studio live sahre](https://docs.microsoft.com/en-us/visualstudio/liveshare/)