import {settings, select, classNames, templates} from '../settings.js';
import utils from '/js/utils.js';
import CartProduct from '/js/components/CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

  }

  add(menuProduct){
    const thisCart = this;

    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    /* create element DOM */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    /* add element */
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    thisCart.update();
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    /* dodaje definicje właściwości, która znajduje pojedynczy element o selektorze zapisanym w select.cart.toggleTrigger */
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

    // referencja do elementu pokazującego koszt przesyłki
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    // referencja do elementu pokazującego cenę końcową, bez kosztu przesyłki
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    // referencja do elementów pokazujących cenę końcową
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    // referencja do elementu pokazującego liczbę sztuk 
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    // referencja do elementu formularza 
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    // referencja do phone
    thisCart.dom.formPhone = thisCart.dom.form.querySelector(select.cart.phone);
    // referencja do address
    thisCart.dom.formAddress = thisCart.dom.form.querySelector(select.cart.address);
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    // nasłuchujemy listę produktów, w której są produkty, w których jest widget liczby sztuk, który generuje ten event 
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  remove(cartProduct){
    const thisCart = this;
    const index = thisCart.products.indexOf(cartProduct);
      
    thisCart.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();

    thisCart.update();
  }

  update(){
    const thisCart = this;

    // informacja o cenie dostawy
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    // całościowa liczba sztuk
    thisCart.totalNumber = 0;
    // suma ceny za wszystko (bez kosztu dostawy)
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products){
      thisCart.totalNumber += product.amount; //zwiększenie totalNumber o liczbę sztuk danego produktu
      thisCart.subtotalPrice += product.price; // zwiększenie subTotalPrice o cenę całkowitą (price)
    }
    if (thisCart.totalNumber !== 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    }
    else {
      thisCart.totalPrice = 0;
      thisCart.deliveryFee = 0;
    }
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    for(let price of thisCart.dom.totalPrice){
      price.innerHTML = thisCart.totalPrice;
    }
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
  }

  sendOrder(){
    const thisCart = this;

    // adres endpointu (zamówienia - order)
    const url = settings.db.url + '/' + settings.db.order;

    // dane wysyłane do serwera 
    const payload = {
      address: thisCart.dom.formAddress.value,
      phone: thisCart.dom.formPhone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: []
    };
    console.log('payload', payload);

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options);
  }
}

export default Cart;