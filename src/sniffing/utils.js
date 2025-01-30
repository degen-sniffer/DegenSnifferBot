import {
  sniffLatestHour,
  ethAddressRegex,
  solanaAddressRegex,
  ethOcrAddressRegex,
  solanaOcrAddressRegex,
} from "#src/sniffing/config.js";

function parseTextAddresses(text, ethRegex, solRegex) {
  const matches = new Set();

  const ethMatches = text.match(ethRegex) || [];
  ethMatches.forEach((match) => matches.add(match));

  const solanaMatches = text.match(solRegex) || [];
  solanaMatches.forEach((match) => matches.add(match));

  return matches;
}

export function parseContractAddressesFromText(tweet) {
  let addresses = new Set();

  function recursiveSearch(obj) {
    if (!obj) return;

    if (obj.text) {
      const matches = parseTextAddresses(obj.text, ethAddressRegex, solanaAddressRegex);
      matches.forEach((match) => addresses.add(match));
    }

    if (obj.retweetedStatus) {
      recursiveSearch(obj.retweetedStatus);
    }

    if (obj.quotedStatus) {
      recursiveSearch(obj.quotedStatus);
    }
  }

  recursiveSearch(tweet);

  return Array.from(addresses);
}

export async function parseContractAddressesFromImage(tweet, ocrManager) {
  const imageUrls = parseImageUrls(tweet);
  let addresses = new Set();

  if (imageUrls.length > 0) {
    const results = await Promise.all(imageUrls.map((url) => ocrManager.scheduler.addJob("recognize", url)));
    results.forEach((result) => {
      const matches = parseTextAddresses(result.data.text, ethOcrAddressRegex, solanaOcrAddressRegex);
      matches.forEach((match) => addresses.add(match));
    });
  }

  return Array.from(addresses);
}

export function parseImageUrls(tweet) {
  const imageUrls = new Set();

  function recursiveSearch(obj) {
    if (!obj) return;

    if (obj.photos && obj.photos.length > 0) {
      obj.photos.forEach((photo) => imageUrls.add(photo.url));
    }

    if (obj.retweetedStatus) {
      recursiveSearch(obj.retweetedStatus);
    }

    if (obj.quotedStatus) {
      recursiveSearch(obj.quotedStatus);
    }
  }

  recursiveSearch(tweet);

  return Array.from(imageUrls);
}

export function sniffTweet(tweet, lastCheckedTweetId) {
  if (!lastCheckedTweetId) {
    const periodInMillis = parseInt(sniffLatestHour) * 60 * 60 * 1000; // Check posts not older than 3 hours
    const tweetTime = new Date(tweet.timeParsed).getTime();
    const currentTime = Date.now();

    return currentTime - tweetTime < periodInMillis;
  }

  return parseInt(tweet.id) > parseInt(lastCheckedTweetId);
}
