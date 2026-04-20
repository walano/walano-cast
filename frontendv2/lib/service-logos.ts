// Static mapping: service name → svgl.app SVG logo URL
// Source: https://api.svgl.app
export const SERVICE_LOGOS: Record<string, string> = {
  'Netflix':     'https://svgl.app/library/netflix-icon.svg',
  'Prime Video': 'https://svgl.app/library/prime-video.svg',
  'Apple Music': 'https://svgl.app/library/apple-music-icon.svg',
  'Spotify':     'https://svgl.app/library/spotify.svg',
  'Snapchat+':   'https://svgl.app/library/snapchat.svg',
  'ChatGPT':     'https://svgl.app/library/openai.svg',
  'Canva':       'https://svgl.app/library/canva.svg',
  // Fallbacks for missing svgl entries
  'iCloud+':     'https://svgl.app/library/icloud.svg',   // may exist, try
  'Crunchyroll': 'https://svgl.app/library/crunchyroll.svg', // may exist, try
  'CapCut':      'https://svgl.app/library/capcut.svg',      // may exist, try
}

export function getServiceLogo(name: string, iconUrl?: string | null): string | null {
  return iconUrl ?? SERVICE_LOGOS[name] ?? null
}
