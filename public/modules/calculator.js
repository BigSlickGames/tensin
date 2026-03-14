(function() {
  let display = null;
  let currentValue = '0';
  let previousValue = null;
  let operation = null;
  let shouldResetScreen = false;

  function start(container) {
    currentValue = '0';
    previousValue = null;
    operation = null;
    shouldResetScreen = false;

    container.innerHTML = `
      <div class="game-container">
        <h2 class="game-title">Calculator</h2>
        <p class="game-subtitle">Quick calculations on the go</p>

        <div class="calculator-wrapper">
          <div class="calculator-display" id="calc-display">0</div>

          <div class="calculator-grid">
            <button class="calc-button calc-function" data-action="clear">AC</button>
            <button class="calc-button calc-function" data-action="toggle-sign">+/-</button>
            <button class="calc-button calc-function" data-action="percent">%</button>
            <button class="calc-button calc-operator" data-action="divide">÷</button>

            <button class="calc-button calc-number" data-number="7">7</button>
            <button class="calc-button calc-number" data-number="8">8</button>
            <button class="calc-button calc-number" data-number="9">9</button>
            <button class="calc-button calc-operator" data-action="multiply">×</button>

            <button class="calc-button calc-number" data-number="4">4</button>
            <button class="calc-button calc-number" data-number="5">5</button>
            <button class="calc-button calc-number" data-number="6">6</button>
            <button class="calc-button calc-operator" data-action="subtract">−</button>

            <button class="calc-button calc-number" data-number="1">1</button>
            <button class="calc-button calc-number" data-number="2">2</button>
            <button class="calc-button calc-number" data-number="3">3</button>
            <button class="calc-button calc-operator" data-action="add">+</button>

            <button class="calc-button calc-number calc-zero" data-number="0">0</button>
            <button class="calc-button calc-number" data-action="decimal">.</button>
            <button class="calc-button calc-equals" data-action="equals">=</button>
          </div>
        </div>
      </div>
    `;

    display = container.querySelector('#calc-display');

    const numberButtons = container.querySelectorAll('[data-number]');
    numberButtons.forEach(button => {
      button.addEventListener('click', () => handleNumber(button.dataset.number));
    });

    const operatorButtons = container.querySelectorAll('[data-action]');
    operatorButtons.forEach(button => {
      button.addEventListener('click', () => handleAction(button.dataset.action));
    });

    if (window.TelegramAdapter) {
      window.TelegramAdapter.haptic('impact', 'light');
    }
  }

  function handleNumber(num) {
    if (window.TelegramAdapter) {
      window.TelegramAdapter.haptic('impact', 'light');
    }

    if (shouldResetScreen) {
      currentValue = num;
      shouldResetScreen = false;
    } else {
      currentValue = currentValue === '0' ? num : currentValue + num;
    }

    updateDisplay();
  }

  function handleAction(action) {
    if (window.TelegramAdapter) {
      window.TelegramAdapter.haptic('impact', 'medium');
    }

    switch(action) {
      case 'clear':
        currentValue = '0';
        previousValue = null;
        operation = null;
        shouldResetScreen = false;
        break;

      case 'toggle-sign':
        currentValue = String(parseFloat(currentValue) * -1);
        break;

      case 'percent':
        currentValue = String(parseFloat(currentValue) / 100);
        break;

      case 'decimal':
        if (!currentValue.includes('.')) {
          currentValue += '.';
        }
        break;

      case 'add':
      case 'subtract':
      case 'multiply':
      case 'divide':
        handleOperation(action);
        break;

      case 'equals':
        calculate();
        break;
    }

    updateDisplay();
  }

  function handleOperation(nextOperation) {
    const inputValue = parseFloat(currentValue);

    if (previousValue === null) {
      previousValue = inputValue;
    } else if (operation) {
      const result = performCalculation();
      currentValue = String(result);
      previousValue = result;
    }

    shouldResetScreen = true;
    operation = nextOperation;
  }

  function calculate() {
    const inputValue = parseFloat(currentValue);

    if (previousValue !== null && operation) {
      const result = performCalculation();
      currentValue = String(result);
      previousValue = null;
      operation = null;
      shouldResetScreen = true;

      if (window.TelegramAdapter) {
        window.TelegramAdapter.haptic('impact', 'heavy');
      }
    }
  }

  function performCalculation() {
    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);

    switch(operation) {
      case 'add':
        return prev + current;
      case 'subtract':
        return prev - current;
      case 'multiply':
        return prev * current;
      case 'divide':
        return current !== 0 ? prev / current : 0;
      default:
        return current;
    }
  }

  function updateDisplay() {
    let displayValue = currentValue;

    if (displayValue.length > 12) {
      const num = parseFloat(displayValue);
      displayValue = num.toExponential(6);
    }

    display.textContent = displayValue;
  }

  function stop() {
    currentValue = '0';
    previousValue = null;
    operation = null;
    shouldResetScreen = false;
  }

  window.ModuleRegistry.register({
    id: 'calculator',
    name: 'Calculator',
    icon: '🔢',
    type: 'utility',
    description: 'Simple calculator for quick math',
    start: start,
    stop: stop
  });
})();
