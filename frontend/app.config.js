const dotenv = require('dotenv');
const { resolve } = require('path');

// Load env from frontend/.env if present
dotenv.config({ path: resolve(__dirname, '.env') });

module.exports = ({ config }) => {
  return {
    ...config,
    expo: {
      ...config.expo,
      extra: {
        EXPO_PUBLIC_BACKEND_URL:
          process.env.EXPO_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000',
      },
    },
  };
};
