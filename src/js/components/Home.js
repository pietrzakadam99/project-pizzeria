import {templates, select} from './../settings.js';
import {app} from '../app.js';

class Home {
  constructor(element){
  
    const thisHome = this;
  
    thisHome.render(element);
    thisHome.initWidgets();

    thisHome.navigate();
  }
  
  render(wrapper){
    const thisHome = this;

    const generatedHTML = templates.homeWidget();

    thisHome.dom = {};

    thisHome.dom.wrapper = wrapper;

    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.navLinks = thisHome.dom.wrapper.querySelectorAll(select.home.mainOptions);
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
  

    window.onload = function () {
      thisHome.flkty.resize();
    };
  }
    
  navigate(){
    const thisHome = this;
    
    app.initNavLinks(thisHome.dom.navLinks);
  }
}
  
export default Home; 