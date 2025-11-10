import { createI18n } from 'vue-i18n';
import fa from '~/i18n/fa.json';
import en from '~/i18n/en.json';

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = createI18n({
    legacy: false,
    locale: 'fa',
    messages: { fa, en }
  });
  // RTL switch
  watchEffect(() => {
    const l = i18n.global.locale.value;
    document.documentElement.setAttribute('dir', l === 'fa' ? 'rtl' : 'ltr');
  });
  nuxtApp.vueApp.use(i18n);
});