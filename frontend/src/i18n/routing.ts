import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ja'],
  defaultLocale: 'ja',
  // localePrefixが'always'なら必ず /ja がつく。SEO重視ならこれ。
  localePrefix: 'always'
});

export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);