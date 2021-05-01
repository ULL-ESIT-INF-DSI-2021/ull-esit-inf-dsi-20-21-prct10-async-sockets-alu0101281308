import * as chalk from 'chalk';
import * as yargs from 'yargs';
import {spawn} from 'child_process';
import * as fs from 'fs';

function verifyDir(path: string) {
    fs.access(path, (err) => {
        if (err) {
            console.log(chalk.red(`No existe un fichero o directorio con la ruta : ${path}`));
        }
        else {
            fs.open(path, fs.constants.O_DIRECTORY, (err) => {
                if (err) {
                    console.log(`Es un fichero`);
                }
                else {
                    console.log(`Es un directorio`);
                }
            });
        }
    });
}
function makeDir(path: string) {
    fs.access(path, (err) => {
        if (!err) {
            console.log(chalk.red(`Este directorio ya existe.`));
        }
        else {
            fs.mkdir(path, (err) => {
                if (err) {
                    console.log(chalk.red(`No existe la ruta : ${path}`));
                }
                else {
                    console.log(chalk.green(`Se ha creado el directorio en la ruta : ${path}`));
                }
            });
        }
    });
}
function listDir(path: string) {
    fs.access(path, (err) => {
        if (err) {
            console.log(chalk.red(`No existe la ruta : ${path}`));
        }
        else {
            const ls = spawn('ls', [path]);
            ls.stdout.pipe(process.stdout);
        }
    });
}
function catDir(path: string) {
    fs.access(path, (err) => {
        if (err) {
            console.log(chalk.red(`No existe un fichero en la ruta : ${path}`));
        }
        else {
            fs.open(path, fs.constants.O_DIRECTORY, (err) => {
                if (err) {
                    const cat = spawn('cat', [path]);
                    cat.stdout.pipe(process.stdout);
                }
                else {
                    console.log(chalk.red(`${path} No es un fichero que se pueda leer.`));
                }
            });
        }
    });
}
function removeDir(path: string) {
    fs.access(path, (err) => {
        if (err) {
            console.log(chalk.red(`No existe un fichero en la ruta : ${path}`));
        }
        else {
            const rm = spawn('rm', ['-rf', path]);
            rm.on('close', (err) => {
                if (err) {
                    console.log(chalk.red(`No se ha podido eliminar el directorio o fichero.`));
                }
                else {
                    console.log(chalk.green(`${path} Se ha eliminado correctamente.`));
                }
            });
        }
    });
}
function copyDir(pathinit: string, pathend: string) {
    fs.access(`${pathinit}`, (err) => {
        if (err) {
            console.log(chalk.red(`No existe un fichero en la ruta : ${pathinit}`));
        }
        else {
            fs.open(pathinit, fs.constants.O_DIRECTORY, (err) => {
                if (err) {
                    const cp = spawn('cp', [pathinit, pathend]);
                    cp.on('close', (err) => {
                        if (err) {
                            console.log(chalk.red(`No se ha podido copiar el fichero.`));
                        }
                        else {
                            console.log(chalk.green(`El fichero ${pathinit} se ha copiado en ${pathend} correctamente.`));
                        }
                    });
                }
                else {
                    const cp = spawn('cp', ['-r', pathinit, pathend]);
                    cp.on('close', (err) => {
                        if (err) {
                            console.log(chalk.red(`No se ha podido copiar el directorio.`));
                        }
                        else {
                            console.log(chalk.green(`El directorio ${pathinit} se ha copiado en ${pathend} correctamente.`));
                        }
                    });
                }
            });
        }
    });
}
yargs.command({
    command: 'verify',
    describe: 'Verifica si existe un fichero o un directorio en la path dada',
    builder: {
        path: {
            describe: 'Ruta donde se encuentra el fichero o directorio a verificar',
            demandOption: true,
            type: 'string',
        },
    },
    handler(argv) {
        if (typeof argv.path === "string") {
            verifyDir(argv.path);
        }
    },
});
yargs.command({
    command: 'mkdir',
    describe: 'Crea un directorio en la ruta dada.',
    builder: {
        path: {
            describe: 'Ruta en donde se creara un directorio.',
            demandOption: true,
            type: 'string',
        },
    },
    handler(argv) {
        if (typeof argv.path === "string") {
            makeDir(argv.path);
        }
    },
});
yargs.command({
    command: 'ls',
    describe: 'Muestra los ficheros que estan en la ruta dada.',
    builder: {
        path: {
            describe: 'Ruta en donde se desea ver los ficheros que contiene',
            demandOption: true,
            type: 'string',
        },
    },
    handler(argv) {
        if (typeof argv.path === "string") {
            listDir(argv.path);
        }
    },
});
yargs.command({
    command: 'cat',
    describe: 'Muestra el contenido de un fichero.',
    builder: {
        path: {
            describe: 'Ruta del fichero',
            demandOption: true,
            type: 'string',
        },
    },
    handler(argv) {
        if (typeof argv.path === "string") {
            catDir(argv.path);
        }
    },
});
yargs.command({
    command: 'rm',
    describe: 'Elimina un directorio o fichero en la ruta dada.',
    builder: {
        path: {
            describe: 'Ruta del fichero o directorio',
            demandOption: true,
            type: 'string',
        },
    },
    handler(argv) {
        if (typeof argv.path === "string") {
            removeDir(argv.path);
        }
    },
});
yargs.command({
    command: 'cp',
    describe: 'Copia un fichero y lo mueve a otra ruta.',
    builder: {
        pathinit: {
            describe: 'Ruta del fichero que se desea copiar.',
            demandOption: true,
            type: 'string',
        },
        pathend: {
            describe: 'Ruta del directorio donde se va a mover el fichero.',
            demandOption: true,
            type: 'string',
        },
    },
    handler(argv) {
        if ((typeof argv.pathinit === "string") && (typeof argv.pathend === "string")) {
            copyDir(argv.pathinit, argv.pathend);
        }
    },
});

yargs.parse();