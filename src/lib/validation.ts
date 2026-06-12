import validator from 'validator'

export const SHORT_URL_REGEX = /^[a-z0-9-]+$/
export const TAG_KEY_REGEX = /^[a-z0-9-_]+$/
export const TAG_STRING_REGEX = /^[A-Za-z0-9-_]+$/
export const MAX_TAG_LENGTH = 25
export const MAX_NUM_TAGS_PER_LINK = 3

const BLACKLIST = [
  'go.gov.sg',
  'for.edu.sg',
  'for.sg',
]

const WHITELIST = [/^http:\/\/localhost:4566/]

const URL_OPTS: validator.IsURLOptions = {
  protocols: ['https'],
  require_tld: true,
  require_protocol: true,
  require_host: true,
  require_valid_protocol: true,
  allow_underscores: false,
  allow_trailing_dot: false,
  allow_protocol_relative_urls: false,
  disallow_auth: false,
}

export function isWhitelisted(url: string): boolean {
  return WHITELIST.some((regexp) => url.match(regexp))
}

export function isBlacklisted(url: string): boolean {
  return BLACKLIST.some((bl) => url.toLowerCase().includes(bl))
}

export function isHttps(url: string, useWhitelist = false): boolean {
  if (useWhitelist && isWhitelisted(url)) return true
  return /^https:\/\//.test(url)
}

export function isValidUrl(url: string, useWhitelist = false): boolean {
  if (useWhitelist && isWhitelisted(url)) return true
  if (!validator.isURL(url, URL_OPTS)) return false
  try {
    const host = new URL(url).hostname
    return !validator.isIP(host)
  } catch {
    return false
  }
}

export function isValidShortUrl(url: string, allowBlank = false): boolean {
  return allowBlank ? /^[a-z0-9-]*$/.test(url) : SHORT_URL_REGEX.test(url)
}

export function isValidTag(tag: string, allowBlank = false): boolean {
  return (
    (allowBlank && tag === '') ||
    (TAG_STRING_REGEX.test(tag) && tag.length <= MAX_TAG_LENGTH)
  )
}

export function isValidTags(tags: string[]): boolean {
  return (
    tags.every((tag) => isValidTag(tag)) &&
    tags.length <= MAX_NUM_TAGS_PER_LINK &&
    new Set(tags).size === tags.length
  )
}

export function isValidLongUrl(
  url: string,
  allowBlank = false,
  useWhitelist = false,
): boolean {
  return (allowBlank && !url) || isValidUrl(`https://${url}`, useWhitelist)
}

export function isCircularRedirects(
  url: string,
  hostname?: string | null,
): boolean {
  try {
    return Boolean(hostname) && new URL(url).hostname === hostname
  } catch {
    return false
  }
}

export function isPrintableAscii(str: string): boolean {
  return /^[\x20-\x7F]*$/.test(str)
}
