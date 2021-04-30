import 'mocha';
import {expect} from 'chai';
import {FileManager} from '../../src/Ejercicio-Notas/FileManager'
import { Usuario } from '../../src/Ejercicio-Notas/Usuario';
import { Nota, Color } from '../../src/Ejercicio-Notas/Notas';



describe('add function tests', () => {

  const fm: FileManager = FileManager.getFileManagerInstance();
  const elvis: Usuario = new Usuario("Elvis"); 
  const nota: Nota = new Nota("spec-test", "esto es una nota de prueba para la spec", Color.rojo);

  it('File Manager comprueba que existe el usuario Elvis', () => {
    expect(fm.userFileExist(elvis)).to.be.equal(true);
  });

  it('File Manager comprueba que existe la nota 1 de Elvis', () => {
    expect(fm.userFileNoteJsonExist(elvis, "nota 1")).to.be.equal(true);
  });

  it('File Manager obtiene la lista de notas de Elvis', () => {
    expect(fm.listUserNoteJsonFiles(elvis).length).to.be.equal(4);
  });

  it('File Manager obtiene la nota 1 de Elvis', () => {
    expect(fm.listUserNoteJsonFiles(elvis)[0]).to.deep.equal({ titulo: 'nota 1', cuerpo: 'Nota de prueba 1', color: 'yellow' });
  });

  it('File Manager crea una nota nueva en el usuario Elvis', () => {
    fm.createFileNoteJson(elvis, nota);
    expect(fm.userFileNoteJsonExist(elvis, nota.getTitulo())).to.be.equal(true);
  });

  it('File Manager convierte nota1.json de elvis a un objeto de tipo Nota', () => {
    expect(fm.parseJsonNote(elvis, nota.getTitulo())).to.deep.equal(nota);
  });

  it('File Manager elimina la nota spec-test del usuario Elvis', () => {
    fm.removeFile(elvis, nota.getTitulo());
    expect(fm.userFileNoteJsonExist(elvis, nota.getTitulo())).to.be.equal(false);
  });


});

