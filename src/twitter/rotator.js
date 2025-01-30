import { twitterBackoffOptions } from "#src/twitter/config.js";

export class Rotator {
  constructor(twitterClients) {
    this.clients = twitterClients;
    this.currentClientIndex = 0;
    this.clientUsageCount = new Array(twitterClients.length).fill(0);

    this.clientBackoffStatus = this.clients.map(() => ({
      isRateLimited: false,
      backoffUntil: 0,
      currentBackoffTime: 0,
    }));
  }

  calculateJitteredBackoff(baseBackoffTime) {
    const jitter = 1 + (Math.random() * twitterBackoffOptions.jitterFactor * 2 - twitterBackoffOptions.jitterFactor);
    return Math.min(baseBackoffTime * jitter, twitterBackoffOptions.maxBackoffTime);
  }

  isClientRateLimited(clientIndex) {
    const clientStatus = this.clientBackoffStatus[clientIndex];
    return clientStatus.isRateLimited && Date.now() < clientStatus.backoffUntil;
  }

  findNextAvailableClient() {
    const startIndex = this.currentClientIndex;
    let attempts = 0;

    while (attempts < this.clients.length) {
      const nextIndex = (startIndex + attempts) % this.clients.length;
      if (!this.isClientRateLimited(nextIndex)) {
        console.log(`[Rotator] Switched to client @${this.clients[nextIndex].username}`);
        return nextIndex;
      }
      attempts++;
    }

    throw new Error("All clients are currently rate-limited");
  }

  handleRateLimit(clientIndex) {
    const clientStatus = this.clientBackoffStatus[clientIndex];
    const usage = this.clientUsageCount[clientIndex];
    const username = this.clients[clientIndex].username;

    const baseBackoffTime =
      clientStatus.currentBackoffTime === 0
        ? twitterBackoffOptions.initialBackoffTime
        : clientStatus.currentBackoffTime * twitterBackoffOptions.backoffMultiplier;

    const jitteredBackoffTime = this.calculateJitteredBackoff(baseBackoffTime);

    clientStatus.isRateLimited = true;
    clientStatus.backoffUntil = Date.now() + jitteredBackoffTime;
    clientStatus.currentBackoffTime = jitteredBackoffTime;

    console.log(
      `[Rotator] Client @${username} rate-limited. Backing off for ${Math.floor(jitteredBackoffTime / 60 / 1000)} minutes. Usage: ${usage}`
    );
  }

  async executeWithRotation(methodName, ...args) {
    const maxAttempts = this.clients.length;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const client = this.clients[this.currentClientIndex];

        const result = await client[methodName](...args);
        this.clientUsageCount[this.currentClientIndex]++;

        return result;
      } catch (error) {
        if (error.response && error.response.status === 429) {
          this.handleRateLimit(this.currentClientIndex);
          this.currentClientIndex = this.findNextAvailableClient();
          attempts++;
        } else {
          throw error;
        }
      }
    }

    throw new Error("All Twitter clients are rate-limited");
  }
}
