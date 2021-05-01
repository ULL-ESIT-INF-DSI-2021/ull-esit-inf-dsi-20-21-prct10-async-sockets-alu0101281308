import * as chalk from 'chalk';
import * as yargs from 'yargs';
import {Color, Nota} from "./Notas";
import {Usuario} from "./Usuario";
import { FileManager } from './FileManager';

const fm: FileManager = FileManager.getFileManagerInstance();

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
        
        if(fm.userFileExist(usuario)) {
          if(!fm.userFileNoteJsonExist(usuario, nota.getTitulo())) {
            fm.createFileNoteJson(usuario, nota);
            console.log(chalk.green("New note added!"));
          } else {
            console.log(chalk.red("Note title taken!"))
          }
        }else {
          fm.createUserFolder(usuario);
          fm.createFileNoteJson(usuario, nota);
          console.log(chalk.green("New note added!"));
        }
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
        if (fm.userFileExist(usuario)) {
          const notas: Nota[] = fm.listUserNoteJsonFiles(usuario);
          console.log(chalk.cyan("Your Notes"))
          for (let i = 0; i < notas.length; i++) {
            console.log(chalk.keyword(notas[i].getColor())(notas[i].getTitulo()))
          }    
        } else {
          console.log(chalk.red("User not found"));
        }
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
        if(fm.userFileExist(usuario)){
          if (fm.userFileNoteJsonExist(usuario, argv.title)) {
             const nota : Nota = fm.parseJsonNote(usuario, argv.title);
             console.log(chalk.keyword(nota.getColor())(nota.getTitulo()));
             console.log(chalk.keyword(nota.getColor())(nota.getCuerpo()));
          } else {
            console.log(chalk.red("No note found"));
          }
        } else {
          console.log(chalk.red("User not found"));
        }
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
        if(fm.userFileExist(usuario)){
          if (fm.userFileNoteJsonExist(usuario, argv.title)) {
             fm.removeFile(usuario, argv.title);
             console.log(chalk.green("Note removed!"));
          } else {
            console.log(chalk.red("No note found"));
          }
        } else {
          console.log(chalk.red("User not found"));
        }
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
        const usuario = new Usuario(argv.user);

        Object.values(Color).forEach((color) => {
          if (color === argv.color) {
            color_titulo = color;
          }
        });

        const nota = new Nota(argv.title, argv.body, color_titulo)
        if(fm.userFileExist(usuario)){
          if (fm.userFileNoteJsonExist(usuario, argv.title)) {
             fm.createFileNoteJson(usuario, nota);
             console.log(chalk.green("Note modified correctly!"));
          } else {
            console.log(chalk.red("No note found"));
          }
        } else {
          console.log(chalk.red("User not found"));
        }
      }
    },
  });

yargs.parse();
 