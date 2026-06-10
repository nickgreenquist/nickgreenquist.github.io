import type { ImageMetadata } from 'astro';
import kenya from '../assets/photography/kenya.jpg';
import egypt from '../assets/photography/egypt.jpg';
import oman from '../assets/photography/oman.jpg';
import nz from '../assets/photography/nz.jpg';
import india from '../assets/photography/india.jpg';
import maldives from '../assets/photography/maldives.jpg';

export const portfolioUrl = 'https://nickgreenquist.myportfolio.com/';
export const instagramUrl = 'https://www.instagram.com/nickgreenquist/';

export interface Photo {
  image: ImageMetadata;
  label: string;
  /** Portfolio gallery this shot belongs to */
  href: string;
}

export const photos: Photo[] = [
  {
    image: india,
    label: 'India',
    href: 'https://nickgreenquist.myportfolio.com/website-2023-india',
  },
  {
    image: kenya,
    label: 'Kenya',
    href: 'https://nickgreenquist.myportfolio.com/website-2022-kenya',
  },
  {
    image: oman,
    label: 'Oman',
    href: 'https://nickgreenquist.myportfolio.com/website-2022-oman',
  },
  {
    image: nz,
    label: 'New Zealand',
    href: 'https://nickgreenquist.myportfolio.com/website-2023-nz',
  },
  {
    image: egypt,
    label: 'Egypt',
    href: 'https://nickgreenquist.myportfolio.com/website-2022-egypt',
  },
  {
    image: maldives,
    label: 'Maldives',
    href: 'https://nickgreenquist.myportfolio.com/website-2023-maldives',
  },
];
