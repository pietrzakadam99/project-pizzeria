class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  // metoda wykonywana przy kazdym odczytaniu wartosci wlasciowosci value 
  get value(){
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  // metoda wykonywana przy kazdej probie ustawienia nowej wartosci wlasciwosci value 
  set value(value){
    const thisWidget = this;
          
    const newValue = thisWidget.parseValue(value);
    /* TODO: Add validation */
    /* thisWidget.correctValue zmieni się tylko wtedy, jeśli nowa wpisana w input wartość będzie inna niż obecna, ustala czy to co wpisano w input jest faktycznie liczbą */
    if(newValue !== thisWidget.correctValue && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
    
    
    thisWidget.renderValue();
  }

  setValue(value){
    const thisWidget = this;

    thisWidget.value = value;

  }

  parseValue(value){
    return parseInt(value);
  }
    
  isValid(value){
    return !isNaN(value);
  }

  renderValue(){
    const thisWidget = this;
    
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce(){
    const thisWidget = this;
      
    // event emitowany na dispatchEvent oraz na jego rodzicu, dziadku a do window (propagacja)
    const event = new CustomEvent('updated' , {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;