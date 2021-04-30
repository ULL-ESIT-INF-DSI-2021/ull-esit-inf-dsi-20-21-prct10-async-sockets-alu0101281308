import 'mocha';
import {expect} from 'chai';
import {Producto} from '../../src/Ejercicio-Presencial/Producto';
import {Visa} from '../../src/Ejercicio-Presencial/Visa';
import {Paypal} from '../../src/Ejercicio-Presencial/Paypal';
import {Mastercard} from '../../src/Ejercicio-Presencial/Mastercard';
import {Stripe} from '../../src/Ejercicio-Presencial/Stripe';


describe('add function tests', () => {

   const producto = new Producto("Coca-cola", 2, new Visa()); 

  it('Simulacion de compra del producto con Visa - Patron comportamiento Strategy', () => {
    expect(producto.comprar()).to.be.equal(2.13);
  });

  it('Simulacion de compra del producto con Mastercard - Patron comportamiento Strategy', () => {
    producto.setMetodoPago(new Mastercard())  
    expect(producto.comprar()).to.be.equal(2.1);
  });

  it('Simulacion de compra del producto con Paypal - Patron comportamiento Strategy', () => {
    producto.setMetodoPago(new Paypal())
    expect(producto.comprar()).to.be.equal(2.06);
  });

  it('Simulacion de compra del producto con Stripe - Ejemplo de metodo de pago a futuro - Patron comportamiento Strategy', () => {
    producto.setMetodoPago(new Stripe())
    expect(producto.comprar()).to.be.equal(2.02);
  });

});

