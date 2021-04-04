import {templates, select} from './../settings.js';
import {app} from '../app.js';

class Home {
  constructor(element){
  
    const thisHome = this;
  
    thisHome.render(element);
    thisHome.initWidgets();

    thisHome.initActions();
    thisHome.navigate();
  }
  
  render(wrapper){
    const thisHome = this;

    const generatedHTML = templates.homeWidget();

    thisHome.dom = {};

    thisHome.dom.wrapper = wrapper;

    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.orderOnline = document.querySelector(select.home.orderButton);
    thisHome.dom.bookTable = document.querySelector(select.home.bookButton);
  }
  
  initWidgets() {
    const thisHome = this;

    thisHome.element = document.querySelector(select.widgets.carousel);
    //eslint-disable-next-line no-undef
    thisHome.flkty = new Flickity(thisHome.element, {
      //options
      cellAlign: 'left',
      contain: true,
      autoPlay: true,
      prevNextButtons: false,
      wrapAround: true,
    });
  }

  initActions(){
    const thisHome = this;
    
    thisHome.dom.orderOnline.addEventListener('click', function(event){
      event.preventDefault();
    });
    
    thisHome.dom.bookTable.addEventListener('click', function(event){
      event.preventDefault();
    });
  }
    
  navigate(){
    const thisHome = this;
    
    thisHome.dom.bookTable.addEventListener('click', function(){
      app.activatePage('booking');
      window.location.hash = '/#booking';
    });
    
    thisHome.dom.orderOnline.addEventListener('click', function(){
      app.activatePage('order');
      window.location.hash = '/#order';
    });
  }
}
  
export default Home; 