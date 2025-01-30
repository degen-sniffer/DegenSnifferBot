import { createWorker, createScheduler } from "tesseract.js";
import { ocrCharWhitelist, ocrWorkersCount } from "#src/ocr/config.js";

export class OcrManager {
  constructor() {
    this.scheduler = createScheduler();
    this.model = "eng-best"; // eng-fast could be used as alternative model
  }

  async initialize() {
    for (let i = 0; i < parseInt(ocrWorkersCount); i++) {
      this.scheduler.addWorker(await createWorker(this.model, { tessedit_char_whitelist: ocrCharWhitelist }));
    }
  }
}
