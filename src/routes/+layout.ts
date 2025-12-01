import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ url }) => {
  // Read ?lang=no|en from URL; default 'no'
  const langParam = url.searchParams.get('lang');
  const lang = (langParam === 'en' ? 'en' : 'no') as 'no' | 'en';
  return { lang };
};
