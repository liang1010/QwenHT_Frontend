import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localCurrency',
  standalone: false,
  pure: false
})
export class LocalCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, locale?: string): string {
  if (value == null) {
    value = 0;
  }

  const effectiveLocale = locale || navigator.language || 'en-MY';
  const currencyCode = this.getCurrencyForLocale(effectiveLocale);

  const formatter = new Intl.NumberFormat(effectiveLocale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currencyDisplay: 'code' // MYR instead of RM
  });

  const parts = formatter.formatToParts(value);

  const currency = parts.find(p => p.type === 'currency')?.value ?? currencyCode;
  const number = parts
    .filter(p => p.type !== 'currency' && p.type !== 'literal')
    .map(p => p.value)
    .join('');

  // 👉 pad numeric part to 5 digits before decimal
  const paddedNumber = this.padNumber(number, 5);

  return `${currency} ${paddedNumber}`;
}private padNumber(formatted: string, digitWidth: number): string {
  const [integer, decimal] = formatted.split('.');
  const paddedInt = integer.padStart(digitWidth, ' ');
  return `${paddedInt}.${decimal}`;
}

  private getCurrencyForLocale(locale: string): string {
    // Map common locales to their currencies
    const localeCurrencyMap: { [key: string]: string } = {
      // // US
      // 'en-US': 'MYR',
      // // UK
      // 'en-GB': 'GBP',
      // // EU
      // 'de-DE': 'EUR',
      // 'fr-FR': 'EUR',
      // 'es-ES': 'EUR',
      // 'it-IT': 'EUR',
      // 'nl-NL': 'EUR',
      // // Asia
      // 'ja-JP': 'JPY',
      // 'ko-KR': 'KRW',
      // 'zh-CN': 'CNY',
      // 'zh-TW': 'TWD',
      // 'th-TH': 'THB',
      // 'vi-VN': 'VND',
      // // Others
      // 'en-AU': 'AUD',
      // 'en-CA': 'CAD',
      // 'en-SG': 'SGD',
      // 'en-IN': 'INR',
      // 'pt-BR': 'BRL',
      // 'ru-RU': 'RUB'
    };

    return localeCurrencyMap[locale] || 'MYR'; // Default to USD
  }
}
