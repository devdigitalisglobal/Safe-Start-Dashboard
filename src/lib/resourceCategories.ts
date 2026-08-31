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
  'Checklists: ## heading, - item, >> tip, >>! warning. Guides: choose a file from the media library. Helpful links: set an external URL.';