import {getRequestConfig} from 'next-intl/server';
import {routing} from './i18n/routing';

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // パスを絶対パス（@/..）的に指定して曖昧さを排除します
    messages: (await import(`./messages/${locale}.json`)).default
  };
});