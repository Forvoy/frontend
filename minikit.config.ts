const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "https://forter-news.vercel.app";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjEzNTYxMjIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgyMDg3NjQ3NzJhYjQ0N0M3MTI0RDk3REJhZkM0NTM4NjI0ZGI4RjQ2In0",
    payload: "eyJkb21haW4iOiJmb3J0ZXItbmV3cy52ZXJjZWwuYXBwIn0",
    signature: "inXE8bnVBEZzNNJOFfaLtDH5ClWlx8Mry1FuFX6pIoBjMrD1/H7sj1Y21VemDHadBjl/FuBy8n7UabG7oJUEmhs="
  },
  baseBuilder: {
    allowedAddresses: ["0x4030986A078f97fbdC74d43dAFeb646D6caBb8A9"],
  },
  miniapp: {
    version: "1",
    name: "Forter",
    subtitle: "Stake on Credibility, Not Luck",
    description:
      "Permissionless information finance protocol. Create predictions, analyze with reasoning, and build on-chain reputation through verifiable insights.",
    screenshotUrls: [
      `${ROOT_URL}/screenshots/news-browse.png`,
      `${ROOT_URL}/screenshots/pool-creation.png`,
      `${ROOT_URL}/screenshots/staking-interface.png`,
    ],
    iconUrl: `${ROOT_URL}/imagesLogo`,
    splashImageUrl: `${ROOT_URL}/imagesLogo`,
    splashBackgroundColor: "#1a1a1d",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "entertainment",
    tags: ["staking"],
    heroImageUrl: `${ROOT_URL}/imagesLogo`,
    tagline: "Transform credibility into yield",
    ogTitle: "Forter - Forecast Porter",
    ogDescription:
      "Stake on credibility, not luck. Build on-chain reputation through verifiable analysis and earn from accurate insights.",
    ogImageUrl: `${ROOT_URL}/og-image.png`,
    noindex: false,
  },
} as const;
