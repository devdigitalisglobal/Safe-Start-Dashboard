import StarterKit from '@tiptap/starter-kit';
import Blockquote from '@tiptap/extension-blockquote';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

const CalloutBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-callout': {
        default: null,
        parseHTML: (element) => element.getAttribute('data-callout'),
        renderHTML: (attributes) => {
          if (!attributes['data-callout']) {
            return {};
          }
          return { 'data-callout': attributes['data-callout'] };
        },
      },
    };
  },
});

const linkExtension = Link.configure({
  openOnClick: false,
  autolink: true,
  defaultProtocol: 'https',
  HTMLAttributes: {
    rel: 'noopener noreferrer',
    target: '_blank',
  },
});

const starterKitBase = {
  link: false as const,
  blockquote: false as const,
};

/** Short fields: subtitle, question stems — bold, italic, link only. */
export function createInlineExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      ...starterKitBase,
      heading: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      codeBlock: false,
      horizontalRule: false,
    }),
    linkExtension,
    Placeholder.configure({ placeholder }),
  ];
}

/** Lessons, support articles — headings, lists, callouts. */
export function createFullExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      ...starterKitBase,
      heading: { levels: [2, 3] },
    }),
    CalloutBlockquote,
    linkExtension,
    Placeholder.configure({ placeholder }),
  ];
}
