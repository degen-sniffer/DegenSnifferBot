export const twitterAdditionalAccountsNumber = process.env.TWITTER_ADDITIONAL_ACCOUNTS_NUMBER || 0;
export const twitterMainConfig = {
  username: process.env.TWITTER_USERNAME,
  password: process.env.TWITTER_PASSWORD,
  email: process.env.TWITTER_EMAIL,
  secret_2fa: process.env.TWITTER_SECRET_2FA,
};

export const twitterBackoffOptions = {
  initialBackoffTime: 30 * 60 * 1000, // 30 minutes
  maxBackoffTime: 3 * 60 * 60 * 1000, // 3 hours
  backoffMultiplier: 2,
  jitterFactor: 0.2,
};
