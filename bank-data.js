'use strict';

(function () {
  const accountsKey = 'bankist.accounts';
  const currentUserKey = 'bankist.currentUser';
  const flashMessageKey = 'bankist.flashMessage';

  const daysAgo = days =>
    new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const createUsernames = function (accs) {
    accs.forEach(function (acc) {
      acc.username = acc.owner
        .toLowerCase()
        .split(' ')
        .map(name => name[0])
        .join('');
    });
  };

  const createInitialAccounts = function () {
    const accounts = [
      {
        owner: 'Jonas Schmedtmann',
        movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
        interestRate: 1.2,
        pin: 1111,
        movementsDates: [
          '2019-11-18T21:31:17.178Z',
          '2019-12-23T07:42:02.383Z',
          '2020-01-28T09:15:04.904Z',
          '2020-04-01T10:17:24.185Z',
          '2020-05-08T14:11:59.604Z',
          '2020-05-27T17:01:17.194Z',
          daysAgo(6),
          daysAgo(2),
        ],
        currency: 'EUR',
        locale: 'pt-PT',
      },
      {
        owner: 'Jessica Davis',
        movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
        interestRate: 1.5,
        pin: 2222,
        movementsDates: [
          '2019-11-01T13:15:33.035Z',
          '2019-11-30T09:48:16.867Z',
          '2019-12-25T06:04:23.907Z',
          '2020-01-25T14:18:46.235Z',
          '2020-02-05T16:33:06.386Z',
          '2020-04-10T14:43:26.374Z',
          '2020-06-25T18:49:59.371Z',
          daysAgo(1),
        ],
        currency: 'USD',
        locale: 'en-US',
      },
    ];

    createUsernames(accounts);
    return accounts;
  };

  const isValidAccounts = function (accounts) {
    return (
      Array.isArray(accounts) &&
      accounts.every(
        acc =>
          typeof acc.owner === 'string' &&
          Array.isArray(acc.movements) &&
          Array.isArray(acc.movementsDates) &&
          typeof acc.pin === 'number'
      )
    );
  };

  const saveAccounts = function (accounts) {
    sessionStorage.setItem(accountsKey, JSON.stringify(accounts));
  };

  const getAccounts = function () {
    try {
      const storedAccounts = JSON.parse(sessionStorage.getItem(accountsKey));

      if (isValidAccounts(storedAccounts)) {
        createUsernames(storedAccounts);
        return storedAccounts;
      }
    } catch {
      sessionStorage.removeItem(accountsKey);
    }

    const accounts = createInitialAccounts();
    saveAccounts(accounts);
    return accounts;
  };

  const findAccount = function (accounts, username) {
    return accounts.find(acc => acc.username === username);
  };

  const setFlashMessage = function (message, isError = false) {
    sessionStorage.setItem(
      flashMessageKey,
      JSON.stringify({ message, isError })
    );
  };

  const consumeFlashMessage = function () {
    const rawMessage = sessionStorage.getItem(flashMessageKey);
    if (!rawMessage) return null;

    sessionStorage.removeItem(flashMessageKey);

    try {
      return JSON.parse(rawMessage);
    } catch {
      return null;
    }
  };

  window.bankistData = {
    currentUserKey,
    getAccounts,
    saveAccounts,
    findAccount,
    setFlashMessage,
    consumeFlashMessage,
  };
})();
