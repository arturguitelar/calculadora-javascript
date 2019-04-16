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

        this._operation = [];
        this._lastOperator = '';
        this._lastNumber = '';

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

        this.setLastNumberToDisplay();
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
                let textBtn = button.className.baseVal.replace("btn-", "");

                this.execBtn(textBtn);
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

    /**
     * Trata as ações de cada botão.
     * 
     * @param {String} value Valor do botão.
     */
    execBtn(value) {
        switch (value) {
            case 'ac':
                this.clearAll();
                break;
        
            case 'ce':
                this.clearEntry();
                break;

            case 'soma':
                this.addOperation('+');
                break;

            case 'subtracao':
                this.addOperation('-');
                break;

            case 'multiplicacao':
                this.addOperation('*');
                break;
                
            case 'divisao':
                this.addOperation('/');
                break;

            case 'porcento':
            this.addOperation('%');
                break;

            case 'igual':
                this.calc();
                break;

            case 'ponto':
                this.addDot();
                break;

            // Nota: Como é o mesmo método para todos os números, coloca-se o break apenas no final
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;

            default:
                this.setError();
                break;
        }
    }

    /**
     * Limpa os dados da memória.
     */
    clearAll() {
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        
        this.setLastNumberToDisplay();
    }

    /**
     * Cancela a última entrada de dados.
     */
    clearEntry() {
        this._operation.pop();
        this.setLastNumberToDisplay();
    }

    /**
     * Adiciona uma operação ao atributo operation.
     * Caso seja um número, este valor é concatenado até que uma próxima operação não seja um número
     * e então adiciona o número concatenado convertido ao atributo operation.
     * 
     * @param {*} value Operação.
     */
    addOperation(value) {        
        if (isNaN(this.getLastOperation())) { // neste caso é string
            if(this.isOperator(value)) {
                // troca o operador caso o valor anterior digitado também seja um operador.
                this.setLastOperation(value);
            } else {
                // então é um número.
                this.pushOperation(value);

                this.setLastNumberToDisplay();
            }
        } else { // neste caso é número
            if(this.isOperator(value)) {
                this.pushOperation(value);
            } else {
                // é necessário converter ambos os valores para strings para que possam ser concatenados
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(parseFloat(newValue));

                this.setLastNumberToDisplay();
            }
        }
    }

    /**
     * Trata a questão do ponto para contas com números decimais.
     * 
     * Caso pressionado ponto com o display zerado, deve apresentar: "0.".
     * Caso a última operação for um operador, deve manter este operador e adicionar um "0.".
     * Caso já haja um número, é preciso criar uma string com este número + ponto e sobreescrever 
     * a mesma posição no array. Ex: "2.3".
     */
    addDot() {
        let lastOperation = this.getLastOperation();

        if (this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation("0.");
        } else {
            this.setLastOperation(lastOperation.toString() + ".");
        }

        this.setLastNumberToDisplay();
    }

    /**
     * Faz o push da operação vigente.
     * Verifica se há mais de 3 elementos.
     * 
     * @param {*} value Operação.
     */
    pushOperation(value) {
        this._operation.push(value);

        if (this._operation.length > 3) {
            this.calc();
        }
    }

    /**
     * Executa o cálculo.
     * Chama o método de atualizar no display.
     * 
     * Nota 1: em uma conta do tipo "2 + 5 +" e for pressionado o botão "=", a calculadora deve 
     * armazenar o último sinal de operação (no caso, o "+") e fazer o próximo
     * calculo levndo em consideração o último operador. Neste caso, faz o cálculo adicionando "5", 
     * o resultado deve ser 13 -> 18 -> 23 e etc.
     * 
     * Nota 2: em uma conta do tipo "2 - 5 + 3" e for pressionado o botão "=", a calculadora deve 
     * armazenar a última operação realizada (no caso, "5 + 3"). Neste caso, faz o cálculo adicionando o "3",
     * o resultado deve ser 6 -> 9 -> 12 e etc.
     */
    calc() {
        
        let last = '';

        this._lastOperator = this.getLastItem();

        /**
         * Menos de 3 elementos em _operation:
         * - guarda o primeiro item
         * - _operation guarda o primeiro item guardado + o último operador digitado + o último número digitado
         */
        if (this._operation.length < 3) {
            let firstItem = this._operation[0];

            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        /**
         * Mais de 3 elementos em _operation:
         * - retira o último elemento
         * - guarda o resultado em _lastNumber 
         */
        if (this._operation.length > 3) {
            last = this._operation.pop();
            
            this._lastNumber = this.getResult();
        } 
        /**
         * São 3 elementos:
         * - o último item é um número
         * - guarda o resultado em _lastNumber
         */
        else if (this._operation.length == 3) {
            this._lastNumber = this.getLastItem(false);
        }

        let result = this.getResult();

        // calculando porcentagem

        if (last == '%') {
            result /= 100;

            // nesta caso não é necessário salvar o '%', pois já foi usado na operação
            this._operation = [result];
        } else {
            // salva o resultado
            this._operation = [result];

            if (last) this._operation.push(last);
        }

        this.setLastNumberToDisplay();
    }

    /**
     * Procura pelo último número digitado no array e mostra o no display.
     * Ignora o que não é número.
     * Caso o valor seja vazio, coloca 0 (zero) no display.
     */
    setLastNumberToDisplay() {
        let lastNumber = this.getLastItem(false);

        if (!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;
    }

    /**
     * Traz o último item digitado.
     * 
     * @param {bool} isOperator default : true
     * 
     * @return Último item.
     */
    getLastItem(isOperator = true) {
        let lastItem;

        // percorre _operation do último ao primeiro, para encontrar o lastItem.
        for (let i = this._operation.length - 1; i >= 0; i--) {
            if (this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }
        }

        // se o último elemento for um operador, mantém.
        if (!lastItem) {
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }

        return lastItem;
    }

    /**
     * "Junta" os índices do array e pega o conteúdo para fazer o cálculo utilizando o
     * método padrão "eval()".
     * Retorna o eval da operação.
     * 
     * @return {eval} Eval da Operação
     */
    getResult() {
        return eval(this._operation.join(""));
    }

    /**
     * Retorna o último valor de operation.
     * 
     * @return {*} Valor.
     */
    getLastOperation() {
        return this._operation[this._operation.length - 1];
    }

    /**
     * Troca o útimo valor do operation pelo valor passado.
     * 
     * @param {*} value 
     */
    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value;
    }

    /**
     * Verifica se o valor é um operador.
     * 
     * @param {String} value Valor.
     * @return {boolean} O valor passado é um operador?
     */
    isOperator(value) {
        return (['+', '-', '*', '/', '%'].indexOf(value) > -1);
    }

    /**
     * Mostra a palavra Error no display.
     */
    setError() {
        this.displayCalc = "Error";
    }
}
