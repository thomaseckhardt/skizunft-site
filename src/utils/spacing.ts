const spacing: Spacing = {
  auto: {
    cmsLabel: 'Automatic',
  },
  none: {
    cmsLabel: 'Kein Abstand',
    classes: 'mt-0',
  },
  sm: {
    cmsLabel: 'sm',
    classes: 'mt-(--spacing-sm)',
  },
  md: {
    cmsLabel: 'md',
    classes: 'mt-(--spacing-md)',
  },
  lg: {
    cmsLabel: 'lg',
    classes: 'mt-(--spacing-lg)',
  },
};

type Spacing = {
  [key in string]: {
    cmsLabel: string;
    classes?: string;
    pb?: string;
  };
};

export type SpacingKey = keyof typeof spacing;

export const getSpacing = (spacingKey: SpacingKey, defaultSpacing = '') => {
  return spacing[spacingKey] ?? spacing[defaultSpacing];
};

export const addSpacing = (spacingKey: SpacingKey, defaultSpacing = '') => {
  return spacing[spacingKey]?.classes ?? spacing[defaultSpacing]?.classes;
};
