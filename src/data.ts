// ─── Jackson's Interactive Birthday Experience 2.0 — central data ───

export const BIRTHDAY = new Date('2026-08-02T00:00:00');
export const LEVEL = 23;
export const SAADAN_URL = 'https://saadanfilm.com';
export const TRAILER_SRC =
  'https://videos.pexels.com/video-files/34677880/14698571_1920_1080_25fps.mp4';

export const siteUrl = (): string =>
  typeof window !== 'undefined' ? window.location.href : SAADAN_URL;

export const waLink = (text: string): string =>
  `https://wa.me/?text=${encodeURIComponent(text)}`;

export const shareText = `I've just celebrated Jackson's birthday online! 🎉 Level ${LEVEL} unlocked. Join the experience: ${siteUrl()}`;

// ─── Timeline meta (text lives in i18n) ───
export const timelineMeta = [
  { year: '2003', icon: '🌍' },
  { year: '2019', icon: '💻' },
  { year: '2021', icon: '🎨' },
  { year: '2022', icon: '🎬' },
  { year: '2023', icon: '🏢' },
  { year: '2025', icon: '🏛️' },
  { year: '2026', icon: '🎂' },
  { year: '2030', icon: '🚀' },
];

// ─── Achievements meta (text lives in i18n) ───
export const achievementIcons = [
  '👑', '💻', '🎬', '🎥', '🎓', '🚀', '💡',
];

// ─── Companies ───
export const companies = {
  group: { icon: '🎭', initials: 'SG' },
  jetras: { icon: '🤖', initials: 'JT' },
  entities: [
    { initials: 'SF', icon: '🎬', id: 'saadan-film' },
    { initials: 'SD', icon: '🎪', id: 'sadec' },
    { initials: 'VM', icon: '🎨', id: 'vermola' },
    { initials: 'SM', icon: '📡', id: 'saadan-media' },
  ],
};

// ─── Films ───
export interface Film {
  title: string;
  theme: string;
  emoji: string;
  year: string;
}

export const films: Film[] = [
  { title: 'Black Demon', theme: 'Supernatural thriller', emoji: '😈', year: '2023' },
  { title: 'Mama', theme: 'Family drama', emoji: '👩🏾', year: '2023' },
  { title: 'Ghost', theme: 'Horror', emoji: '👻', year: '2024' },
  { title: 'Ezora', theme: 'Fantasy epic', emoji: '🐉', year: '2024' },
  { title: 'The Last Rose', theme: 'Romance', emoji: '🌹', year: '2025' },
  { title: 'The Forest Frame', theme: 'Nature documentary', emoji: '🌲', year: '2025' },
  { title: 'Kiapo cha Damu', theme: 'Swahili drama', emoji: '⚔️', year: '2026' },
];

// ─── Gallery ───
export interface GalleryItem {
  src: string;
  caption: string;
  sub: string;
}

export const galleryItems: GalleryItem[] = [
  { src: 'images/portrait.jpg', caption: 'The Man of the Hour', sub: 'Jackson Said Issa — Level 23' },
  { src: 'images/gallery-film.jpg', caption: 'On Set', sub: 'Directing the vision' },
  { src: 'images/gallery-tech.jpg', caption: 'The Developer', sub: 'Building digital worlds' },
  { src: 'images/gallery-studio.jpg', caption: 'SAADAN FILM Studio', sub: 'Where stories are crafted' },
  { src: 'images/gallery-vision.jpg', caption: 'Vision 2030', sub: 'Eleven countries, one dream' },
  { src: 'images/puzzle.jpg', caption: 'Level 23 Celebration', sub: 'Another year of greatness' },
];

// ─── Quiz answers (index into i18n options) ───
export const quizAnswers = [0, 1, 1, 3, 2, 1, 0, 2, 0, 2];
export const movieQuizAnswers = [0, 1, 0, 0, 0, 0, 0, 2];

export const guessAnswers = [0, 1, 2, 3, 4, 6];
export const guessEmojis = ['👑', '💻', '🎬', '🎥', '📚', '💡'];
export const achievementTitlesPath = 'achievements.items';

// ─── Wheel ───
export const wheelEmojis = ['🎬', '🍰', '😂', '✨', '🎁', '🏆', '🌍', '🎉'];
export const wheelColors = [
  '#1a1206', '#2b1e08', '#3a2a0c', '#241a07', '#33240a', '#1e1506', '#40300f', '#281d08',
];

// ─── Memory milestones ───
export const memoryMilestones = [
  { src: 'images/portrait.jpg' },
  { src: 'images/gallery-tech.jpg' },
  { src: 'images/gallery-film.jpg' },
  { src: 'images/gallery-studio.jpg' },
  { src: 'images/gallery-vision.jpg' },
  { src: 'images/puzzle.jpg' },
];

// ─── Card studio ───
export interface CardTheme {
  id: string;
  colors: [string, string, string];
  frame: string;
  accent: string;
  text: string;
  sub: string;
}

export const cardThemes: CardTheme[] = [
  { id: 'luxury', colors: ['#0b0e1a', '#1c2418', '#3a2c0c'], frame: '#d4af37', accent: '#f6e27a', text: '#ffffff', sub: '#f5f2e9' },
  { id: 'cinema', colors: ['#160404', '#3d0a0a', '#7a1f0c'], frame: '#e8b84b', accent: '#ffd27d', text: '#ffffff', sub: '#f5e6d0' },
  { id: 'classic', colors: ['#e8e0cd', '#d9cdb2', '#b7a888'], frame: '#1f3a5f', accent: '#1f3a5f', text: '#1a1a1a', sub: '#3d3d3d' },
  { id: 'modern', colors: ['#040810', '#0b1526', '#14304f'], frame: '#ffffff', accent: '#7ab8ff', text: '#ffffff', sub: '#dbeafe' },
  { id: 'minimal', colors: ['#0a0a0a', '#141414', '#232323'], frame: '#f5f5f5', accent: '#f5f5f5', text: '#f5f5f5', sub: '#aaaaaa' },
  { id: 'gold', colors: ['#3a2c0c', '#a97c1f', '#f6e27a'], frame: '#fff3c4', accent: '#ffffff', text: '#1a1206', sub: '#2b1e08' },
  { id: 'dark', colors: ['#020204', '#0a0a12', '#1c1c28'], frame: '#c0c0c0', accent: '#e5e5e5', text: '#f5f5f5', sub: '#9a9a9a' },
];

export const cardDecos = ['🍰', '🎈', '🎆', '🎊', '⭐', '💛', '🎥', '👑'];
export const wishEmojis = ['🎉', '🎂', '🎈', '🎁', '⭐', '🎬', '🥂', '💛', '🚀', '🏆'];

// ─── Destinations (coords) ───
export interface Destination {
  flag: string;
  lat: number;
  lon: number;
  id: string;
}

export const destinations: Destination[] = [
  { flag: '🇹🇿', lat: -6.79, lon: 39.28, id: 'tz' },
  { flag: '🇨🇦', lat: 45.42, lon: -75.7, id: 'ca' },
  { flag: '🇺🇸', lat: 40.71, lon: -74.01, id: 'us' },
  { flag: '🇬🇧', lat: 51.51, lon: -0.13, id: 'gb' },
  { flag: '🇯🇵', lat: 35.68, lon: 139.69, id: 'jp' },
  { flag: '🇰🇷', lat: 37.57, lon: 126.98, id: 'kr' },
  { flag: '🇸🇬', lat: 1.35, lon: 103.82, id: 'sg' },
  { flag: '🇩🇪', lat: 52.52, lon: 13.4, id: 'de' },
  { flag: '🇫🇷', lat: 48.86, lon: 2.35, id: 'fr' },
  { flag: '🇮🇳', lat: 28.61, lon: 77.21, id: 'in' },
  { flag: '🇦🇪', lat: 25.2, lon: 55.27, id: 'ae' },
];

// ─── Badges ───
export const badgeIds = [
  'card', 'quiz', 'stars', 'memory', 'puzzle', 'wheel', 'typing',
  'treasure', 'movie', 'guess', 'guest', 'dream',
] as const;

export type BadgeId = (typeof badgeIds)[number];

export const loadBadges = (): string[] => {
  try {
    const raw = localStorage.getItem('jb-badges-v1');
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

export const saveBadge = (id: string): string[] => {
  const all = loadBadges();
  if (all.includes(id)) return all;
  const next = [...all, id];
  try {
    localStorage.setItem('jb-badges-v1', JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
};

// ─── Guest book ───
export interface WishEntry {
  name: string;
  message: string;
  date: string;
}

const GB_KEY = 'jb-guestbook-v1';
const GB_SEED = 'jb-guestbook-seeded-v1';

export const loadWishes = (): WishEntry[] => {
  try {
    const raw = localStorage.getItem(GB_KEY);
    if (raw) return JSON.parse(raw) as WishEntry[];
    if (!localStorage.getItem(GB_SEED)) {
      const seeded: WishEntry[] = [
        { name: 'SAADAN GROUP', message: 'To the director of his own life — happy birthday, Jackson! 🎬✨', date: new Date().toLocaleDateString() },
        { name: 'JETRAS', message: 'Can’t wait to see what you create next. Happy Level 23! ⭐', date: new Date().toLocaleDateString() },
      ];
      localStorage.setItem(GB_KEY, JSON.stringify(seeded));
      localStorage.setItem(GB_SEED, '1');
      return seeded;
    }
    return [];
  } catch {
    return [];
  }
};

export const saveWish = (entry: WishEntry): WishEntry[] => {
  const all = loadWishes();
  const next = [entry, ...all];
  try {
    localStorage.setItem(GB_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
};

// ─── Leaderboard ───
export const loadLeaderboard = (): number[] => {
  try {
    const raw = localStorage.getItem('jb-stars-leaderboard');
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
};

export const saveScore = (score: number): number[] => {
  const next = [...loadLeaderboard(), score].sort((a, b) => b - a).slice(0, 5);
  try {
    localStorage.setItem('jb-stars-leaderboard', JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
};
