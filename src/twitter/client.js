import { Scraper, SearchMode } from "agent-twitter-client";

export class TwitterClient {
  constructor(cacheManager, twitterConfig) {
    this.cacheManager = cacheManager;
    this.twitterConfig = twitterConfig;
    this.username = twitterConfig.username;
    this.scrapper = new Scraper();
    this.lastCheckedTweetIds = {};
  }

  async initialize() {
    await this.cacheManager.initialize();

    const { username, password, email, secret_2fa } = this.twitterConfig;

    if (!username) throw new Error("Twitter username not configured");

    const cachedCookies = await this.cacheManager.get(`twitter/cookies/${username}`);

    if (cachedCookies) {
      console.log(`[TwitterClient] Using cached cookies for @${username}`);
      await this.setCookiesFromArray(cachedCookies);
    }

    console.log(`[TwitterClient] Waiting Twitter login for @${username}`);
    try {
      if (await this.scrapper.isLoggedIn()) {
        console.log(`[TwitterClient] Successfully logged in for @${username}`);
      } else {
        await this.scrapper.login(username, password, email, secret_2fa);
        if (await this.scrapper.isLoggedIn()) {
          console.log(`[TwitterClient] Successfully logged in. Caching cookies for @${username}`);
          await this.cacheManager.set(`twitter/cookies/${username}`, await this.scrapper.getCookies());
        }
      }
    } catch (error) {
      console.error(`[TwitterClient] Login attempt failed for @${username}: ${error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await this.loadLastCheckedTweetIds();
  }

  async tweet(text) {
    await this.scrapper.sendTweet(text);
  }

  async getProfile(username) {
    const cached = await this.cacheManager.get(`twitter/profile/${username}`);

    if (cached) return cached;

    const response = await this.scrapper.getProfile(username);
    await this.cacheManager.set(`twitter/profile/${username}`, response);

    return response;
  }

  async getTweets(profile, maxTweets = 20) {
    // const response = await this.scrapper.getUserTweets(profile.userId, maxTweets);
    // return response.tweets;

    // const response = await this.scrapper.fetchSearchTweets(`from:${profile.username}`, maxTweets, SearchMode.Latest);
    // return response.tweets;

    const response = await this.scrapper.getTweets(profile.username, maxTweets);
    let tweets = [];
    for await (const tweet of response) {
      tweets.push(tweet);
    }
    return tweets;
  }

  async getFollowing(userId) {
    const response = await this.scrapper.fetchProfileFollowing(userId);

    return response.profiles;
  }

  async loadLastCheckedTweetIds() {
    const lastCheckedTweetIds = await this.cacheManager.get(`twitter/last_checked_tweet_ids`);

    if (lastCheckedTweetIds) {
      this.lastCheckedTweetIds = lastCheckedTweetIds;
    }
  }

  async setLastCheckedTweetId(username, lastCheckedTweetId) {
    this.lastCheckedTweetIds[username] = lastCheckedTweetId;

    await this.cacheManager.set(`twitter/last_checked_tweet_ids`, this.lastCheckedTweetIds);
  }

  getLastCheckedTweetId(username) {
    return this.lastCheckedTweetIds[username];
  }

  async setCookiesFromArray(cookiesArray) {
    const cookieStrings = cookiesArray.map(
      (cookie) =>
        `${cookie.key}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}; ${
          cookie.secure ? "Secure" : ""
        }; ${cookie.httpOnly ? "HttpOnly" : ""}; SameSite=${cookie.sameSite || "Lax"}`
    );
    await this.scrapper.setCookies(cookieStrings);
  }
}
