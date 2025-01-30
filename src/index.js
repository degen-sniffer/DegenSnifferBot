import "dotenv/config";

import { CacheManager } from "#src/cache/manager.js";
import { OcrManager } from "#src/ocr/manager.js";
import { TwitterClient } from "#src/twitter/client.js";
import { Rotator } from "#src/twitter/rotator.js";
import { SniffingRunner } from "#src/sniffing/runner.js";

import { twitterMainConfig, twitterAdditionalAccountsNumber } from "#src/twitter/config.js";
import { createTwitterClients } from "#src/twitter/utils.js";

async function start() {
  const cacheManager = new CacheManager();
  await cacheManager.initialize();

  const ocrManager = new OcrManager();
  await ocrManager.initialize();

  const twitterMainClient = new TwitterClient(cacheManager, twitterMainConfig);
  await twitterMainClient.initialize();

  const clients = await createTwitterClients(
    twitterMainClient,
    cacheManager,
    twitterAdditionalAccountsNumber
  );

  const twitterClientRotator = new Rotator(clients);
  const sniffingRunner = new SniffingRunner(twitterMainClient, twitterClientRotator, ocrManager);
  await sniffingRunner.execute();
}

start().catch(console.error);
