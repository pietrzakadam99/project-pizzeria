import {settings, select} from '/js/settings.js';

class AmountWidget{
  constructor(element){
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value);

    thisWidget.initActions();
  }

  getElements(element){
    const thisWidget = this;
    
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;
    /* póki co ta metoda zapisuje tylko właściwości thisWidget.value wartość przekazanego argumentu, po przekonwertowaniu go na liczbę a potem aktualizuje wartość inputu */
      
    const newValue = parseInt(value);
    thisWidget.value = settings.amountWidget.defaultValue;
    /* TODO: Add validation */
    /* thisWidget.value zmieni się tylko wtedy, jeśli nowa wpisana w input wartość będzie inna niż obecna, ustala czy to co wpisano w input jest faktycznie liczbą */
    if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
      thisWidget.value = newValue;
      //thisWidget.announce();
    }

    thisWidget.announce();
    thisWidget.input.value = thisWidget.value;
  }

  initActions(){
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value -1);
    });

    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value +1);
    });
  }
      
  announce(){
    const thisWidget = this;
  
    // event emitowany na dispatchEvent oraz na jego rodzicu, dziadku a do window (propagacja)
    const event = new CustomEvent('updated' , {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;