# Degen Sniffer
Degen Sniffer is a bot that monitors Twitter profiles for new tweets containing contract addresses. When a new contract address is detected, the bot tweets about it using predefined templates.

## Installation
1. Clone the repository:
```bash
git clone https://github.com/degen-sniffer/DegenSnifferBot.git
cd DegenSnifferBot
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file based on `.env.example` and fill in the required environment variables.

## Usage
To start the bot, run:
```bash
pnpm start
```

## Configuration
### Environment Variables
- `TWITTER_USERNAME`: Twitter username for the bot.
- `TWITTER_PASSWORD`: Twitter password for the bot.
- `TWITTER_EMAIL`: Email associated with the Twitter account.
- `TWITTER_SECRET_2FA`: 2FA secret for the Twitter account.
- `CACHE_FOLDER`: Folders for storing cache.
- `SNIFF_EVERY_MINUTE`: Interval in minutes for sniffing tweets.
- `SNIFF_LATEST_HOUR`: Hours into the past when tweet is still valid for sniffing.
- `OCR_WORKERS_COUNT`: Number of OCR workers (speeds up image into the text recognition).
- `TWITTER_ADDITIONAL_ACCOUNTS_NUMBER`: Number of additional Twitter accounts to avoid rate limitting

## Code Overview
### Entry Point
The entry point of the application is `index.js`. It initializes the cache, Twitter client, and sniffing runner.

### Sniffing Runner
The `SniffingRunner` class is responsible for periodically sniffing tweets from followed profiles and detecting contract addresses.

### Twitter Client
The `TwitterClient` class handles interactions with the Twitter API, including authentication and tweeting.

### Rotator
The `Rotator` class handles twitter accounts rotations when some of them is rate-limited.
Secrets for additional accounts should have _NUMBER suffix in env variables.

## License
This project is licensed under the MIT License.