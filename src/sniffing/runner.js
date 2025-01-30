import { parseContractAddressesFromText, parseContractAddressesFromImage, sniffTweet } from "#src/sniffing/utils.js";
import { sniffEveryMinute, tweetTemplates } from "#src/sniffing/config.js";

export class SniffingRunner {
  constructor(twitterMainClient, twitterClientRotator, ocrManager) {
    this.twitterMainClient = twitterMainClient;
    this.twitterClientRotator = twitterClientRotator;
    this.ocrManager = ocrManager;
  }

  async execute() {
    console.log("[SniffingRunner] Starting sniffing runner...");

    const handleSniffing = async () => {
      try {
        await this.sniff();
      } catch (error) {
        console.error("[SniffingRunner] Error during sniff:", error);
      }

      console.log(`[SniffingRunner] Finished sniffing, next round in ${sniffEveryMinute} minute(s)...`);
      setTimeout(
        () => {
          handleSniffing().catch((error) => {
            console.error("[SniffingRunner] Error in sniffing cycle:", error);
          });
        },
        parseInt(sniffEveryMinute) * 60 * 1000
      );
    };

    await handleSniffing();
  }

  async sniff() {
    const uniqueId = Math.random().toString(36).substring(2, 8);

    const profile = await this.twitterClientRotator.executeWithRotation("getProfile", this.twitterMainClient.username);
    const following = await this.twitterClientRotator.executeWithRotation("getFollowing", profile.userId);

    for (const profile of following) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5 seconds before the next one
      await this.sniffProfileTweets(profile, uniqueId);
    }
  }

  async sniffProfileTweets(profile, uniqueId) {
    console.log(`[${uniqueId}] [SniffingRunner] Sniffing for @${profile.username}.`);
    const lastCheckedTweetId = this.twitterMainClient.getLastCheckedTweetId(profile.username);

    const tweets = await this.twitterClientRotator.executeWithRotation("getTweets", profile);
    let sniffedInitially = false;
    let firstSniffedTweetId;
    for (const tweet of tweets) {
      if (!sniffTweet(tweet, lastCheckedTweetId)) {
        if (lastCheckedTweetId) {
          console.log(
            `[${uniqueId}] [SniffingRunner] Sniffing for @${profile.username}. No updates. Last checked tweet: ${lastCheckedTweetId}`
          );
        } else {
          firstSniffedTweetId = tweet.id;
        }
        break;
      } else {
        if (!sniffedInitially) {
          firstSniffedTweetId = tweet.id;
          sniffedInitially = true;
        }
      }

      console.log(`[${uniqueId}] [SniffingRunner] Sniffing for @${profile.username}. Tweet: ${tweet.permanentUrl}`);
      let textContractAddresses = parseContractAddressesFromText(tweet);
      let imageContractAddresses = await parseContractAddressesFromImage(tweet, this.ocrManager);

      const combinedAddresses = await this.combineAddresses(textContractAddresses, imageContractAddresses);

      if (combinedAddresses.length > 0) {
        const tweetTemplate = tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)];
        let tweetText = `${tweetTemplate}\n`;
        for (const combinedAddress of combinedAddresses) {
          tweetText += `${combinedAddress.type}: ${combinedAddress.address}\n`;
        }
        if (combinedAddresses.some((address) => address.type === "OCR CA")) {
          tweetText += `🚨 Make sure to check OCR CAs for validity, it was parsed out of image 🚨\n`;
        }
        tweetText += `${tweet.permanentUrl}`;

        await this.twitterMainClient.tweet(tweetText);
        console.log(`[${uniqueId}] [SniffingRunner] Contract addresses found:\n${tweetText}`);
      }
    }

    if (firstSniffedTweetId) {
      console.log(
        `[${uniqueId}] [SniffingRunner] Sniffing for @${profile.username}. Saving tweet: ${firstSniffedTweetId}`
      );
      await this.twitterMainClient.setLastCheckedTweetId(profile.username, firstSniffedTweetId);
    }
  }

  async combineAddresses(textContractAddresses, imageContractAddresses) {
    let combinedAddresses = [
      ...textContractAddresses.map((address) => ({ type: "CA", address })),
      ...imageContractAddresses.map((address) => ({ type: "OCR CA", address })),
    ];

    let cachedAddresses = (await this.twitterMainClient.cacheManager.get(`twitter/contract_addresses`)) || [];

    combinedAddresses = combinedAddresses.filter(
      (address) => !cachedAddresses.some((cached) => cached.address === address.address)
    );

    if (combinedAddresses.length > 0) {
      await this.twitterMainClient.cacheManager.set(`twitter/contract_addresses`, [
        ...cachedAddresses,
        ...combinedAddresses,
      ]);
    }

    return combinedAddresses;
  }
}
