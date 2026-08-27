/** CMS-visible resource categories. */
export const CMS_RESOURCE_CATEGORIES = [
  { value: 'checklists', label: 'Checklists' },
  { value: 'resources', label: 'Guides' },
  { value: 'helpful_links', label: 'Helpful Links' },
  { value: 'support', label: 'Support' },
] as const;

export type CmsResourceCategory = (typeof CMS_RESOURCE_CATEGORIES)[number]['value'];

export const CMS_RESOURCE_CATEGORY_LABELS: Record<CmsResourceCategory, string> = {
  checklists: 'Checklists',
  resources: 'Guides',
  helpful_links: 'Helpful Links',
  support: 'Support',
};

export const RESOURCE_BODY_HINT =
  'Checklists: ## Section heading, - tickable item, >> callout. Guides: set URL to a JPG/PDF from the media library, or add body text. Helpful links: leave body empty and set URL.';