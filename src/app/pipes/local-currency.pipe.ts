import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localCurrency',
  standalone: false,
  pure: false
})
export class LocalCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, locale?: string): string {
    if (value == null || value === undefined) {
      value = 0;
    }

    // Use provided locale or detect from browser
    const effectiveLocale = locale || navigator.language || 'en-US';

    // Determine the currency based on the locale
    const currencyCode = this.getCurrencyForLocale(effectiveLocale);

    // Format the value with the appropriate currency
    const formatter = new Intl.NumberFormat(effectiveLocale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return formatter.format(value);
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
