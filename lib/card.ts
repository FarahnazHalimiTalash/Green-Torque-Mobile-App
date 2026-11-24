export function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

export function formatCardNumber(value: string) {
  const digits = digitsOnly(value).slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function luhnOk(number: string) {
  let sum = 0;
  let alt = false;
  for (let i = number.length - 1; i >= 0; i -= 1) {
    let n = Number(number[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return number.length >= 13 && number.length <= 19 && sum % 10 === 0;
}

export function cardBrand(number: string) {
  if (/^4/.test(number)) return 'Visa';
  if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return 'Mastercard';
  if (/^3[47]/.test(number)) return 'American Express';
  if (/^6(?:011|5)/.test(number)) return 'Discover';
  return 'Card';
}

export function tokenizeCard(input: {
  cardNumber: string;
  expMonth: string | number;
  expYear: string | number;
  cardholderName: string;
  cvc?: string;
}) {
  const number = digitsOnly(input.cardNumber);
  const name = input.cardholderName.trim();
  const month = Number(input.expMonth);
  const yearRaw = Number(input.expYear);
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
  if (!luhnOk(number)) {
    throw new Error('Check the card number.');
  }
  if (!name) {
    throw new Error('Enter the name on the card.');
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error('Check the expiration month.');
  }
  const now = new Date();
  if (!Number.isInteger(year) || year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
    throw new Error('This card is expired.');
  }
  const cvc = digitsOnly(input.cvc ?? '');
  if (input.cvc != null && input.cvc !== '' && (cvc.length < 3 || cvc.length > 4)) {
    throw new Error('Check the security code.');
  }
  return {
    brand: cardBrand(number),
    last4: number.slice(-4),
    expMonth: month,
    expYear: year,
    cardholderName: name,
  };
}

export function paymentMethodLabel(method: { brand: string; last4: string }) {
  return `${method.brand} •••• ${method.last4}`;
}
