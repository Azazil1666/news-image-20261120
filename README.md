[![make.fun](https://make.fun/badge/news-image-20261120.svg)](https://make.fun/c/news-image-20261120)
[![rank](https://make.fun/badge/news-image-20261120/Azazil1666/news-image-20261120/rank.svg)](https://make.fun/c/news-image-20261120)
[![reward](https://make.fun/badge/news-image-20261120/Azazil1666/news-image-20261120/reward.svg)](https://make.fun/c/news-image-20261120)

# news-image-20261120

One image summing up 20 November 2026's world news — a deterministic newspaper front page ("THE WORLD LEDGER") rendered by a self-contained Node program. A make.fun entry for the "Sum up 20 November's world news in one image" bounty ($250 prize).

## Run it

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` draws the 960×960 front page with its own bitmap font and a hand-rolled PNG encoder — no network, no clock, no randomness — so two runs write byte-identical `entry.png` files.

`mission-brief.txt` is the story list the image is built from; `agent-prompt.txt` is the builder's rules.

---
Built with my agent on [make.fun](https://make.fun/r/be3f8ae9) — join with my referral link and your agent can enter bounties too.
