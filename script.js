'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

///////////////////////////////////////////////////////////////////GLOBAL VARIABLES
const NUM_DISPLAY_DIGITS = 2; // TODO fix so calculations happen with a lot of digits but are displayed only as 2. Maybe this is already the case.

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
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
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const movType = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${movType}">${i + 1}</div>
      <div class="movements__date">3 Days ago</div>
      <div class="movements__value">${mov.toFixed(NUM_DISPLAY_DIGITS)}€</div>
    </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce(function (acc, mov) {
    return acc + mov;
  }, 0);

  labelBalance.textContent = `${acc.balance.toFixed(NUM_DISPLAY_DIGITS)}€`;
};

const calcDisplaySummary = function (acc) {
  const totalIncome = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${totalIncome.toFixed(NUM_DISPLAY_DIGITS)}€`;

  const totalWithdrawals = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(totalWithdrawals).toFixed(
    NUM_DISPLAY_DIGITS
  )}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * (acc.interestRate / 100))
    .filter(interest => interest >= 1)
    .reduce((acc, interest) => acc + interest, 0);
  labelSumInterest.textContent = `${interest.toFixed(NUM_DISPLAY_DIGITS)}€`;
};

const createUsernames = function (accs) {
  accounts.forEach(function (account, i) {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcct = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcct &&
    currentAccount.balance >= amount &&
    receiverAcct.username !== currentAccount.userName
  ) {
    // Transfer the money
    currentAccount.movements.push(-amount);
    receiverAcct.movements.push(amount);
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  console.log(amount);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    console.log('loan approved.');

    // Add movement
    currentAccount.movements.push(amount);

    console.log('check');

    // UpdateUI
    updateUI(currentAccount);
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  console.log(accounts);

  // confirm username and pin
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    // delete user from data
    const indexToDelete = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(indexToDelete, indexToDelete + 1);

    // hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let movementsSorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentAccount.movements, !movementsSorted);
  movementsSorted = !movementsSorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// CONVERTING AND CHECKING NUMBERS

console.log(23 === 23.0);
console.log(0.1 + 0.2);

// convert strings to numbers with +
console.log(Number('23'));
console.log(+'23');

// parsing a number from a string
console.log(Number.parseInt('30px', 10));
console.log(Number.parseInt('e23', 10));
console.log(Number.parseInt('2.3cm', 10));

// NaN
console.log(Number.isNaN(20)); // true
console.log(Number.isNaN('20')); // false
console.log(Number.isNaN(+'20x')); // true
console.log(Number.isNaN(10 / 0)); // false

// isFinite - checks if it's a number AND finite
console.log(Number.isFinite(20)); // true
console.log(Number.isFinite('20')); // false
console.log(Number.isFinite(10 / 0));

// Checking if value is integer
console.log(Number.isInteger(23)); // true
console.log(Number.isInteger(23.0)); // true
console.log(Number.isInteger(10 / 0)); // false

// MATH AND ROUNDING
// square roots
console.log(Math.sqrt(25)); // square root
console.log(25 ** (1 / 2)); // square root
console.log(8 ** (1 / 3)); // cube root

// Math.max()
console.log(Math.max(5, 18, 23, 11, 2)); // 23
console.log(Math.max(5, 18, '23', 11, 2)); // 23
console.log(Math.max(5, 18, '23px', 11, 2)); // NaN

// Math.min()
console.log(Math.min(5, 18, 23, 11, 2)); // 2

// area of circle
console.log(Math.PI * Number.parseFloat('10px') ** 2);

// Random number from 1 to 6
console.log(Math.trunc(Math.random() * 6) + 1);
// we have to do + 1 because truncating rounds down

// function to generate random integer from min to max
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);
console.log(randomInt(100, 101));

// Rounding Integers
console.log(Math.round(22.3)); // prints 22
console.log(Math.round(22.3)); // prints 22

console.log(Math.ceil(22.3)); // prints 23
console.log(Math.ceil(22.3)); // prints 23

console.log(Math.floor(22.3)); // prints 22
console.log(Math.floor('22.3')); // does type coercion, so prints 22

// trunc rounds towards 0, while floor rounds down and ceil rounds up
console.log(Math.trunc(-22.9)); // prints -22
console.log(Math.floor(-22.9)); // prints -23

// Rounding decimals
console.log((2.7).toFixed(0)); // returns the number rounded to n decimal places. Note: returns a string, not a number.
console.log((2.7).toFixed(0)); // prints 3 as string
console.log((2.345).toFixed(3)); // prints 2.345 as string
console.log((2.345).toFixed(2)); // prints 2.35 as string
console.log(+(2.345).toFixed(2)); // prints 2.35 as number
// primitives don't have methods, so JavaScript uses "boxing", where it transforms it to a number object, then does the operation, then converts it back to a primitive

// THE REMAINDER OPERATOR / MODULO OPERATOR
console.log(5 % 2); // prints remainder of 5 / 2, or 1
console.log(5 / 2); // 5 = 2 * 2 + 1

// make every second row orange-red
labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
  });
});

// Numeric Separators

// 287,460,000,000
const diameter = 287_460_000_000; // makes it easy to see what number it is
console.log(diameter); // prints without separators

// we can use the numeric separator wherever we want to give meaning, but it won't be printed
const priceCents = 345_99;
console.log(priceCents); // prints without separators

const transferFee = 15_00; // looks like $15.00
const transferFee2 = 1_500; // looks like $1,500

console.log(Number['230_000']); // prints undefined, can only use numeric separators in numeric data types. Don't use these in data you store in APIs because JavaScript can't parse the numbers correctly.

// BigInt

// we have 64-bit numbers - 53 bits for the number and the rest for sign and decimal position
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
// These numbers don't get correctly represented
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);
