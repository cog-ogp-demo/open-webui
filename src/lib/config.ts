// Asset variant: gov | edu | health
const assetVariants = ['gov', 'edu', 'health'] as const
export type AssetVariant = (typeof assetVariants)[number]

export const ASSET_VARIANT: AssetVariant =
  (assetVariants.find((v) => v === process.env.ASSET_VARIANT) as AssetVariant) ||
  'gov'

export const OG_URL = process.env.OG_URL || 'https://go.gov.sg'
export const DEV_ENV = process.env.NODE_ENV === 'development'
export const S3_BUCKET = process.env.AWS_S3_BUCKET || ''
export const GA_TRACKING_ID = process.env.GA_TRACKING_ID || ''

export const LOGIN_MESSAGE = process.env.LOGIN_MESSAGE || ''
export const USER_MESSAGE = process.env.USER_MESSAGE || ''

export const USER_ANNOUNCEMENT = {
  message: process.env.ANNOUNCEMENT_MESSAGE || '',
  title: process.env.ANNOUNCEMENT_TITLE || '',
  subtitle: process.env.ANNOUNCEMENT_SUBTITLE || '',
  url: process.env.ANNOUNCEMENT_URL || '',
  image: process.env.ANNOUNCEMENT_IMAGE || '',
  buttonText: process.env.ANNOUNCEMENT_BUTTON_TEXT || '',
}

export const DISPLAY_HOSTNAME_MAP: Record<AssetVariant, string> = {
  gov: 'go.gov.sg',
  edu: 'for.edu.sg',
  health: 'for.sg',
}

export const DISPLAY_HOSTNAME = DISPLAY_HOSTNAME_MAP[ASSET_VARIANT]

export const META_TAGS: Record<AssetVariant, { title: string; description: string; image: string }> = {
  gov: {
    title: 'Go.gov.sg',
    description: 'The official Singapore government link shortener',
    image: 'https://s3-ap-southeast-1.amazonaws.com/gosg-public/gosg-landing-meta.jpg',
  },
  edu: {
    title: 'For.edu.sg',
    description: 'Trusted short links from education institutions',
    image: 'https://s3-ap-southeast-1.amazonaws.com/gosg-public/edusg-landing-meta.png',
  },
  health: {
    title: 'For.sg',
    description: 'Trusted short links from healthcare institutions',
    image: 'https://s3-ap-southeast-1.amazonaws.com/gosg-public/forsg-landing-meta.png',
  },
}
