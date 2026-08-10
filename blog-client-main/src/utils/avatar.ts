type UserAvatarOptions = {
  saturation?: number
  lightness?: number
}

const DEFAULT_SATURATION = 58
const DEFAULT_LIGHTNESS = 52

const normalizeName = (value: string) => value.trim().toLowerCase()

const getInitialFromName = (name: string) => {
  const trimmed = name.trim()

  if (!trimmed) {
    return 'U'
  }

  const words = trimmed.split(/\s+/).filter(Boolean)

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }

  const first = words[0].charAt(0)
  const second = words[1].charAt(0)

  return `${first}${second}`.toUpperCase()
}

const hashStringToHue = (value: string) => {
  let hash = 0

  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }

  return Math.abs(hash) % 360
}

export function getUserAvatarStyleFromName(
  name: string,
  options: UserAvatarOptions = {},
) {
  const normalizedName = normalizeName(name)
  const saturation = options.saturation ?? DEFAULT_SATURATION
  const lightness = options.lightness ?? DEFAULT_LIGHTNESS

  if (!normalizedName) {
    return {
      initial: 'U',
      backgroundColor: `hsl(210 ${saturation}% ${lightness}%)`,
    }
  }

  const hue = hashStringToHue(normalizedName)

  return {
    initial: getInitialFromName(name),
    backgroundColor: `hsl(${hue} ${saturation}% ${lightness}%)`,
  }
}
