import arcjet, { shield, detectBot, tokenBucket } from '@arcjet/node';
import { ARCJET_KEY, NODE_ENV } from './env.js';

const mode = NODE_ENV === 'production' ? 'LIVE' : 'DRY_RUN';

// detectBot stays in DRY_RUN: fingerprint-based bot detection can falsely
// block real users with privacy extensions (e.g. Brave). Monitor it via the
// Arcjet dashboard instead while shield + rate limiting protect in LIVE mode.
const botMode = 'DRY_RUN';

const aj = arcjet({
  
  key: ARCJET_KEY, 
  characteristics: ["ip.src"],
  rules: [
    shield({ mode }),
    detectBot({
      mode: botMode,
      allow: [
        "CATEGORY:SEARCH_ENGINE", 
      ],
    }),
    tokenBucket({
      mode,
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});

export default aj;
