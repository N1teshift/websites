const path = require('path');

module.exports = {
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  localePath: path.resolve('./locales'),
  defaultNS: 'common',
  fallbackNS: [],
  keySeparator: '.',
};
