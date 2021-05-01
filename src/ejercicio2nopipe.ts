import * as chalk from 'chalk';
import * as yargs from 'yargs';
import {spawn} from 'child_process';
import * as fs from 'fs';

/**
 * Funcion que obtiene la informacion del fichero de texto (lineas, palabras y letras) sin el uso del metodo pipe, siendo este sustituido por console.log()
 * @param path Ruta del fichero.
 * @param options Opciones que modifican la visualizacion de la informacion.
 */
function getInfoPipe(path: string, options: string[]) {
    fs.access(path, (err) => {
        if (err) {
            console.log(chalk.red(`No se ha encontrado ningun fichero de texto en la ruta : ${path}`));
        }
        else {
            const wc = spawn('wc', [`${path}`]);
            let output = '';
            wc.stdout.on('data', (info) => output += info);
            wc.on('close', () => {
                let info_split = output.split(" ").filter(ch => ch != "");
                for (let i = 0; i < options.length; i++) {
                    if (options[i] == "lines") {
                        console.log(`Lineas: ${parseInt(info_split[0]) + 1}\n`);
                    }
                    if (options[i] == "words") {
                        console.log(`Palabras: ${info_split[1]}\n`);
                    }
                    if (options[i] == "chars") {
                        console.log(`Letras: ${info_split[2]}\n`);
                    }
                }
            });
        }
    });
}

yargs.command({
    command: 'info',
    describe: 'Muestra la informacion del coumento de texto.',
    builder: {
        path: {
            describe: 'Direccion del fichero de texto.',
            demandOption: true,
            type: 'string',
        },
        lines: {
            describe: 'Mostrar el numero de lines - true por defecto.',
            demandOption: false,
            type: 'boolean',
        },
        words: {
            describe: 'Mostrar el numero de palabras - true por defecto.',
            demandOption: false,
            type: 'boolean',
        },
        chars: {
            describe: 'Mostrar el numero de letras - true por defecto.',
            demandOption: false,
            type: 'boolean',
        },
    },
    handler(argv) {
        if (typeof argv.path === 'string') {
            let options = ["lines", "words", "chars"];
            if (argv.lines == false) {
                options = options.filter(op => op != "lines");
            }
            if (argv.words == false) {
                options = options.filter(op => op != "words");
            }
            if (argv.chars == false) {
                options = options.filter(op => op != "chars");
            }
            if (options.length == 0) {
                console.log(chalk.red("Los parametros --lines, --words y --chars estan el falso."));
            }
            getInfoPipe(argv.path, options);
        }
    },
});
yargs.parse();