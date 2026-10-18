import { useEffect, useState } from 'react';
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

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('pip-theme') || 'day'
  );
  const [muted, setMuted] = useState(
    () => localStorage.getItem('pip-muted') === 'true'
  );
  const [starClicks, setStarClicks] = useState(0);
  const [secretFound, setSecretFound] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lullabyOpen, setLullabyOpen] = useState(
  () => window.location.hash === "#lullaby-lab"
  );
  const [dreamerOpen, setDreamerOpen] = useState(false);
  const [visitorCount, setVisitorCount] = useState(null);

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

  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem('pip-favorites') || '[]')
  );

  
const [toast, setToast] = useState('');
const [guestEntries, setGuestEntries] = useState([]);
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
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  useEffect(() => {
    const seen = sessionStorage.getItem('pip-visited');

    (seen ? get(API.VISITS) : post(API.VISITS))
      .then((r) => {
        setVisitorCount(r.count);
        sessionStorage.setItem('pip-visited', '1');
      })
      .catch(() => {});

    get(API.EASTER)
      .then((r) => setSecretFound(r.found > 0))
      .catch(() => {});
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
    const next = starClicks + 1;
    setStarClicks(next);
    chime(440 + next * 100);

    if (next >= 5) {
      setStarClicks(0);
      setSecretFound(true);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.35 },
        disableForReducedMotion: true,
      });

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

  return matchesQuery && matchesCategory;
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
      CURRENTLY CREATING
    </div>

    <motion.h1
      className="gloomlet-headline"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      A little
      <br />
      <em>otherworldly.</em>
    </motion.h1>

    <p className="hero-intro gloomlet-intro">
      Welcome to <strong>Gloomlet</strong> — a quiet corner for
      curious ideas, midnight experiments, and things made with
      a little imagination.
    </p>

    <div className="hero-cta gloomlet-cta">
      <a className="button button-primary" href="#projects">
        Explore the work <span aria-hidden="true">↗</span>
      </a>

      <a className="text-link" href="#story">
        Behind the world <span aria-hidden="true">↗</span>
      </a>
    </div>

    <div className="gloomlet-signature">
      <span className="gloomlet-signature-symbol">☾</span>
      <span>
        <strong>A world after dark</strong>
        <small>
          {pip.data?.title || "Ideas, gathered after moonrise"}
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
    aria-label={`Secret star, click ${5 - starClicks} more times`}
    title="A small secret is hidden here"
  >
    ★
  </button>


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

          <div className="project-tools">
            <label className="project-search">
              <Search size={16} />
              <input
                value={projectQuery}
                onChange={(e) => setProjectQuery(e.target.value)}
                placeholder="Search tiny projects…"
                aria-label="Search projects"
              />
              <kbd>/</kbd>
            </label>

            <div className="filter-chips" aria-label="Filter projects">
              {projectTags.map((tag) => (
                <button
                  key={tag}
                  className={projectFilter === tag ? 'active' : ''}
                  onClick={() => setProjectFilter(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            <span className="result-count">
              {visibleProjects.length} little{' '}
              {visibleProjects.length === 1 ? 'thing' : 'things'}
            </span>
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
                      title="Save project"
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
      className="project-open-link"
      href={`/projects/${p.slug}`}
      aria-label={`Explore ${p.title}`}
    >
      Explore ↗
    </a>
  )}
</div>

</motion.article>
))}
</div>


          {visibleProjects.length === 0 && (
            <div className="empty-projects">
              <WandSparkles size={22} />
              <b>No tiny projects found.</b>
              <span>Try a different word or filter.</span>
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

        {/* STORY */}
        <section className="section story-section" id="story">
          <SectionHeading
            eyebrow="ONCE UPON A MOON"
            title="How it all began"
            description="A very small origin story, told in five sleepy chapters."
          />

          <div className="story-layout">
            <div className="story-art">
              <div className="moon-disc">☾</div>
              <span className="story-spark s1">✦</span>
              <span className="story-spark s2">✧</span>

              <PipArt small />

              <p>
                “Nobody was scared.
                <br />
                Everybody yawned.”
              </p>
            </div>

            <div className="timeline">
              {(story.data || []).map((s, i) => (
                <motion.article
                  className="story-item"
                  key={s._id || s.order}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <span className="timeline-dot">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div>
                    <span className="eyebrow">
                      CHAPTER {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* DREAM ROUTE */}
        <section className="dream-section" id="dreams">
          <div className="section dream-inner">
            <SectionHeading
              eyebrow="TONIGHT'S ITINERARY"
              title="A map made of dreams"
              description="Five rooftops, one tiny courier, and absolutely no rush."
            />

            <div className="map-card">
              <div className="map-top">
                <span>
                  <span className="pulse-dot" />
                  ROUTE STATUS: IN PROGRESS
                </span>
                <span>MOONLIGHT EXPRESS · ROUTE 001</span>
              </div>

              <svg
                className="dream-map"
                viewBox="0 0 420 285"
                role="img"
                aria-label="Pip’s dream route connecting five rooftops"
              >
                <defs>
                  <pattern
                    id="dream-route-stars"
                    width="32"
                    height="32"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="5" cy="8" r="1" fill="#b77a96" opacity=".24" />
                    <circle cx="24" cy="23" r=".7" fill="#b77a96" opacity=".22" />
                  </pattern>
                  <linearGradient id="dream-route-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#d98ca8" />
                    <stop offset="100%" stopColor="#a88ad6" />
                  </linearGradient>
                  <filter id="dream-route-glow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <rect
                  x="0"
                  y="0"
                  width="420"
                  height="285"
                  rx="18"
                  fill="url(#dream-route-stars)"
                />

                <path
                  d="M 35 235 L 110 150 L 195 205 L 285 105 L 370 40"
                  fill="none"
                  style={{ fill: 'none', stroke: '#dfc6d4', strokeWidth: 3, strokeDasharray: '3 8', strokeLinecap: 'round', strokeLinejoin: 'round' }}
                />

                <motion.path
                  d="M 35 235 L 110 150 L 195 205 L 285 105 L 370 40"
                  fill="none"
                  style={{ fill: 'none', stroke: 'url(#dream-route-gradient)', strokeWidth: 3.5, strokeLinecap: 'round', strokeLinejoin: 'round', filter: 'url(#dream-route-glow)' }}
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2.2, ease: 'easeInOut' }}
                />

                {[
                  { label: 'Nursery', x: 35, y: 235 },
                  { label: 'Clock Tower', x: 110, y: 150 },
                  { label: 'Bakery Roof', x: 195, y: 205 },
                  { label: 'Windmill', x: 285, y: 105 },
                  { label: 'Moon Dock', x: 370, y: 40 },
                ].map((stop, index) => (
                  <g key={stop.label}>
                    <circle
                      cx={stop.x}
                      cy={stop.y}
                      r="15"
                      fill="#fff8f4"
                      stroke="#d8a4b5"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={stop.x}
                      cy={stop.y}
                      r="6"
                      fill="#a84e70"
                      stroke="#fffaf5"
                      strokeWidth="2"
                    />
                    <text
                      x={stop.x}
                      y={stop.y - 23}
                      textAnchor="middle"
                      fontFamily="DM Sans, sans-serif"
                      fontSize="10"
                      fontWeight="700"
                      fill="#473448"
                      stroke="#faf4ed"
                      strokeWidth="4"
                      strokeLinejoin="round"
                      paintOrder="stroke fill"
                    >
                      {stop.label}
                    </text>
                    <text
                      x={stop.x}
                      y={stop.y + 30}
                      textAnchor="middle"
                      fontFamily="DM Mono, monospace"
                      fontSize="9"
                      letterSpacing="1"
                      fill="#a84e70"
                    >
                      0{index + 1}
                    </text>
                  </g>
                ))}
              </svg>

              <div className="map-legend">
                <span>
                  <i className="legend-dot" /> DELIVERY STOP
                </span>
                <span>
                  <i className="legend-line" /> DREAM TRAIL
                </span>
                <span>ETA: WHENEVER YOU’RE READY</span>
              </div>
            </div>
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

            <div className="notes-list">
              {guestEntries.slice(0, 4).map((entry, i) => (
                <article
                  className="note-card"
                  key={entry._id || i}
                >
                  <div className="note-card-top">
                    <span>✦ A LITTLE NOTE</span>
                    <Heart size={15} />
                  </div>
                  <p>“{entry.message}”</p>
                  <small>— {entry.name}</small>
                </article>
              ))}

              {guestEntries.length === 0 && (
                <div className="empty-note">
                  <span>☁️</span>
                  <b>The wall is still sleepy.</b>
                  <p>Be the first to leave Pip a note.</p>
                </div>
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

    <div className="footer-visitors">
      <span className="footer-online-dot" />
      <span>VISITORS</span>
      <strong>
        {visitorCount === null
          ? '······'
          : String(visitorCount).padStart(6, '0')}
      </strong>
    </div>
  </div>

  <div className="footer-credits">
    <span>MADE WITH <span className="footer-heart">♥</span> AND A LITTLE MOONLIGHT</span>
    <span>© {new Date().getFullYear()} GLOOMLET</span>
  </div>
</footer>



      {/* SECRET STAR MESSAGE */}
      <AnimatePresence>
        {secretFound && (
          <motion.div
            className="secret-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Star size={17} fill="currentColor" />
            You found Pip’s secret! A star for you.
            <button
              onClick={() => setSecretFound(false)}
              aria-label="Dismiss secret message"
            >
              <X size={15} />
            </button>
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