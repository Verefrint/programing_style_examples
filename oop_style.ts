type PaymentProvider = {
  pay(amount: number): void;
  getBalance(): number;
};

type Hooks = {
  beforePay?: (amount: number) => void;
  afterPay?: (amount: number) => void;
};

function createPaymentProvider(
  initialBalance: number,
  hooks: Hooks = {}
): PaymentProvider {
  if (initialBalance < 0) {
    throw new Error("Начальный баланс не может быть отрицательным");
  }

  let balance = initialBalance; // состояние в замыкании

  function validateAmount(amount: number) {
    if (amount <= 0) throw new Error("Сумма должна быть больше нуля");
    if (amount > balance) throw new Error("Недостаточно средств");
  }

  function pay(amount: number) {
    validateAmount(amount);
    hooks.beforePay?.(amount);
    balance -= amount;
    hooks.afterPay?.(amount);
  }

  function getBalance() {
    return balance;
  }

  return { pay, getBalance };
}

// использование
const cardFn = createPaymentProvider(1000, {
  beforePay: (a) => console.log(`Проверка карты перед оплатой ${a}`),
  afterPay: (a) => console.log(`С карты списано ${a}`)
});

cardFn.pay(200);
console.log(cardFn.getBalance());

