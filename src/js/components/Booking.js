import {templates, select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initTables();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking 
      + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event   
      + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.event   
      + '?' + params.eventsRepeat.join('&')
    }; 
  
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponse){
        const bookingsResponse = allResponse[0];
        const eventsCurrentResponse = allResponse[1];
        const eventsRepeatResponse = allResponse[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]); 
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate,1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.date, item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+= 0.5){

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    // wartości wybierane przez użytkownika 
    thisBooking.date = thisBooking.datePicker.value; 
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    // tego dnia o tej godzinie wszystkie stoliki są dostępne 
    let allAvailable = false; 

    if( //jeśli okaże się ze w obiekcie thisbooking booked dla tej daty nie ma obiektu albo dla daty i godziy nie ma tablicy, oznacza to ze zaden stolik nie jest zajęty
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      //czyli all available sa dostepne = true
      allAvailable = true; 
    }

    //iteruje przez wszystie stoliki widoczne na mapie 
    for(let table of thisBooking.dom.tables){ 

      // pobieramy id aktualnego stolika 
      let tableId = table.getAttribute(settings.booking.tableIdAttribute); 

      //sprawdzamy czy tableId jest liczbą = będzie ona zawsze tekstem
      if(!isNaN(tableId)){ 
        // tekst może zostać przekonwertowany na liczbę, więc tableId wyświetli się przez negacje NaN
        tableId = parseInt(tableId); 
      }

      if(
        // sprawdza czy któryś stolik jest zajęty 
        !allAvailable
        &&
        // czy tego dnia, o tej godzinie, zajęty jest stolik o tym id
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) 
      ){
        //stolik zajety dostanie klase zapisaną w classnames classNames.booking.table.booked
        table.classList.add(classNames.booking.tableBooked); 
        
        // alternatywnie - jesli wszystkie stoliki sa dostepne lu  nie wszystkie sa dostepne ale ten przez ktory iterujemy nie znajduje sie w this booking booked to chcecmy usunac z niego klase table booked, ktora oznacza ze ten stolik jest zajety
      } else { 
        table.classList.remove(classNames.booking.tableBooked);
      }
      table.addEventListener('click', function(){
        table.classList.toggle(classNames.booking.tableBooked);
      });
    }
  }
    

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget(element);
    thisBooking.dom = {};

    thisBooking.dom.wrapper = document.querySelector(select.containerOf.booking);
    
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);

    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.cart.address);
    
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.cart.phone);
    
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  initTables() {
    const thisBooking = this;

    for (let table of thisBooking.dom.tables) {

      table.addEventListener('click', function (event) {
        event.preventDefault();

        if (table.classList.contains('booked')) { 
          alert('not available');

        } else {
          thisBooking.removeSelected();
          table.classList.add(classNames.booking.tableSelected);
          const tableNumber = table.getAttribute(settings.booking.tableIdAttribute);
          thisBooking.bookedTable = parseInt(tableNumber);
        }
      });
    }
  }
  
  removeSelected(){
    const thisBooking = this;

    const selectedTables = document.querySelectorAll('.selected');
    
    for(let selected of selectedTables){
      selected.classList.remove(classNames.booking.tableSelected);
    }
    
    delete thisBooking.bookedTable;
  }
  
  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.bookedTable,
      ppl: parseInt(thisBooking.peopleAmount.value),
      duration: parseInt(thisBooking.hoursAmount.value),
      hoursAmount: thisBooking.hoursAmount.value,
      starters: [],
      address: thisBooking.dom.address.value,
      phone: thisBooking.dom.phone.value,
    };

    for(let starter of thisBooking.dom.starters){
      if(starter.checked == true){
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log(parsedResponse);
      });
  }

}

export default Booking;