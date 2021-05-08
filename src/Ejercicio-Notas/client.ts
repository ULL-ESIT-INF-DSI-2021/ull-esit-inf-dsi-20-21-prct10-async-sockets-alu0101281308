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