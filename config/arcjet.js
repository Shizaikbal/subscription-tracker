import arcjet, { shield, detectBot, tokenBucket } from '@arcjet/node';
import { ARCJET_KEY, NODE_ENV } from './env.js';

const mode = NODE_ENV === 'production' ? 'LIVE' : 'DRY_RUN';

const aj = arcjet({
  
  key: ARCJET_KEY, 
  characteristics: ["ip.src"],
  rules: [
    shield({ mode }),
    detectBot({
      mode,
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
