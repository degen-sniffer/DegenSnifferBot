import { TwitterClient } from "#src/twitter/client.js";

export async function createTwitterClients(twitterMainClient, cacheManager, numberOfClients) {
  const clients = [twitterMainClient];

  for (let i = 0; i < parseInt(numberOfClients); i++) {
    const client = new TwitterClient(cacheManager, twitterClientConfig(i + 1));
    await client.initialize();

    clients.push(client);
  }

  return clients;
}

function twitterClientConfig(index) {
  const username = process.env[`TWITTER_USERNAME_${index}`];
  const password = process.env[`TWITTER_PASSWORD_${index}`];
  const email = process.env[`TWITTER_EMAIL_${index}`];
  const secret_2fa = process.env[`TWITTER_SECRET_2FA_${index}`];

  if (!username || !password || !email) {
    throw new Error(`Credentials for client #${index} are not set`);
  }

  return { username, password, email, secret_2fa };
}
