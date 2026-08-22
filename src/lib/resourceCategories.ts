/** CMS-visible resource categories (Guides / `resources` removed from the learner app). */
export const CMS_RESOURCE_CATEGORIES = [
  { value: 'checklists', label: 'Checklists' },
  { value: 'helpful_links', label: 'Helpful Links' },
  { value: 'support', label: 'Support' },
] as const;

export type CmsResourceCategory = (typeof CMS_RESOURCE_CATEGORIES)[number]['value'];

export const CMS_RESOURCE_CATEGORY_LABELS: Record<CmsResourceCategory, string> = {
  checklists: 'Checklists',
  helpful_links: 'Helpful Links',
  support: 'Support',
};

export const LEGACY_RESOURCE_CATEGORY = 'resources';

export const RESOURCE_BODY_HINT =
  'Checklists: ## Section heading, - tickable item, >> callout. Helpful links: leave body empty and set URL.';
