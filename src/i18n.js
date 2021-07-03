import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-xhr-backend'
import { initReactI18next } from 'react-i18next'

import vn from './asset/translation/vn.json'
import en from './asset/translation/en.json'

// // the translations
// const resources = {
//     vn: {
//         translation: vn
//     },
//     en: {
//         translation: en
//     }
// };
i18n.use(Backend)
    .use(LanguageDetector) // passes i18n down to react-i18next
    .use(initReactI18next)
    .init({
        // resources,
        fallbackLng: 'vn',
        debug: false,

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    })

i18n.addResourceBundle('vn', 'translation', vn, true, true)
i18n.addResourceBundle('en', 'translation', en, true, true)

export default i18n

// import i18n from 'i18next';
// import Backend from 'i18next-xhr-backend';
// import LanguageDetector from 'i18next-browser-languagedetector';
// import { initReactI18next } from 'react-i18next';

// i18n
//   // load translation using xhr -> see /public/locales
//   // learn more: https://github.com/i18next/i18next-xhr-backend
//   .languages("vn", "en")
//   .use(Backend)
//   // detect user language
//   // learn more: https://github.com/i18next/i18next-browser-languageDetector
//   .use(LanguageDetector)
//   // pass the i18n instance to react-i18next.
//   .use(initReactI18next)
//   // init i18next
//   // for all options read: https://www.i18next.com/overview/configuration-options
//   .init({
//     resources: {
//       en: ,
//       vn:
//     },
//     debug: false,
//     interpolation: {
//       escapeValue: false, // not needed for react as it escapes by default
//     },
//   });
// console.log(i18n)
// i18n.setDefaultNamespace('en-US')

// export default i18n;
