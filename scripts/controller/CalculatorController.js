class CalculatorController
{
    constructor() {
        // elementos do dom
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");

        // props
        this._locale = 'pt-BR';
        this._currentDate;

        // methods
        this.init();
        this.initButtonEvents();
    }

    init() {       
        // seta e atualiza data e hora da calculadora
        this.setDisplayDateTime();

        setInterval(()=>{
            this.setDisplayDateTime();
        }, 1000);
    }

    /* Getters e Setters - inicio */
    get displayCalc() {
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value) {
        this._displayCalcEl.innerHTML = value;
    }

    get currentDate() {
        return new Date();
    }

    set currentDate(value) {
        this._currentDate = value;
    }

    get displayTime() {
        return this._timeEl.innerHTML;
    }

    set displayTime(value) {
        this._timeEl.innerHTML = value;
    }

    get displayDate() {
        return this._dateEl.innerHTML;
    }

    set displayDate(value) {
        this._dateEl.innerHTML = value;
    }
    /* Getters e Setters - fim */

    /* Methods */
    /**
     * Mostra data e hora no display.
     */
    setDisplayDateTime() {
        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    /**
     * Inicia Eventos nos botões.
     */
    initButtonEvents() {
        let buttons = document.querySelectorAll('#buttons > g, #parts > g');

        // adiciona eventos para cada botão
        buttons.forEach((button, index) => {
            this.addEventListenerAll(button, 'click drag', event => {
                console.log(button.className.baseVal.replace("btn-", ""), index);
            });

            this.addEventListenerAll(button, 'mouseover mouseup mousedown', event => {
                button.style.cursor = 'pointer';
            });
        });        
    }

    /**
     * Possibilita colocar mais de um evento em um elemento.
     * 
     * @param element Elemento que receberá os eventos.
     * @param events String com eventos separados por espaço.
     * @param fn Função de callback que será executada ao acionar o evento.
     */
    addEventListenerAll(element, events, fn) {
        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false);
        });
    }    

}
