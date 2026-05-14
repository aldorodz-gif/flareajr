// Centralized feature flags. Flip these to re-enable Perplexity-backed
// features once the connector is reconnected and credits are added.
// Read as `boolean` (not narrowed to literal true) so dependent code
// stays type-checked rather than treated as unreachable.
export const PERPLEXITY_FEATURES_ENABLED: boolean = false;
