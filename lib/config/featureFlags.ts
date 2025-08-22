// Feature flags configuration for the ILM2 system

export const featureFlags = {
  DEV_MODE: true,
} as const;

export type FeatureFlags = typeof featureFlags;