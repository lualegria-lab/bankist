'use strict';

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;
const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

const accounts = window.bankistData.getAccounts();
let currentAccount = window.bankistData.findAccount(
  accounts,
  sessionStorage.getItem(window.bankistData.currentUserKey)
);

const redirectHome = function (message, isError = false) {
  sessionStorage.removeItem(window.bankistData.currentUserKey);
  window.bankistData.setFlashMessage(message, isError);
  window.location.replace('index.html');
};

if (!currentAccount) {
  redirectHome('Please log in to open your dashboard.', true);
} else {
  const clientSessionWelcome = document.querySelector(
    '.client-session__welcome'
  );
  const btnClientLogout = document.querySelector('.client-session__logout');
  const labelDashboardDate = document.querySelector('.bankapp__date');
  const labelDashboardBalance = document.querySelector(
    '.bankapp__balance-value'
  );
  const labelSumIn = document.querySelector('.bankapp__summary-value--in');
  const labelSumOut = document.querySelector('.bankapp__summary-value--out');
  const labelSumInterest = document.querySelector(
    '.bankapp__summary-value--interest'
  );
  const labelTimer = document.querySelector('.bankapp__timer-value');
  const labelTransferMessage = document.querySelector(
    '.bankapp__message--transfer'
  );
  const labelLoanMessage = document.querySelector('.bankapp__message--loan');
  const labelCloseMessage = document.querySelector('.bankapp__message--close');
  const containerMovements = document.querySelector('.bankapp__movements');
  const btnSort = document.querySelector('.bankapp__sort');
  const inputTransferTo = document.querySelector('.bankapp__input--to');
  const inputTransferAmount = document.querySelector(
    '.bankapp__input--amount'
  );
  const inputLoanAmount = document.querySelector(
    '.bankapp__input--loan-amount'
  );
  const inputCloseUsername = document.querySelector(
    '.bankapp__input--close-user'
  );
  const inputClosePin = document.querySelector('.bankapp__input--close-pin');

  let logoutTimer;
  let sorted = false;

  const formatMovementDate = function (date, locale) {
    const calcDaysPassed = (date1, date2) =>
      Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
    const daysPassed = calcDaysPassed(new Date(), date);

    if (daysPassed === 0) return 'Today';
    if (daysPassed === 1) return 'Yesterday';
    if (daysPassed <= 7) return `${daysPassed} days ago`;

    return new Intl.DateTimeFormat(locale).format(date);
  };

  const formatCurrency = function (value, locale, currency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  };

  const displayMovements = function (acc, sort = false) {
    containerMovements.innerHTML = '';

    const combinedMovementsDates = acc.movements.map((movement, i) => ({
      movement,
      movementDate: acc.movementsDates.at(i),
    }));

    if (sort) {
      combinedMovementsDates.sort((a, b) => a.movement - b.movement);
    }

    combinedMovementsDates.forEach(function ({ movement, movementDate }, i) {
      const type = movement > 0 ? 'deposit' : 'withdrawal';
      const date = new Date(movementDate);
      const displayDate = formatMovementDate(date, acc.locale);
      const formattedMovement = formatCurrency(
        movement,
        acc.locale,
        acc.currency
      );

      const html = `
        <div class="bankapp__movement-row">
          <div class="bankapp__movement-type bankapp__movement-type--${type}">
            ${i + 1} ${type}
          </div>
          <div class="bankapp__movement-date">${displayDate}</div>
          <div class="bankapp__movement-value">${formattedMovement}</div>
        </div>`;

      containerMovements.insertAdjacentHTML('afterbegin', html);
    });
  };

  const calcPrintBalance = function (acc) {
    acc.balance = acc.movements.reduce(
      (total, movement) => total + movement,
      0
    );
    labelDashboardBalance.textContent = formatCurrency(
      acc.balance,
      acc.locale,
      acc.currency
    );
  };

  const calcDisplaySummary = function (acc) {
    const incomes = acc.movements
      .filter(movement => movement > 0)
      .reduce((total, movement) => total + movement, 0);
    labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);

    const out = acc.movements
      .filter(movement => movement < 0)
      .reduce((total, movement) => total + movement, 0);
    labelSumOut.textContent = formatCurrency(
      Math.abs(out),
      acc.locale,
      acc.currency
    );

    const interest = acc.movements
      .filter(movement => movement > 0)
      .map(deposit => (deposit * acc.interestRate) / 100)
      .filter(interestValue => interestValue >= 1)
      .reduce((total, interestValue) => total + interestValue, 0);
    labelSumInterest.textContent = formatCurrency(
      interest,
      acc.locale,
      acc.currency
    );
  };

  const updateDashboard = function (acc) {
    displayMovements(acc, sorted);
    calcPrintBalance(acc);
    calcDisplaySummary(acc);
  };

  const displayOperationMessage = function (label, message, isError = false) {
    label.textContent = message;
    label.classList.add('bankapp__message--visible');
    label.classList.toggle('bankapp__message--error', isError);
  };

  const clearOperationMessages = function () {
    [labelTransferMessage, labelLoanMessage, labelCloseMessage].forEach(
      function (label) {
        label.textContent = '';
        label.classList.remove(
          'bankapp__message--visible',
          'bankapp__message--error'
        );
      }
    );
  };

  const startLogoutTimer = function () {
    let time = 300;

    const tick = function () {
      const minutes = String(Math.trunc(time / 60)).padStart(2, '0');
      const seconds = String(time % 60).padStart(2, '0');
      labelTimer.textContent = `${minutes}:${seconds}`;

      if (time === 0) {
        clearInterval(logoutTimer);
        redirectHome('Session expired. Please log in again.');
        return;
      }

      time--;
    };

    tick();
    return setInterval(tick, 1000);
  };

  const resetLogoutTimer = function () {
    clearInterval(logoutTimer);
    logoutTimer = startLogoutTimer();
  };

  const initDashboard = function () {
    clientSessionWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    const now = new Date();
    labelDashboardDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      {
        hour: 'numeric',
        minute: 'numeric',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long',
      }
    ).format(now);

    clearOperationMessages();
    updateDashboard(currentAccount);
    resetLogoutTimer();

    window.requestAnimationFrame(function () {
      document
        .querySelector('#section--client')
        .scrollIntoView({ behavior: scrollBehavior });
    });
  };

  btnClientLogout.addEventListener('click', function () {
    clearInterval(logoutTimer);
    redirectHome('Logged out.');
  });

  document
    .querySelector('.bankapp__form--transfer')
    .addEventListener('submit', function (e) {
      e.preventDefault();

      const amount = Number(inputTransferAmount.value);
      const receiverAcc = window.bankistData.findAccount(
        accounts,
        inputTransferTo.value.trim().toLowerCase()
      );

      inputTransferAmount.value = inputTransferTo.value = '';

      if (
        amount > 0 &&
        receiverAcc &&
        currentAccount.balance >= amount &&
        receiverAcc.username !== currentAccount.username
      ) {
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);
        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAcc.movementsDates.push(new Date().toISOString());

        window.bankistData.saveAccounts(accounts);
        displayOperationMessage(labelTransferMessage, 'Transfer completed.');
        updateDashboard(currentAccount);
        resetLogoutTimer();
        return;
      }

      displayOperationMessage(labelTransferMessage, 'Transfer denied.', true);
    });

  document
    .querySelector('.bankapp__form--loan')
    .addEventListener('submit', function (e) {
      e.preventDefault();

      const amount = Math.floor(Number(inputLoanAmount.value));
      inputLoanAmount.value = '';

      if (
        amount > 0 &&
        currentAccount.movements.some(movement => movement >= amount * 0.1)
      ) {
        const loanAccount = currentAccount;
        displayOperationMessage(labelLoanMessage, 'Loan request pending.');
        resetLogoutTimer();

        setTimeout(function () {
          if (
            currentAccount !== loanAccount ||
            !accounts.includes(loanAccount)
          ) {
            return;
          }

          loanAccount.movements.push(amount);
          loanAccount.movementsDates.push(new Date().toISOString());

          window.bankistData.saveAccounts(accounts);
          displayOperationMessage(labelLoanMessage, 'Loan approved.');
          updateDashboard(loanAccount);
          resetLogoutTimer();
        }, 2500);
        return;
      }

      displayOperationMessage(labelLoanMessage, 'Loan denied.', true);
    });

  document
    .querySelector('.bankapp__form--close')
    .addEventListener('submit', function (e) {
      e.preventDefault();

      const username = inputCloseUsername.value.trim().toLowerCase();
      const pin = Number(inputClosePin.value);

      inputCloseUsername.value = inputClosePin.value = '';

      if (username === currentAccount.username && pin === currentAccount.pin) {
        const accountIndex = accounts.findIndex(
          acc => acc.username === currentAccount.username
        );

        accounts.splice(accountIndex, 1);
        window.bankistData.saveAccounts(accounts);
        clearInterval(logoutTimer);
        redirectHome('Account closed.');
        return;
      }

      displayOperationMessage(labelCloseMessage, 'Account close denied.', true);
    });

  btnSort.addEventListener('click', function (e) {
    e.preventDefault();

    sorted = !sorted;
    displayMovements(currentAccount, sorted);
    resetLogoutTimer();
  });

  initDashboard();
}
