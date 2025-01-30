export const sniffEveryMinute = process.env.SNIFF_EVERY_MINUTE || 5;
export const sniffLatestHour = process.env.SNIFF_LATEST_HOUR || 3;
export const tweetTemplates = [
  "Fresh contract spotted 👀 Sniffed this one out - DYOR! 💎",
  "New token just dropped! 🕵️‍♂️ Found this in the wild - what's the play? 🤔",
  "Contract detected! Early or too early? DYOR before diving in. 📊",
  "Sniff sniff… a new token appears! 🐾 Is this the next gem or just another degen gamble?",
  "Fresh on-chain activity! 👀 Spotted this one - who's aping in? 🦍",
  "Contract sighted! 🚀 Another one hits the blockchain - watchlist or instant ape?",
  "Something new just popped up… 🤫 Early eyes on this one. What do we think?",
  "The bot doesn't sleep - another fresh contract detected. Who's taking a closer look?",
  "Degen radar just pinged! 🔥 Spotted this contract - anyone got insights?",
  "New token in the wild! 🕵️‍♂️ Is this a moonshot or a quick rug? DYOR!",
];
export const ethAddressRegex = /0x[a-fA-F0-9]{40}/;
export const solanaAddressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/;
export const ethOcrAddressRegex = /0x[a-zA-z0-9]{40}/;
export const solanaOcrAddressRegex = /[1-9A-Za-z]{28,48}/;
