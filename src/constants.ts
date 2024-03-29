export type ItemIconGroup =
  | 'washing'
  | 'bleaching'
  | 'ironing'
  | 'tumble-drying'
  | 'natural-drying'
  | 'dry-cleaning'
  | 'wet-cleaning'

export const itemsIcons: Record<ItemIconGroup, Array<string>> & { [key: string]: Array<string> } = {
  washing: [
    'wash',
    'mild-wash',
    'very-mild-wash',
    'hand-wash',
    'do-not-wash',
    'wash-cold',
    'mild-wash-cold',
    'very-mild-wash-cold',
    'wash-warm',
    'mild-wash-warm',
    'very-mild-wash-warm',
    'wash-hot',
    'mild-wash-hot',
    'very-mild-wash-hot',
    'wash-very-hot',
    'mild-wash-very-hot',
    'very-mild-wash-very-hot',
  ],
  bleaching: ['bleach', 'do-not-bleach', 'non-chlorine-bleach'],
  ironing: ['iron', 'do-not-iron', 'iron-low', 'iron-medium', 'iron-high', 'iron-steam', 'iron-do-not-steam'],
  'tumble-drying': [
    'tumble-dry',
    'do-not-tumble-dry',
    'tumble-dry-low-heat',
    'tumble-dry-medium-heat',
    'tumble-dry-high-heat',
  ],
  'natural-drying': [
    'dry',
    'dry-in-shade',
    'line-dry',
    'line-dry-in-shade',
    'drip-dry',
    'drip-dry-in-shade',
    'dry-flat',
    'dry-flat-in-shade',
  ],
  'dry-cleaning': [
    'dry-clean',
    'do-not-dry-clean',
    'dry-clean-petroleum',
    'gentle-dry-clean-petroleum',
    'very-gentle-dry-clean-petroleum',
    'dry-clean-pce',
    'gentle-dry-clean-pce',
    'very-gentle-dry-clean-pce',
  ],
  'wet-cleaning': ['wet-clean', 'do-not-wet-clean', 'gentle-wet-clean', 'very-gentle-wet-clean'],
}
