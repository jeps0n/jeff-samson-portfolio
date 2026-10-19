export const categories = [
  {
    id: 'business-apps',
    name: 'Enterprise Software',
    theme: 'enterprise',
    symbol: '⊞',
    description: 'Applications, platforms, and practical software solutions.',
  },
  {
    id: 'slot-games',
    name: 'Slot Games',
    theme: 'slots',
    symbol: '$',
    description: 'Probability-driven games with distinctive themes and mechanics.',
  },
  {
    id: 'board-games',
    name: 'Board Games',
    theme: 'board',
    symbol: '♞',
    description: 'Strategy, interaction, and thoughtful game systems.',
  },
  {
    id: 'arcade-games',
    name: 'Arcade Games',
    theme: 'arcade',
    symbol: '⊙',
    description: 'Responsive, playful browser game experiences.',
  },
] as const

export type CategoryId = (typeof categories)[number]['id']
