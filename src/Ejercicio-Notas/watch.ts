import chalk = require('chalk');
import * as fs from 'fs';
import yargs = require('yargs');

/**
 * Funcion que actua como un observador para la ruta del usuario dada, esta funcion muestra por consola
 * cambios como la eliminacion de un fichero, la modificacion de un fichero y agregar un fichero nuevo dentro
 * del directorio.
 * @param path Ruta del directorio del usuario (notas/user);
 */
function watch (path: string) {
    fs.access(path, (err) => {
        if(err) {
            console.log(chalk.red(`No existe la ruta : ${path}`));
        } else {
            fs.open(path, fs.constants.O_DIRECTORY, (err) => {
                if (err) {
                    console.log(chalk.red(`No existe un fichero en la ruta : ${path}`));
                } else {
                    fs.readdir(path, (err, pre_dir) => {
                        if (err) {
                            console.log(chalk.red(`No se puede leer el directorio con la ruta : ${path}`));
                        }else {
                            let only_one = true;
                            fs.watch(path, (event, file) => {
                                fs.readdir(path, (err, post_dir) => {
                                    if (err) {
                                        console.log(chalk.red(`No se puede leer el directorio con la ruta : ${path}`));
                                    } else {
                                        if (event == "rename") {
                                            if (pre_dir.length > post_dir.length) {
                                            console.log(chalk.cyanBright(`Se elimino el fichero ${file} del directorio ${path}`));
                                            }; 
                                            
                                            if (pre_dir.length < post_dir.length) {
                                            console.log(chalk.redBright(`Se agrego el fichero ${file} en el directorio ${path}`));
                                            };

                                            pre_dir = post_dir;
                                        };
                                        
                                        if (event == "change") {
                                            if (only_one) {
                                                only_one = false;
                                                console.log(chalk.yellowBright(`Se modifico el fichero ${file} en el directorio ${path}`));
                                            } else {
                                                only_one = true;
                                            }
                                        };
                                    }
                                });
                            });
                        };
                    });
                };
            });
        };
    });
};


yargs.command( {
  command: 'watch',
  describe: 'La terminal se queda congelada esperando a un cambio en el directorio del usuario',
  builder: {
    user: {
      describe: 'Nombre de usuario del usuario',
      demandOption: true,
      type: 'string',
    },
    path: {
      describe: 'Ruta donde se almacena el directorio del usuario',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.path === "string" && typeof argv.user === "string") {
        const path = argv.path + "/" + argv.user;
        watch(path);
    }
  },
});


yargs.parse();
