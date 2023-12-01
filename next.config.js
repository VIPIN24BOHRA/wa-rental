/* eslint-disable import/no-extraneous-dependencies */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  env: {
    FIREBASE_PROJECT_ID: '',
    FIREBASE_API_KEY: '',
    FIREBASE_AUTH_DOMAIN: '',
    FIREBASE_APP_ID: '',
    FIREBASE_MEASUREMENT_ID: '',
    GOOGLE_MAP_API_KEY: 'AIzaSyAUkjFdSmeGbo_jXyYvuY5YSE0Jfcn8t3U',
  },
  eslint: {
    dirs: ['.'],
  },
  async redirects() {
    return [];
  },
  poweredByHeader: false,
  trailingSlash: false,
  basePath: '',
  reactStrictMode: false,
});
