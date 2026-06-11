export interface SiteLink {
  href: string;
  label: string;
  /** Longer copy used on the home page gateway cards */
  description: string;
  /** Opens in a new tab + gets rel="noopener noreferrer" */
  external?: boolean;
}

/**
 * Single source of truth for the site's outbound/section links.
 * Rendered both as gateway cards (home page "Links" section) and as the
 * compact nav bar in the header — keep them in sync by editing here.
 */
export const links: SiteLink[] = [
  {
    href: 'https://github.com/nickgreenquist',
    label: 'GitHub',
    description: 'Code and side projects.',
    external: true,
  },
  {
    href: 'https://www.linkedin.com/in/nickgreenquist/',
    label: 'LinkedIn',
    description: 'Professional and career details.',
    external: true,
  },
  {
    href: 'https://nickgreenquist.myportfolio.com/',
    label: 'Photography',
    description: 'Wildlife and travel photography portfolio.',
    external: true,
  },
  {
    href: '/projects',
    label: 'Projects',
    description: 'Recommender systems in depth — architecture, design, and results.',
  },
  {
    href: 'https://scholar.google.com/citations?user=28QAvAcAAAAJ&hl=en',
    label: 'Publications',
    description: 'Peer-reviewed research on Google Scholar.',
    external: true,
  },
  {
    href: '/blog',
    label: 'Blog',
    description: 'Thoughts on machine learning, systems, and projects.',
  },
  {
    href: '/map',
    label: 'Travel Map',
    description: "Everywhere I've been on Earth.",
  },
  {
    href: '/wrestling',
    label: 'Wrestling',
    description: 'What it took, what it gave back.',
  },
  {
    href: '/education',
    label: 'Education',
    description: "Every course I've taken — NYU, RIT, and online.",
  },
  {
    href: '/Resume.pdf',
    label: 'Resume',
    description: 'PDF, kept current.',
    external: true,
  },
  {
    href: 'https://www.goodreads.com/user/show/26809953-nick-greenquist',
    label: 'Reading',
    description: 'My reading list on Goodreads',
    external: true,
  },
  {
    href: '/contact',
    label: 'Contact',
    description: 'Send me a message.',
  },
];

const instagram: SiteLink = {
  href: 'https://www.instagram.com/nickgreenquist/',
  label: 'Instagram',
  description: 'Wildlife, travel, and everyday moments.',
  external: true,
};

/** Reuse a section link by label so the menu shares the same hrefs/copy. */
function pick(label: string): SiteLink {
  const link = links.find((l) => l.label === label);
  if (!link) throw new Error(`Unknown link label: ${label}`);
  return link;
}

/**
 * Header hamburger menu — same links as the section above, stacked, with the
 * social links (GitHub, Instagram, LinkedIn) grouped at the bottom and Contact
 * pinned last. Split into two groups so the menu can render a divider between.
 */
export const menuSectionLinks: SiteLink[] = [
  pick('Projects'),
  pick('Blog'),
  pick('Publications'),
  pick('Photography'),
  pick('Travel Map'),
  pick('Wrestling'),
  pick('Education'),
  pick('Reading'),
];

export const menuBottomLinks: SiteLink[] = [
  pick('Resume'),
  pick('GitHub'),
  instagram,
  pick('LinkedIn'),
  pick('Contact'),
];

/**
 * Home page "Links" grid — same links as the hamburger menu, in the same
 * order (section links, then the social/resume/contact group). Rendering both
 * from this single list keeps the grid and the menu in sync.
 */
export const gatewayLinks: SiteLink[] = [...menuSectionLinks, ...menuBottomLinks];
