import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Star,
  ArrowDown,
  Sparkles,
  Heart,
  Send,
  Menu,
  X,
  Search,
  Command,
  Bookmark,
  Check,
  WandSparkles,
} from 'lucide-react';
import { API, get, post } from './api/client.js';
import { useFetch } from './hooks/useFetch.js';
import LullabyLab from "./components/LullabyLab.jsx";
import ProjectExperience from './ProjectExperience.jsx';
// Local artwork stored in client/public/images/
const pipImage = '/images/pip_portrait.png';
const avatarImage = '/images/pip_avatar_cloud.png';
const lanternImage = '/images/pip_dream_lantern.png';
const musicBoxImage = '/images/pip_lullaby_box.png';


function PipArt({ small = false }) {
  const [failed, setFailed] = useState(false);
  const [clickStars, setClickStars] = useState([]);

  const imageSrc = small ? avatarImage : pipImage;

  const createStars = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const stars = Array.from({ length: 16 }, (_, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      driftX: (Math.random() - 0.5) * 180,
      driftY: (Math.random() - 0.5) * 180,
      delay: Math.random() * 0.2,
      size: 10 + Math.random() * 18,
    }));

    setClickStars((previous) => [...previous, ...stars]);

    window.setTimeout(() => {
      setClickStars((previous) =>
        previous.filter((star) => !stars.some((s) => s.id === star.id))
      );
    }, 1400);
  };

  if (failed) {
    return (
      <div
        className={`pip-fallback ${small ? 'small' : ''}`}
        aria-label="Pip illustration"
      >
        ☁️<span>☻</span><i>✦</i>
      </div>
    );
  }

  return (
    <span
      className="pip-art-wrapper"
      onClick={createStars}
      style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}
    >
      <img
        className={`pip-art ${small ? 'small' : ''}`}
        src={imageSrc}
        alt="Pip, the Skull Baby, wearing a starry nightcap"
        onError={() => setFailed(true)}
        style={{ display: 'block', cursor: 'pointer' }}
      />

      {clickStars.map((star) => (
        <span
          key={star.id}
          className="click-star"
          aria-hidden="true"
          style={{
            left: star.x,
            top: star.y,
            '--drift-x': `${star.driftX}px`,
            '--drift-y': `${star.driftY}px`,
            '--star-delay': `${star.delay}s`,
            fontSize: `${star.size}px`,
          }}
        >
          ✦
        </span>
      ))}
    </span>
  );
}


function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">
        <Sparkles size={14} />
        {eyebrow}
      </span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function InteractiveStar({ className = "", children = "✦" }) {
  const [falling, setFalling] = useState(false);

  const dropStar = () => {
    if (falling) return;
    setFalling(true);
    window.setTimeout(() => setFalling(false), 1000);
  };

  return (
    <span
      className={`float-star ${className}${falling ? " is-falling" : ""}`}
      role="button"
      tabIndex={0}
      aria-label="Make this star fall"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") dropStar();
      }}
      onPointerDown={dropStar}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          dropStar();
        }
      }}
    >
      {children}
      <span className="star-sparkle" aria-hidden="true">✧</span>
    </span>
  );
}


const DEFAULT_STORY_CHAPTERS = [
  { title: 'A little light in the dark', text: 'At the quiet edge of midnight, a tiny dream-engineer opened their eyes beneath a sky full of patient stars.' },
  { title: 'The first borrowed dream', text: 'Pip found a lost dream tucked inside a sleepy cloud and carefully carried it home, one soft step at a time.' },
  { title: 'A nursery of possibilities', text: 'Soon, the Midnight Nursery filled with little ideas: moonlit gardens, lantern-lit paths, and stories that made even the silence smile.' },
  { title: 'A few happy accidents', text: 'Not every dream went to plan. Some clouds went sideways and a few stars escaped, but Pip learned that mistakes can sparkle too.' },
  { title: 'Your dream is next', text: 'Now Pip keeps the workshop door open for every curious visitor. There is always room for one more dream, including yours.' },
];

function OriginStory({ chapters }) {
  const sourceChapters = Array.isArray(chapters) && chapters.length
    ? chapters.slice(0, 5)
    : DEFAULT_STORY_CHAPTERS;
  const storyChapters = sourceChapters.map((chapter, index) => ({
    ...DEFAULT_STORY_CHAPTERS[index],
    ...chapter,
    title: chapter?.title || DEFAULT_STORY_CHAPTERS[index]?.title || `A sleepy chapter ${index + 1}`,
    text: chapter?.text || DEFAULT_STORY_CHAPTERS[index]?.text || 'A new little dream is waiting to be discovered.',
  }));
  const [activeIndex, setActiveIndex] = useState(0);
  const chapterRefs = useRef([]);
  const quotes = [
    '“Every little beginning holds a whole sky.”',
    '“A lost dream is never too small to find.”',
    '“There is always room for one more wonder.”',
    '“Oops can be another word for magic.”',
    '“Perhaps your dream is waiting right here.”',
  ];

  useEffect(() => {
    const nodes = chapterRefs.current.filter(Boolean);
    if (!nodes.length || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) {
        const index = Number(visible.target.dataset.storyIndex);
        if (Number.isFinite(index)) setActiveIndex(index);
      }
    }, { root: null, rootMargin: '-28% 0px -48% 0px', threshold: [0.05, 0.25, 0.5, 0.75] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [storyChapters.length]);

  const goToChapter = (index) => {
    setActiveIndex(index);
    chapterRefs.current[index]?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  };

  return (
    <section className="section story-section story-experience" id="story" aria-labelledby="story-title">
      <SectionHeading
        eyebrow="ONCE UPON A MOON"
        title="How it all began"
        description="A very small origin story, told in five sleepy chapters. Follow the little lights to find out how Pip became a dream engineer."
      />

      <div className="story-progress-wrap" aria-label={`Story progress: chapter ${activeIndex + 1} of ${storyChapters.length}`}>
        <div className="story-progress-copy"><span>YOUR LITTLE JOURNEY</span><strong>{String(activeIndex + 1).padStart(2, '0')} <i>/</i> {String(storyChapters.length).padStart(2, '0')}</strong></div>
        <div className="story-progress-track" role="progressbar" aria-valuemin={1} aria-valuemax={storyChapters.length} aria-valuenow={activeIndex + 1} aria-valuetext={`Chapter ${activeIndex + 1} of ${storyChapters.length}`}>
          <span style={{ width: `${((activeIndex + 1) / storyChapters.length) * 100}%` }} />
        </div>
      </div>

      <div className="story-chapter-nav" aria-label="Jump to a story chapter">
        {storyChapters.map((chapter, index) => (
          <button key={`${chapter._id || chapter.order || index}-nav`} type="button" className={`story-chapter-pill${activeIndex === index ? ' is-active' : ''}`} aria-current={activeIndex === index ? 'step' : undefined} onClick={() => goToChapter(index)}>
            <span>{String(index + 1).padStart(2, '0')}</span>{chapter.title}
          </button>
        ))}
      </div>

      <div className="story-layout story-layout-advanced">
        <aside className="story-art story-art-advanced" aria-label="Pip's story illustration">
          <span className="story-art-label"><span className="story-live-dot" /> MIDNIGHT NURSERY ARCHIVES</span>
          <div className="moon-disc" aria-hidden="true">☾</div>
          <span className="story-spark s1" aria-hidden="true">✦</span>
          <span className="story-spark s2" aria-hidden="true">✧</span>
          <span className="story-orbit story-orbit-one" aria-hidden="true" />
          <span className="story-orbit story-orbit-two" aria-hidden="true" />
          <PipArt small />
          <div className="story-art-caption">
            <span>NOW TURNING · CHAPTER {String(activeIndex + 1).padStart(2, '0')}</span>
            <p key={activeIndex}>{quotes[activeIndex % quotes.length]}</p>
          </div>
          <div className="story-art-bottom"><span>✧</span> A SOFT LITTLE BEGINNING <span>✧</span></div>
        </aside>

        <div className="timeline timeline-advanced">
          <div className="timeline-rail" aria-hidden="true"><span style={{ height: `${((activeIndex + 1) / storyChapters.length) * 100}%` }} /></div>
          {storyChapters.map((chapter, index) => (
            <motion.article
              ref={(node) => { chapterRefs.current[index] = node; }}
              data-story-index={index}
              className={`story-item story-item-advanced${activeIndex === index ? ' is-active' : ''}`}
              key={chapter._id || chapter.order || `${chapter.title}-${index}`}
              id={`story-chapter-${index + 1}`}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.2) }}
              onFocus={() => setActiveIndex(index)}
            >
              <button className="timeline-dot timeline-dot-button" type="button" aria-label={`Go to chapter ${index + 1}: ${chapter.title}`} aria-pressed={activeIndex === index} onClick={() => goToChapter(index)}>
                {activeIndex === index ? <span className="timeline-dot-star">✦</span> : String(index + 1).padStart(2, '0')}
              </button>
              <div className="story-chapter-copy">
                <span className="eyebrow">CHAPTER {String(index + 1).padStart(2, '0')} <span className="story-chapter-separator">✦</span> {index === 0 ? 'THE BEGINNING' : index === storyChapters.length - 1 ? 'THE NEXT DREAM' : 'A LITTLE DISCOVERY'}</span>
                <h3>{chapter.title}</h3>
                <p>{chapter.text}</p>
                <button type="button" className="story-read-link" onClick={() => goToChapter(Math.min(index + 1, storyChapters.length - 1))} disabled={index === storyChapters.length - 1}>
                  {index === storyChapters.length - 1 ? 'The story continues with you' : 'Turn the page'} <span aria-hidden="true">{index === storyChapters.length - 1 ? '♡' : '↗'}</span>
                </button>
              </div>
            </motion.article>
          ))}
          <div className="story-ending-note"><span aria-hidden="true">✧</span><p>And that, little star, is how a dream begins.</p><span aria-hidden="true">✧</span></div>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('pip-theme') || 'day'
  );
  const [muted, setMuted] = useState(
    () => localStorage.getItem('pip-muted') === 'true'
  );
  const [starClicks, setStarClicks] = useState(0);
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [secretRevealOpen, setSecretRevealOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lullabyOpen, setLullabyOpen] = useState(
  () => window.location.hash === "#lullaby-lab"
  );
  const [dreamerOpen, setDreamerOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState(null);
  const [visitorRefreshing, setVisitorRefreshing] = useState(false);
  const [heroGreetingIndex, setHeroGreetingIndex] = useState(0);
  const [selectedDreamStop, setSelectedDreamStop] = useState(0);
  const [deliveredDreamStops, setDeliveredDreamStops] = useState([]);

  const heroGreetings = [
    'Oh! A visitor. I was just polishing a little dream. ✨',
    'Welcome to the Midnight Nursery. Mind the sleepy clouds! ☁️',
    'I build the dreams you fall asleep inside. Want to see my work? 🌙',
    'Tiny idea, big dream. That is how we do things around here. ⭐',
  ];

  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [guestError, setGuestError] = useState('');
  const [guestBusy, setGuestBusy] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [chatLog, setChatLog] = useState([
    {
      who: 'pip',
      text: '*tiny yawn* Hello, little star. What dream are we building today?',
    },
  ]);

  const [soundOn, setSoundOn] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [projectQuery, setProjectQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const projectSearchRef = useRef(null);

  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem('pip-favorites') || '[]')
  );

  
const [toast, setToast] = useState('');
const [guestEntries, setGuestEntries] = useState([]);
const [guestSearch, setGuestSearch] = useState('');
const [guestShowAll, setGuestShowAll] = useState(false);
const [guestRefreshing, setGuestRefreshing] = useState(false);
const [chatMinimized, setChatMinimized] = useState(false);

// ✨ STAR BURST EFFECT — ADD HERE
const [clickStars, setClickStars] = useState([]);

const createStars = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();

  const stars = Array.from({ length: 16 }, (_, i) => ({
    id: `${Date.now()}-${i}-${Math.random()}`,
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    driftX: (Math.random() - 0.5) * 180,
    driftY: (Math.random() - 0.5) * 180,
    delay: Math.random() * 0.2,
    size: 10 + Math.random() * 18,
  }));

  setClickStars((previous) => [...previous, ...stars]);

  setTimeout(() => {
    setClickStars((previous) =>
      previous.filter((star) => !stars.some((s) => s.id === star.id))
    );
  }, 1200);
};

// Existing code continues unchanged
const pip = useFetch(API.PIP);
const projects = useFetch(API.PROJECTS);
const story = useFetch(API.STORY);
const dreams = useFetch(API.DREAMS);
const guestbook = useFetch(API.GUESTBOOK);


  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('pip-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('pip-muted', String(muted));
  }, [muted]);

  useEffect(() => {
    localStorage.setItem('pip-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (guestbook.data) {
      setGuestEntries(guestbook.data);
    }
  }, [guestbook.data]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === 'k'
      ) {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }

      if (e.key === 'Escape') {
  setCommandOpen(false);
  setDreamerOpen(false);
}

      // Press / anywhere outside a text field to jump straight to project search.
      const target = e.target;
      const isTypingTarget = target instanceof HTMLElement && (
        target.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      );
      if (e.key === '/' && !isTypingTarget && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.setTimeout(() => projectSearchRef.current?.focus(), 180);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const refreshVisitorCount = async () => {
    setVisitorRefreshing(true);
    try {
      const result = await get(API.VISITS);
      setVisitorCount(Number.isFinite(Number(result?.count)) ? Number(result.count) : 0);
    } catch {
      notify('The visitor stars are a little sleepy. Try again soon. ✦');
    } finally {
      setVisitorRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const seen = sessionStorage.getItem('pip-visited');

    (seen ? get(API.VISITS) : post(API.VISITS))
      .then((r) => {
        if (cancelled) return;
        setVisitorCount(Number.isFinite(Number(r?.count)) ? Number(r.count) : 0);
        sessionStorage.setItem('pip-visited', '1');
      })
      .catch(() => {
        // Keep the portfolio usable if the counter API is temporarily unavailable.
      });

    get(API.EASTER)
      .then((r) => {
        if (!cancelled) setSecretUnlocked(Number(r?.found) > 0);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  const chime = (freq = 660) => {
    if (muted) return;

    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;

      const ctx = new Audio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.08,
        ctx.currentTime + 0.02
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + 0.3
      );

      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.31);

      osc.onended = () => ctx.close();
    } catch {
      // Audio is optional. The portfolio still works without it.
    }
  };

  const tapStar = async () => {
    // Once discovered, Pip lets visitors open the little secret again.
    if (secretUnlocked) {
      setSecretRevealOpen(true);
      chime(880);
      return;
    }

    const next = starClicks + 1;
    setStarClicks(next);
    chime(440 + next * 100);

    if (next >= 5) {
      setStarClicks(0);
      setSecretUnlocked(true);
      setSecretRevealOpen(true);

      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.35 },
        disableForReducedMotion: true,
      });

      // The page still unlocks if the optional API is unavailable.
      post(API.EASTER, { code: 'nightcap' }).catch(() => {});
    }
  };

  const submitGuest = async (e) => {
    e.preventDefault();
    setGuestError('');

    if (!guestName.trim() || !guestMessage.trim()) {
      setGuestError('Add your name and a little note first.');
      return;
    }

    setGuestBusy(true);

    try {
      const item = await post(API.GUESTBOOK, {
        name: guestName.trim(),
        message: guestMessage.trim(),
      });

      setGuestEntries((old) => [item, ...old].slice(0, 50));
      setGuestName('');
      setGuestMessage('');

      notify('Your little note is pinned to the nursery wall ✦');
    } catch (err) {
      setGuestError(err.message);
    } finally {
      setGuestBusy(false);
    }
  };

  const refreshGuestbook = async () => {
    setGuestRefreshing(true);
    try {
      const entries = await get(API.GUESTBOOK);
      setGuestEntries(Array.isArray(entries) ? entries : []);
      setGuestError('');
    } catch (err) {
      setGuestError(err.message || 'The nursery wall could not be refreshed. Try again in a moment.');
    } finally {
      setGuestRefreshing(false);
    }
  };

  const filteredGuestEntries = guestEntries.filter((entry) => {
    const query = guestSearch.trim().toLowerCase();
    if (!query) return true;
    return `${entry.name || ''} ${entry.message || ''}`.toLowerCase().includes(query);
  });
  const visibleGuestEntries = guestShowAll
    ? filteredGuestEntries
    : filteredGuestEntries.slice(0, 4);

  const sendChat = async (e) => {
    e.preventDefault();

    const message = chatInput.trim();

    if (!message || chatBusy) return;

    setChatInput('');
    setChatLog((old) => [...old, { who: 'you', text: message }]);
    setChatBusy(true);

    try {
      const r = await post(API.CHAT, { message });

      setChatLog((old) => [
        ...old,
        { who: 'pip', text: r.reply },
      ]);
    } catch (err) {
      setChatLog((old) => [
        ...old,
        { who: 'pip', text: err.message },
      ]);
    } finally {
      setChatBusy(false);
    }
  };

  const nav = [
    ['Projects', '#projects'],
    ['Story', '#story'],
    ['Dream route', '#dreams'],
    ['Guestbook', '#guestbook'],
  ];

  const rawProjectItems = projects.data || [
    {
      slug: 'lullaby-lab',
      emoji: '🎵',
      title: 'The Lullaby Lab',
      blurb: 'A music box that dreams up gentle melodies.',
      tags: ['Web Audio', 'Generative'],
    },
    {
      slug: 'nightlights',
      emoji: '🏮',
      title: 'Nightlight Collection',
      blurb: 'Friendly lanterns for the dark.',
      tags: ['CSS', 'Animation'],
    },
    {
      slug: 'dream-routes',
      emoji: '☁️',
      title: 'Dream Delivery Routes',
      blurb: 'A map for delivering dreams.',
      tags: ['SVG', 'Motion'],
    },
    {
      slug: 'storybook',
      emoji: '📖',
      title: 'Bedtime Storybook',
      blurb: 'A little illustrated tale.',
      tags: ['Story', 'Illustration'],
    },
  ];
  const projectItems = rawProjectItems.map((p) => {
  if (p.slug === 'lullaby-lab') {
    return {
      ...p,
      tags: [...new Set([...(p.tags || []), 'Web Audio', 'Generative', 'Sound'])],
    };
  }

  return p;
});

 
const projectTags = [
  'All',
  'Web Audio',
  'Generative',
  'Sound',
  'CSS',
  'Animation',
  'Light',
  'SVG',
  'Motion',
  'Maps',
  'Story',
  'Illustration',
  'Play',
];

// Connect each category to the project it describes.
const projectCategorySlugs = {
  'Web Audio': ['lullaby-lab'],
  Generative: ['lullaby-lab'],
  Sound: ['lullaby-lab'],
  CSS: ['nightlights'],
  Animation: ['nightlights'],
  Light: ['nightlights'],
  SVG: ['dream-routes'],
  Motion: ['dream-routes'],
  Maps: ['dream-routes'],
  Story: ['storybook'],
  Illustration: ['storybook'],
  Play: ['lullaby-lab', 'nightlights', 'dream-routes', 'storybook'],
};

const visibleProjects = projectItems.filter((p) => {
  const searchText = [
    p.title || '',
    p.blurb || '',
    ...(p.tags || []),
    p.slug || '',
  ]
    .join(' ')
    .toLowerCase();

  const matchesQuery = searchText.includes(
    projectQuery.trim().toLowerCase()
  );

  const matchingSlugs = projectCategorySlugs[projectFilter];

  const matchesCategory =
    projectFilter === 'All' ||
    (p.tags || []).includes(projectFilter) ||
    (matchingSlugs && matchingSlugs.includes(p.slug));

  const matchesSaved = !showSavedOnly || favorites.includes(p.slug);
  return matchesQuery && matchesCategory && matchesSaved;
});


  const jumpTo = (href) => {
    setCommandOpen(false);
    document
      .querySelector(href)
      ?.scrollIntoView({ behavior: 'smooth' });
  };
  // Separate pages for the four Gloomlet experiences
const projectPage = window.location.pathname
  .split('/')
  .filter(Boolean)
  .pop();

if (
  window.location.pathname.startsWith('/projects/') &&
  ['lullaby-lab', 'nightlights', 'dream-routes', 'storybook'].includes(
    projectPage
  )
) {
  return <ProjectExperience />;
}
  const openLullaby = () => {
  setCommandOpen(false);
  setLullabyOpen(true);

  if (window.location.hash !== "#lullaby-lab") {
    window.history.pushState(null, "", "#lullaby-lab");
  }
};

const closeLullaby = () => {
  setLullabyOpen(false);

  window.history.pushState(null, "", "#projects");

  window.setTimeout(() => {
    document.getElementById("projects")?.scrollIntoView({
      behavior: "smooth",
    });
  }, 0);
};

  return (
    <div className="site-shell">
      <div className="announcement">
        <span className="pulse-dot" />
        TRANSMISSION FROM MIDNIGHT NURSERY
        <span className="announce-star">✦</span>
        EST. AFTER BEDTIME
      </div>

      <header className="nav-wrap">
        <a className="brand" href="#home">
          <span className="brand-icon">✦</span>
          <span>
            Gloomlet<span className="brand-dot">.</span>
            <small>A SMALL WORLD OF BIG IDEAS</small>
          </span>
        </a>

        <nav className={mobileOpen ? 'nav-links open' : 'nav-links'}>
          {nav.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </a>
          ))}
          <a href="#chat" onClick={() => setMobileOpen(false)}>
            Say hello <span>↗</span>
          </a>
        </nav>

        <div className="nav-actions">
          <button
            className="icon-btn command-trigger"
            onClick={() => setCommandOpen(true)}
            aria-label="Open quick navigation"
            title="Quick navigation (Ctrl/⌘ K)"
          >
            <Search size={17} />
          </button>

          <button
            className="icon-btn"
            onClick={() =>
              setTheme((t) => (t === 'day' ? 'night' : 'day'))
            }
            aria-label="Toggle day and night theme"
          >
            {theme === 'day' ? (
              <Moon size={18} />
            ) : (
              <Sun size={18} />
            )}
          </button>

          <button
            className="icon-btn"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Enable sound' : 'Mute sound'}
          >
            {muted ? (
              <VolumeX size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          <button
            className="icon-btn menu-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main>
        {/* HERO */}
        
{/* GLOOMLET — EDITORIAL HERO */}
<section className="hero section gloomlet-hero" id="home">
  <div className="hero-copy gloomlet-hero-copy">
    <div className="gloomlet-kicker">
      <span className="gloomlet-kicker-line" />
      AN EXPLORATION IN DREAMS & CODE
    </div>

    <div className="status-pill gloomlet-status">
      <span className="pulse-dot" />
      PIP · JUNIOR DREAM ENGINEER
    </div>

    <motion.h1
      className="gloomlet-headline"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      Meet Pip,
      <br />
      <em>the dreamer.</em>
    </motion.h1>

    <p className="hero-intro gloomlet-intro">
      I'm Pip, Junior Dream Engineer at the Midnight Nursery.
      <strong> I build the dreams you fall asleep inside.</strong>
      Every little project begins with a curious thought and a sprinkle of moonlight.
    </p>

    <div className="hero-cta gloomlet-cta">
      <a className="button button-primary" href="#projects">
        Explore the work <span aria-hidden="true">↗</span>
      </a>

      <a className="text-link" href="#story">
        Behind the world <span aria-hidden="true">↗</span>
      </a>
    </div>

    <div className="hero-pip-greeting">
      <p className="hero-pip-greeting-message" aria-live="polite">
        {heroGreetings[heroGreetingIndex]}
      </p>
      <button
        className="hero-pip-greeting-button"
        type="button"
        onClick={() => {
          setHeroGreetingIndex((current) => (current + 1) % heroGreetings.length);
          chime(540 + (heroGreetingIndex % 3) * 90);
        }}
        aria-label="Hear another greeting from Pip"
      >
        Say hello to Pip <span aria-hidden="true">↗</span>
      </button>
    </div>

    <div className="gloomlet-signature">
      <span className="gloomlet-signature-symbol">☾</span>
      <span>
        <strong>Junior Dream Engineer</strong>
        <small>
          {pip.data?.title || "Midnight Nursery · Dream division"}
        </small>
      </span>
    </div>

    <div className="gloomlet-edition">
      <span>INDEPENDENT CREATIONS</span>
      <span>VOL. 01 — FOREVER IN PROGRESS</span>
    </div>
  </div>

  
<div
  className="hero-visual gloomlet-hero-visual dreamer-visual"
  onPointerMove={(event) => {
    if (event.pointerType !== "mouse") return;

    const frame = event.currentTarget.querySelector(
      ".gloomlet-art-frame"
    );
    if (!frame) return;

    const rect = frame.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    frame.style.setProperty(
      "--dreamer-rotate-x",
      `${(0.5 - y) * 12}deg`
    );
    frame.style.setProperty(
      "--dreamer-rotate-y",
      `${(x - 0.5) * 14}deg`
    );
  }}
  onPointerLeave={(event) => {
    const frame = event.currentTarget.querySelector(
      ".gloomlet-art-frame"
    );
    if (!frame) return;

    frame.style.setProperty("--dreamer-rotate-x", "0deg");
    frame.style.setProperty("--dreamer-rotate-y", "0deg");
  }}
>
  <div className="gloomlet-art-orbit orbit-one" />
  <div className="gloomlet-art-orbit orbit-two" />

  {/* Original decorative stars */}
  <span className="gloomlet-art-star art-star-one">✦</span>
  <span className="gloomlet-art-star art-star-two">✧</span>
  <span className="gloomlet-art-star art-star-three">✦</span>

  {/* New floating stars */}
  <span className="dreamer-floating-star dreamer-star-one">✦</span>
  <span className="dreamer-floating-star dreamer-star-two">✧</span>
  <span className="dreamer-floating-star dreamer-star-three">✦</span>
  <span className="dreamer-floating-star dreamer-star-four">✧</span>
  <span className="dreamer-floating-star dreamer-star-five">✦</span>

  {/* Click the frame to open fullscreen */}
  <div
    className="gloomlet-art-frame dreamer-interactive-frame"
    role="button"
    tabIndex={0}
    aria-label="Open The Dreamer artwork"
    onClick={() => setDreamerOpen(true)}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setDreamerOpen(true);
      }
    }}
  >
    <div className="gloomlet-art-topline">
      <span>FIG. 001</span>
      <span>THE DREAMER</span>
    </div>

    <div className="image-halo gloomlet-image-halo">
      <PipArt />
    </div>

    <div className="gloomlet-art-bottomline">
      <span>AN UNUSUAL LITTLE UNIVERSE</span>
      <span>☾</span>
    </div>

    <span className="dreamer-open-hint">VIEW ARTWORK ↗</span>
  </div>

  {/* Original secret star — unchanged */}
  <button
    className="secret-star gloomlet-secret-star"
    onClick={tapStar}
    aria-label={secretUnlocked ? 'Open Pip’s discovered secret' : `Secret star, ${5 - starClicks} taps remaining`}
    aria-describedby="secret-star-hint"
    title={secretUnlocked ? 'Open Pip’s little secret again' : 'Tap five times to find a little secret'}
  >
    ★
  </button>
  <span className="secret-star-hint" id="secret-star-hint" aria-live="polite">
    {secretUnlocked ? 'SECRET FOUND ✦' : starClicks > 0 ? `${starClicks}/5 little taps` : 'psst… tap the star'}
  </span>


</div>


 
<a className="gloomlet-scroll" href="#story">
  <span className="scroll-divider"></span>
  <span>SCROLL TO EXPLORE</span>
  <span className="scroll-arrow">↓</span>
</a>

</section>


        {/* INTRODUCTION */}
       
<section className="section intro-strip">
  <div className="strip-number">01 / A LITTLE INTRO</div>

  <div>
    <p className="big-statement">
      I make <span>gentle things</span> for the in-between hours.
    </p>

    <p className="muted-copy">
      Part tinkerer, part professional napper. I build tiny
      experiences that make the internet feel a bit more like home.
    </p>

    {/* Insert the Dream Dispatch JSX from Step 2 here */}
  </div>

  <div className="strip-stamp">
    MADE AFTER
    <br />
    MOONRISE <span>✳</span>
  </div>
</section>


        {/* PROJECTS */}
        <section className="section" id="projects">
          <SectionHeading
            eyebrow="THE WORKSHOP"
            title="Little things I’ve made"
            description="Each project starts with a tiny idea and a very large cup of moon-milk."
          />

          {projects.error && (
            <p className="inline-error">
              {projects.error} — showing Pip’s sample projects.
            </p>
          )}

          <div className="project-tools" aria-label="Project discovery tools">
            <div className="project-search">
              <Search size={16} aria-hidden="true" />
              <input
                ref={projectSearchRef}
                value={projectQuery}
                onChange={(e) => setProjectQuery(e.target.value)}
                placeholder="Search tiny projects…"
                aria-label="Search projects by name, description, or technology"
                aria-keyshortcuts="/"
              />
              {projectQuery && (
                <button
                  type="button"
                  className="project-search-clear"
                  onClick={() => setProjectQuery('')}
                  aria-label="Clear project search"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
              <kbd aria-hidden="true">/</kbd>
            </div>

            <button
              type="button"
              className={`saved-projects-toggle ${showSavedOnly ? 'active' : ''}`}
              aria-pressed={showSavedOnly}
              onClick={() => setShowSavedOnly((current) => !current)}
            >
              <Bookmark size={14} fill={showSavedOnly ? 'currentColor' : 'none'} />
              Saved <span>{favorites.length}</span>
            </button>

            <div className="filter-chips" role="group" aria-label="Filter projects by category">
              {projectTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={projectFilter === tag ? 'active' : ''}
                  aria-pressed={projectFilter === tag}
                  onClick={() => setProjectFilter(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="project-results-line" aria-live="polite" aria-atomic="true">
              <span className="result-count">
                Showing {visibleProjects.length} of {projectItems.length} projects
              </span>
              {(projectQuery || projectFilter !== 'All' || showSavedOnly) && (
                <button
                  type="button"
                  className="project-reset-button"
                  onClick={() => {
                    setProjectQuery('');
                    setProjectFilter('All');
                    setShowSavedOnly(false);
                  }}
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          <div className="project-grid">
            {visibleProjects.map((p, i) => (
              <motion.article
                className={`project-card project-${(i % 4) + 1}`}
                key={p.slug || p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -5 }}
              >
                <div className="project-top">
                  <span className="project-index">
                    0{i + 1} / PROJECT
                  </span>

                  <div className="project-card-actions">
                    <span className="project-emoji">{p.emoji}</span>

                    <button
                      className={`favorite-btn ${
                        favorites.includes(p.slug) ? 'is-favorite' : ''
                      }`}
                      aria-label={
                        favorites.includes(p.slug)
                          ? `Remove ${p.title} from saved projects`
                          : `Save ${p.title}`
                      }
                      title={favorites.includes(p.slug) ? 'Remove from saved projects' : 'Save project'}
                      aria-pressed={favorites.includes(p.slug)}
                      onClick={() => {
                        setFavorites((old) =>
                          old.includes(p.slug)
                            ? old.filter((x) => x !== p.slug)
                            : [...old, p.slug]
                        );

                        notify(
                          favorites.includes(p.slug)
                            ? 'Project removed from your little collection.'
                            : 'Project saved to your little collection ✦'
                        );
                      }}
                    >
                      <Bookmark
                        size={16}
                        fill={
                          favorites.includes(p.slug)
                            ? 'currentColor'
                            : 'none'
                        }
                      />
                    </button>
                  </div>
                </div>

               
                {/* PROJECT IMAGE: LULLABY MUSIC BOX */}
                {p.slug === 'lullaby-lab' && (
                  <div className="project-artwork">
                    <img
                      src={musicBoxImage}
                      alt="The Lullaby Lab pastel music box"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.visibility = 'hidden';
                      }}
                    />
                    <span className="artwork-caption">
                      A LULLABY AFTER MOONRISE · 001
                    </span>
                  </div>
                )}

                {/* PROJECT IMAGE: DREAM NIGHTLIGHT */}
                {p.slug === 'nightlights' && (
                  <div className="project-artwork">
                    <img
                      src={lanternImage}
                      alt="A glowing dream lantern"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.visibility = 'hidden';
                      }}
                    />
                    <span className="artwork-caption">
                      LITTLE LIGHTS IN THE DARK · 002
                    </span>
                  </div>
                )}

                {/* PROJECT IMAGE: DREAM DELIVERY ROUTES */}
               
{p.slug === 'dream-routes' && (
  <div className="project-artwork">
    <img
      src="/images/dream_delivery_routes.png"
      alt="Gloomlet delivering dreams across floating islands"
      loading="lazy"
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
    <span className="artwork-caption">
      THE MIDNIGHT EXPRESS · 003
    </span>
  </div>
)}


                {/* PROJECT IMAGE: BEDTIME STORYBOOK */}

{p.slug === 'storybook' && (
  <div className="project-artwork">
    <img
      src="/images/bedtime_storybook.png"
      alt="Gloomlet reading a magical bedtime story"
      loading="lazy"
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
    <span className="artwork-caption">
      A STORY AFTER MOONRISE · 004
    </span>
  </div>
)}

                <h3>{p.title}</h3>
                <p>{p.blurb}</p>


                <div className="tag-list">
  {(p.tags || []).map((tag) => (
    <button
      key={tag}
      type="button"
      className={projectFilter === tag ? 'active' : ''}
      aria-pressed={projectFilter === tag}
      onClick={() => {
        setProjectFilter(tag);
        document
          .querySelector('#projects')
          ?.scrollIntoView({ behavior: 'smooth' });
      }}
      aria-label={`Filter projects by ${tag}`}
    >
      {tag}
    </button>
  ))}
</div>

                

<div className="project-foot">
  <span>BUILT AT MIDNIGHT</span>

  {p.slug === "lullaby-lab" ? (
    <button
      type="button"
      className="lullaby-open-button"
      onClick={openLullaby}
    >
      Open music studio ↗
    </button>
  ) : (
   
<a
  className="project-open-link dreamy-pill-link"
  href={`/projects/${p.slug}`}
  aria-label={`Discover project: ${p.title}`}
>
  <span>Discover project</span>
  <span className="project-link-arrow">↗</span>
</a>

  )}
</div>

</motion.article>
))}
</div>


          {visibleProjects.length === 0 && (
            <div className="empty-projects">
              <WandSparkles size={22} />
              <b>{showSavedOnly ? 'No saved dreams yet.' : 'No tiny projects found.'}</b>
              <span>{showSavedOnly ? 'Tap the bookmark on a project to keep it here.' : 'Try a different word or filter.'}</span>
              <button
                onClick={() => {
                  setProjectQuery('');
                  setProjectFilter('All');
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* STORY — interactive five-chapter origin experience */}
        <OriginStory chapters={story.data} />

        {/* DREAMSCAPE — interactive five-stop delivery route */}
        <section className="dream-section dreamscape-section" id="dreams">
          <div className="section dream-inner">
            <SectionHeading
              eyebrow="TONIGHT'S ITINERARY"
              title="A map made of dreams"
              description="Choose a little destination, discover the dream waiting there, and help Pip deliver it beneath the moon."
            />

            {(() => {
              const dreamStops = [
                { label: 'Nursery', x: 35, y: 235, icon: '☁', type: 'THE STARTING PLACE', title: 'The Midnight Nursery', description: 'Pip checks the satchel, ties the tiny pink bow, and makes sure every dream is wrapped with care.', dream: 'A soft cloud dream for someone who needs a gentle night.', color: '#e8a9c0', duration: '2 tiny minutes' },
                { label: 'Clock Tower', x: 110, y: 150, icon: '◷', type: 'A LITTLE PAUSE', title: 'The Clock Tower', description: 'The clocks here tick a little slower, leaving room for one more deep breath before tomorrow.', dream: 'A pocket of extra time for a very busy mind.', color: '#d6b7ef', duration: '3 slow ticks' },
                { label: 'Bakery Roof', x: 195, y: 205, icon: '♡', type: 'SOMETHING WARM', title: 'The Bakery Roof', description: 'Warm cinnamon air drifts over the rooftops. Pip leaves a dream that smells like home.', dream: 'A warm kitchen, a full table, and nowhere else to be.', color: '#f1cf8c', duration: '1 sweet minute' },
                { label: 'Windmill', x: 285, y: 105, icon: '✧', type: 'A BRAVE LITTLE DREAM', title: 'The Windmill Hill', description: 'The windmill turns slowly in the night breeze. Here, even the smallest wish can grow wings.', dream: 'A little courage to try something new tomorrow.', color: '#a7d2c1', duration: '4 starlit breaths' },
                { label: 'Moon Dock', x: 370, y: 40, icon: '☾', type: 'THE FINAL DELIVERY', title: 'The Moon Dock', description: 'At the edge of the sky, Pip hands the last dream to the moon and watches it float toward a sleepy window.', dream: 'A peaceful night and a bright beginning in the morning.', color: '#f0b7ca', duration: 'Until sunrise' },
              ];
              const activeStop = dreamStops[selectedDreamStop];
              const completedCount = deliveredDreamStops.length;
              const markDelivered = () => {
                if (deliveredDreamStops.includes(selectedDreamStop)) return;
                const next = [...deliveredDreamStops, selectedDreamStop];
                setDeliveredDreamStops(next);
                if (next.length === dreamStops.length) {
                  confetti({ particleCount: 75, spread: 65, origin: { y: 0.72 }, colors: ['#d98ca8', '#f0bd79', '#a88ad6', '#fff4e8'] });
                  setToast('All five dreams delivered. Pip says thank you, little star! ✨');
                } else {
                  setToast(`Dream delivered to ${activeStop.label}! ✨`);
                }
              };
              return (
                <>
                  <div className="dream-route-summary" aria-live="polite">
                    <div className="dream-route-status"><span className="pulse-dot" />{completedCount === dreamStops.length ? 'ALL DREAMS DELIVERED' : `DELIVERY ${String(completedCount + 1).padStart(2, '0')} OF 05`}</div>
                    <div className="dream-route-progress" role="progressbar" aria-label="Dream deliveries completed" aria-valuemin={0} aria-valuemax={dreamStops.length} aria-valuenow={completedCount}>
                      <span style={{ width: `${(completedCount / dreamStops.length) * 100}%` }} />
                    </div>
                    <span className="dream-route-count">{completedCount}/{dreamStops.length} delivered</span>
                  </div>

                  <div className="map-card dreamscape-map-card">
                    <div className="map-top">
                      <span><span className="pulse-dot" />MOONLIGHT EXPRESS · LIVE ROUTE</span>
                      <span>SELECT A STOP TO EXPLORE</span>
                    </div>
                    <svg className="dream-map dream-map-interactive" viewBox="0 0 420 285" role="group" aria-label="Interactive map with five dream delivery stops">
                      <defs>
                        <pattern id="dream-route-stars" width="32" height="32" patternUnits="userSpaceOnUse">
                          <circle cx="5" cy="8" r="1" fill="#b77a96" opacity=".24" />
                          <circle cx="24" cy="23" r=".7" fill="#b77a96" opacity=".22" />
                        </pattern>
                        <linearGradient id="dream-route-gradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#d98ca8" /><stop offset="100%" stopColor="#a88ad6" />
                        </linearGradient>
                        <filter id="dream-route-glow" x="-40%" y="-40%" width="180%" height="180%">
                          <feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      </defs>
                      <rect x="0" y="0" width="420" height="285" rx="18" fill="url(#dream-route-stars)" />
                      <path d="M 35 235 L 110 150 L 195 205 L 285 105 L 370 40" className="route-base" />
                      <motion.path d="M 35 235 L 110 150 L 195 205 L 285 105 L 370 40" className="route-glow" stroke="url(#dream-route-gradient)" filter="url(#dream-route-glow)" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2.2, ease: 'easeInOut' }} />
                      {dreamStops.map((stop, index) => {
                        const isSelected = selectedDreamStop === index;
                        const isDelivered = deliveredDreamStops.includes(index);
                        return (
                          <g key={stop.label} className={`dream-map-stop ${isSelected ? 'is-selected' : ''} ${isDelivered ? 'is-delivered' : ''}`} role="button" tabIndex={0} aria-label={`${stop.label}${isDelivered ? ', delivered' : ''}`} aria-pressed={isSelected} onClick={() => setSelectedDreamStop(index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedDreamStop(index); } }}>
                            <circle className="dream-stop-halo" cx={stop.x} cy={stop.y} r={isSelected ? 20 : 16} />
                            <circle className="dream-stop-core" cx={stop.x} cy={stop.y} r="7" />
                            <text className="map-label" x={stop.x} y={stop.y - 25} textAnchor="middle">{stop.label}</text>
                            <text className="map-number" x={stop.x} y={stop.y + 31} textAnchor="middle">{isDelivered ? '✓' : `0${index + 1}`}</text>
                          </g>
                        );
                      })}
                    </svg>
                    <div className="map-legend">
                      <span><i className="legend-dot" />DELIVERY STOP</span>
                      <span><i className="legend-line" />DREAM TRAIL</span>
                      <span>ETA: WHENEVER YOU'RE READY</span>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.article key={activeStop.label} className="dream-stop-detail" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} aria-live="polite">
                      <div className="dream-stop-art" style={{ '--stop-color': activeStop.color }} aria-hidden="true"><span>{activeStop.icon}</span><i>✦</i><b>✧</b></div>
                      <div className="dream-stop-copy">
                        <div className="dream-stop-kicker">{activeStop.type} <span>· STOP {String(selectedDreamStop + 1).padStart(2, '0')}</span></div>
                        <h3>{activeStop.title}</h3>
                        <p>{activeStop.description}</p>
                        <div className="dream-gift-note"><span>TONIGHT'S DREAM</span><p>“{activeStop.dream}”</p></div>
                        <div className="dream-stop-meta"><span>◷ {activeStop.duration}</span><span>{deliveredDreamStops.includes(selectedDreamStop) ? '✓ DREAM DELIVERED' : '✧ READY FOR DELIVERY'}</span></div>
                        <div className="dream-stop-actions">
                          <button className="dream-deliver-button" type="button" onClick={markDelivered} disabled={deliveredDreamStops.includes(selectedDreamStop)}>{deliveredDreamStops.includes(selectedDreamStop) ? 'Dream delivered ✓' : 'Deliver this dream ✦'}</button>
                          <button className="dream-next-button" type="button" onClick={() => setSelectedDreamStop((selectedDreamStop + 1) % dreamStops.length)}>{selectedDreamStop === dreamStops.length - 1 ? 'Back to Nursery ↶' : 'Next stop →'}</button>
                        </div>
                      </div>
                    </motion.article>
                  </AnimatePresence>
                  <div className="dream-route-footer"><span>✧</span> Every dream arrives exactly when it needs to. <button type="button" onClick={() => { setDeliveredDreamStops([]); setSelectedDreamStop(0); }}>Reset route</button></div>
                </>
              );
            })()}
          </div>
        </section>

        {/* GUESTBOOK */}
        <section className="section guest-section" id="guestbook">
          <div className="guest-intro">
            <SectionHeading
              eyebrow="LEAVE A LITTLE LIGHT"
              title="The nursery wall"
              description="Leave Pip a tiny note. Something kind, a wish, or a dream for tomorrow."
            />

            <div className="guest-doodle">
              ✍️
              <span>
                every little note
                <br />
                is a little star
              </span>
            </div>
          </div>

          <div className="guest-layout">
            <form className="guest-form" onSubmit={submitGuest}>
              <label>
                Your name
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  maxLength={30}
                  placeholder="What should Pip call you?"
                  required
                />
              </label>

              <label>
                Your little note
                <textarea
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  maxLength={200}
                  rows={4}
                  placeholder="I hope tomorrow brings..."
                  required
                />
              </label>

              <div className="form-foot">
                <span>{guestMessage.length}/200</span>
                <button
                  className="button button-primary"
                  disabled={guestBusy}
                  type="submit"
                >
                  {guestBusy ? 'Leaving note…' : 'Pin it to the wall'}
                  <Send size={15} />
                </button>
              </div>

              {guestError && (
                <p role="alert" className="inline-error">
                  {guestError}
                </p>
              )}

              {guestbook.error && (
                <p className="muted-copy">
                  Guestbook is taking a nap. You can still explore the rest
                  of the nursery.
                </p>
              )}
            </form>

            <div className="guest-wall">
              <div className="guest-wall-toolbar">
                <label className="guest-search">
                  <Search size={15} aria-hidden="true" />
                  <input
                    value={guestSearch}
                    onChange={(e) => {
                      setGuestSearch(e.target.value);
                      setGuestShowAll(false);
                    }}
                    placeholder="Find a little note…"
                    aria-label="Search guestbook notes"
                  />
                </label>
                <button
                  className="guest-refresh"
                  type="button"
                  onClick={refreshGuestbook}
                  disabled={guestRefreshing}
                >
                  {guestRefreshing ? 'Waking wall…' : '↻ Refresh'}
                </button>
              </div>

              <div className="guest-wall-caption">
                <span>✦ NOTES FROM LITTLE STARS</span>
                <span>{filteredGuestEntries.length} {filteredGuestEntries.length === 1 ? 'note' : 'notes'}</span>
              </div>

              <div className="notes-list">
                {visibleGuestEntries.map((entry, i) => (
                  <motion.article
                    className="note-card"
                    key={entry._id || `${entry.name}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: Math.min(i * 0.035, 0.2) }}
                  >
                    <div className="note-card-top">
                      <span>✦ A LITTLE NOTE</span>
                      <Heart size={15} aria-hidden="true" />
                    </div>
                    <p>“{entry.message}”</p>
                    <small>— {entry.name}</small>
                  </motion.article>
                ))}

                {filteredGuestEntries.length === 0 && (
                  <div className="empty-note">
                    <span>{guestSearch.trim() ? '🔎' : '☁️'}</span>
                    <b>{guestSearch.trim() ? 'No notes found just yet.' : 'The wall is still sleepy.'}</b>
                    <p>{guestSearch.trim() ? 'Try another name or word.' : 'Be the first to leave Pip a note.'}</p>
                    {guestSearch.trim() && (
                      <button type="button" onClick={() => setGuestSearch('')}>Clear search</button>
                    )}
                  </div>
                )}
              </div>

              {filteredGuestEntries.length > 4 && (
                <button
                  type="button"
                  className="guest-show-more"
                  onClick={() => setGuestShowAll((value) => !value)}
                >
                  {guestShowAll ? 'Show fewer notes ↑' : `Read all ${filteredGuestEntries.length} notes ↓`}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* CHAT */}
        <section className="section chat-section" id="chat">
          <div className="chat-card">
            <div className="chat-heading">
              <div className="chat-avatar">
                <PipArt small />
              </div>

              <div>
                <span className="eyebrow">MIDNIGHT FREQUENCY</span>
                <h2>A tiny chat with Pip</h2>
                <p>
                  <span className="pulse-dot" />
                  Usually awake. Occasionally yawning.
                </p>
              </div>

              <button
                className="icon-btn chat-minimize"
                onClick={() => setChatMinimized((v) => !v)}
                aria-label={
                  chatMinimized ? 'Expand chat' : 'Minimize chat'
                }
              >
                {chatMinimized ? (
                  <ArrowDown size={17} />
                ) : (
                  <X size={17} />
                )}
              </button>
            </div>

            {!chatMinimized && (
              <>
                <div className="chat-log" aria-live="polite">
                  {chatLog.map((m, i) => (
                    <div
                      key={i}
                      className={`chat-message ${
                        m.who === 'you' ? 'from-you' : 'from-pip'
                      }`}
                    >
                      <span>{m.who === 'you' ? 'YOU' : 'PIP'}</span>
                      <p>{m.text}</p>
                    </div>
                  ))}

                  {chatBusy && (
                    <div className="chat-message from-pip">
                      <span>PIP</span>
                      <p className="typing">*yawning while thinking…*</p>
                    </div>
                  )}
                </div>

                <form className="chat-form" onSubmit={sendChat}>
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    maxLength={300}
                    placeholder="Ask about dreams, stars, or snacks…"
                    aria-label="Message Pip"
                    disabled={chatBusy}
                  />

                  <button
                    type="submit"
                    disabled={chatBusy || !chatInput.trim()}
                    aria-label="Send message"
                  >
                    <Send size={17} />
                  </button>
                </form>

                <p className="chat-footnote">
                  A tiny AI-powered character chat. Please don’t share
                  private information.
                </p>
              </>
            )}
          </div>
        </section>

        {/* CLOSING */}
        <section className="closing-cta">
          <span className="closing-star">✦</span>
          <p className="eyebrow">BEFORE YOU DRIFT OFF</p>
          <h2>
            May your dreams
            <br />
            <em>be extra soft.</em>
          </h2>
          <p>Thanks for visiting my little corner of the internet.</p>
          <a className="button button-light" href="#home">
            Back to the stars ↑
          </a>
          <div className="closing-cloud">☁</div>
        </section>
      </main>

      {/* FOOTER */}
      

{/* GLOOMLET PREMIUM FOOTER */}
<footer className="gloomlet-footer" id="footer">
  <div className="footer-stars" aria-hidden="true">
    <span className="footer-star fs-one">✦</span>
    <span className="footer-star fs-two">✧</span>
    <span className="footer-star fs-three">✦</span>
    <span className="footer-star fs-four">✧</span>
    <span className="footer-moon">☾</span>
  </div>

  <div className="footer-main">
    <span className="footer-eyebrow">
      ✦ THE END OF THIS LITTLE ADVENTURE ✦
    </span>

    <h2 className="footer-big-title">
      Stay a little
      <br />
      <em>dreamy.</em>
    </h2>

    <p className="footer-description">
      The stars will be here when you return.
      <br />
      Until then, take a little magic with you.
    </p>

    <a className="footer-back-home" href="#home">
      <span>Back to the beginning</span>
      <span aria-hidden="true">↑</span>
    </a>
  </div>

  <div className="footer-divider">
    <span>✦</span>
  </div>

  <div className="footer-bottom">
    <a className="footer-brand" href="#home">
      <span className="footer-brand-icon">☾</span>
      <span className="footer-brand-text">
        <strong>
          Gloomlet<span>.</span>
        </strong>
        <small>A SMALL WORLD OF BIG IDEAS</small>
      </span>
    </a>

    <nav className="footer-links" aria-label="Footer navigation">
      <a href="#home">Home</a>
      <a href="#projects">Projects</a>
      <a href="#story">My story</a>
      <a href="#guestbook">Guestbook</a>
    </nav>

    <div className="footer-visitors" aria-label={visitorCount === null ? 'Visitor counter loading' : `Visitor number ${visitorCount}`}>
      <div className="footer-visitors-heading">
        <span className="footer-online-dot" />
        <span>VISITOR STARS</span>
        <button
          className="visitor-refresh"
          type="button"
          onClick={refreshVisitorCount}
          disabled={visitorRefreshing}
          aria-label="Refresh visitor count"
          title="Refresh visitor count"
        >
          <span className={visitorRefreshing ? 'visitor-refresh-icon is-spinning' : 'visitor-refresh-icon'}>↻</span>
        </button>
      </div>
      <strong className="visitor-odometer" aria-live="polite" aria-atomic="true">
        {(visitorCount === null ? '------' : String(visitorCount).padStart(6, '0')).split('').map((digit, index) => (
          <span className="visitor-digit-window" key={`${index}-${digit}`}>
            <span className={visitorCount === null ? 'visitor-digit is-loading' : 'visitor-digit'}>
              {digit}
            </span>
          </span>
        ))}
      </strong>
      <small className="visitor-caption">
        {visitorCount === null ? 'COUNTING LITTLE STARS…' : 'YOU ARE PART OF THE STORY'}
      </small>
    </div>
  </div>

  <div className="footer-credits">
    <span>MADE WITH <span className="footer-heart">♥</span> AND A LITTLE MOONLIGHT</span>
    <span>© {new Date().getFullYear()} GLOOMLET</span>
  </div>
</footer>



      {/* SECTION 7: THE NIGHTCAP SECRET REVEAL */}
      <AnimatePresence>
        {secretRevealOpen && (
          <motion.div
            className="secret-reveal-backdrop"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSecretRevealOpen(false);
            }}
          >
            <motion.section
              className="secret-reveal-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="secret-reveal-title"
              aria-describedby="secret-reveal-copy"
              initial={{ opacity: 0, y: 18, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <button
                className="secret-reveal-close"
                onClick={() => setSecretRevealOpen(false)}
                aria-label="Close Pip’s secret"
              >
                <X size={18} />
              </button>
              <div className="secret-reveal-sky" aria-hidden="true">
                <span className="secret-orbit secret-orbit-one" />
                <span className="secret-orbit secret-orbit-two" />
                <span className="secret-reveal-moon">☾</span>
                <span className="secret-reveal-star star-left">✦</span>
                <span className="secret-reveal-star star-right">✧</span>
                <span className="secret-reveal-star star-bottom">✦</span>
              </div>
              <span className="secret-reveal-eyebrow"><Star size={13} fill="currentColor" /> A SECRET FROM THE MIDNIGHT NURSERY</span>
              <h2 id="secret-reveal-title">You found the <em>nightcap magic.</em></h2>
              <p id="secret-reveal-copy">Pip keeps one tiny star tucked away for visitors who are curious enough to tap five times. It is a reminder that even the smallest, sleepiest ideas can light up a whole sky.</p>
              <div className="secret-reveal-note"><span>✦</span><p><strong>A little note from Pip</strong><br />“You looked a little closer. That is where the magic starts, little star.”</p></div>
              <button className="secret-reveal-button" onClick={() => setSecretRevealOpen(false)}>KEEP DREAMING <span aria-hidden="true">↗</span></button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK NAVIGATION */}
      <AnimatePresence>
        {commandOpen && (
          <motion.div
            className="command-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setCommandOpen(false);
              }
            }}
          >
            <motion.div
              className="command-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Quick navigation"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="command-title">
                <Command size={17} />
                <span>THE LITTLE NAVIGATOR</span>
                <kbd>ESC</kbd>
              </div>

              <p>Where shall we wander?</p>

              {[
                ['⌂', 'Home', '#home'],
                ['✦', 'Projects', '#projects'],
                ['☾', 'Pip’s story', '#story'],
                ['☁', 'Dream route', '#dreams'],
                ['♡', 'Guestbook', '#guestbook'],
                ['✉', 'Talk to Pip', '#chat'],
              ].map(([icon, label, href]) => (
                <button
                  className="command-row"
                  key={href}
                  onClick={() => jumpTo(href)}
                >
                  <span>{icon}</span>
                  {label}
                  <ArrowDown size={14} />
                </button>
              ))}

              <div className="command-bottom">
                TIP: PRESS <kbd>CTRL</kbd> + <kbd>K</kbd> ANYTIME
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

            {/* FEEDBACK TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="feedback-toast"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <Check size={16} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      
{/* THE DREAMER — FULLSCREEN ARTWORK */}
<AnimatePresence>
  {dreamerOpen && (
    <motion.div
      className="dreamer-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="The Dreamer artwork"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={() => setDreamerOpen(false)}
    >
      <motion.div
        className="dreamer-lightbox-panel"
        initial={{ opacity: 0, scale: 0.92, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="dreamer-lightbox-close"
          onClick={() => setDreamerOpen(false)}
          aria-label="Close fullscreen artwork"
          title="Close artwork (Esc)"
        >
          <X size={22} />
        </button>

        <div className="dreamer-lightbox-meta">
          <span>GLOOMLET · ART COLLECTION</span>
          <span>FIG. 001 / 001</span>
        </div>

        <div className="dreamer-lightbox-art">
          <span className="dreamer-lightbox-star lightbox-star-one">
            ✦
          </span>
          <span className="dreamer-lightbox-star lightbox-star-two">
            ✧
          </span>
          <span className="dreamer-lightbox-star lightbox-star-three">
            ✦
          </span>

          <PipArt />
        </div>

        <div className="dreamer-lightbox-caption">
          <div>
            <span className="dreamer-lightbox-eyebrow">
              AN UNUSUAL LITTLE UNIVERSE
            </span>
            <h2>The Dreamer</h2>
            <p>
              A tiny soul with a universe of dreams,
              collected beneath the moon.
            </p>
          </div>

          <span className="dreamer-lightbox-moon" aria-hidden="true">
            ☾
          </span>
        </div>

        <div className="dreamer-lightbox-footer">
          <span>MADE AFTER MOONRISE</span>
          <span>✦ A LITTLE PIECE OF MAGIC ✦</span>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


      {/* LULLABY LAB PAGE */}
      {lullabyOpen && (
        <LullabyLab onBack={closeLullaby} />
      )}
    </div>
  );
}

export default App;