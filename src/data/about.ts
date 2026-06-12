import type { ImageMetadata } from 'astro';
import slorLogo from '../assets/journey/slor.jpg';
import ritLogo from '../assets/journey/rit.svg';
import nyuLogo from '../assets/journey/nyu.svg';
import googleLogo from '../assets/journey/google.svg';

export const headline = "Nick Greenquist";

export const subhead = "Senior Software Engineer @ Google · Machine Learning · Recommender Systems";

export const bioIntro = `Hello! I'm a Senior Software Engineer at <a href="https://google.com">Google</a>, working on the <a href="https://play.google.com/store/games">Google Play Store Personalization</a> team — building and scaling the recommender systems that help billions of Android users discover their next favorite app or game.`;

export const journeyLead = `The road here was a bit winding:`;

export interface JourneyStep {
  years: string;
  title: string;
  blurb: string;
  icon?: string;
  logo?: ImageMetadata;
  /** Tailwind width class for the logo inside the node; overrides the aspect-ratio default */
  logoWidth?: string;
  /** Optional outbound link wrapping the logo node */
  href?: string;
}

export const journey: JourneyStep[] = [
  {
    years: "Six summers",
    logo: slorLogo,
    logoWidth: "w-[88%]",
    href: "https://www.springlakeboro.org/",
    title: "Ocean Lifeguard — Spring Lake, NJ",
    blurb: `My Baywatch career: six summers guarding the Jersey Shore with <a href="https://www.instagram.com/springlakeoceanrescue/" target="_blank" rel="noopener noreferrer">Spring Lake Ocean Rescue</a>.`,
  },
  {
    years: "2012 – 2017",
    logo: ritLogo,
    href: "https://www.rit.edu/",
    title: "Rochester Institute of Technology",
    blurb: `BS in Game Design &amp; Development, CS minor. Wrestled four years for the <a href="https://ritathletics.com/sports/wrestling" target="_blank" rel="noopener noreferrer">NCAA D3 program</a> — team captain and 3× Academic All-American.`,
  },
  {
    years: "2015 – 2018",
    icon: "💻",
    title: "Four Internships",
    blurb: `A different stack every time — frontend, backend, and data engineering at <a href="http://ehealthtechnologies.com" target="_blank" rel="noopener noreferrer">eHealth Technologies</a>, <a href="http://geekhive.com/" target="_blank" rel="noopener noreferrer">GeekHive</a>, <a href="https://www.enigma.com/" target="_blank" rel="noopener noreferrer">Enigma</a>, and <a href="https://www.bluecore.com/" target="_blank" rel="noopener noreferrer">Bluecore</a>.`,
  },
  {
    years: "2017 – 2019",
    logo: nyuLogo,
    href: "https://www.nyu.edu/",
    title: "New York University, Courant",
    blurb: `MS in Computer Science focused on Machine Learning and AI — where recommender systems hooked me and I published my <a href="#publications">first research</a>.`,
  },
  {
    years: "2019 – now",
    logo: googleLogo,
    href: "https://www.google.com/",
    title: "Google",
    blurb: `Joined the <a href="https://play.google.com/store/games" target="_blank" rel="noopener noreferrer">Google Play Personalization</a> team out of grad school; now a Senior SWE building Play Store recommendations for billions of users.`,
  },
  {
    years: "2025 – forever",
    icon: "👶",
    title: "Dad",
    blurb: `The newest and most important title and role. Everything else I'm into lives further down this page, in <a href="#away-from-the-keyboard">Away from the Keyboard</a>.`,
  },
];
