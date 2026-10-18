
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  MapPin,
  Moon,
  Pause,
  Play,
  Square,
  RotateCcw,
  Sparkles,
  Sun,
  Volume2,
} from 'lucide-react';
import './ProjectExperience.css';
import DreamscapeMixer from './DreamscapeMixer.jsx';
const experiences = {
  'lullaby-lab': {
    number: '001',
    title: 'The Lullaby Lab',
    subtitle: 'A little music for your midnight mind.',
    description:
      'Compose a tiny soundscape, breathe slowly, and let the stars keep time.',
    icon: '♫',
  },
  nightlights: {
    number: '002',
    title: 'Nightlight Collection',
    subtitle: 'Make the dark feel a little kinder.',
    description:
      'Choose your glow, find your favorite color, and build a little pocket of calm.',
    icon: '☾',
  },
  'dream-routes': {
    number: '003',
    title: 'Dream Delivery Routes',
    subtitle: 'Five rooftops. One sleepy courier.',
    description:
      'Visit sleepy places across the night sky and deliver a little dream to each one.',
    icon: '☁',
  },
  storybook: {
    number: '004',
    title: 'Bedtime Storybook',
    subtitle: 'A story that changes when you do.',
    description:
      'Make a few gentle choices and discover how tonight’s little adventure ends.',
    icon: '✧',
  },
};

const destinations = [
  {
    name: 'Midnight Nursery',
    x: 65,
    y: 210,
    description: 'Where tiny dreams are carefully packed for the night.',
    dream: 'A pocketful of courage',
  },
  {
    name: 'Clock Tower',
    x: 155,
    y: 115,
    description: 'The clocks here tick slowly, so nobody has to hurry.',
    dream: 'An extra hour of peaceful sleep',
  },
  {
    name: 'Cloud Bakery',
    x: 245,
    y: 190,
    description: 'Warm cloud-buns are baked for the sleepiest stars.',
    dream: 'A warm hug from someone you love',
  },
  {
    name: 'Moon Garden',
    x: 320,
    y: 90,
    description: 'Silver flowers bloom whenever somebody has a kind thought.',
    dream: 'A garden full of happy memories',
  },
  {
    name: 'Moon Dock',
    x: 385,
    y: 205,
    description: 'The last stop, where the moon tucks the world in.',
    dream: 'A sky full of wonderful possibilities',
  },
];

const stories = {
  beginning: {
    title: 'The Little Star That Got Lost',
    paragraphs: [
      'One quiet evening, Pip found a little star hiding inside a teacup. It had fallen from the sky and was too shy to shine.',
      '“I can help you find your way home,” Pip whispered. But first, the little star needed to decide what kind of journey it wanted.',
    ],
    question: 'How should Pip begin the journey?',
    choices: [
      { label: 'Follow the moonlit path', value: 'moon' },
      { label: 'Ask a friendly cloud', value: 'cloud' },
    ],
  },
  moon: {
    title: 'The Moonlit Path',
    paragraphs: [
      'Pip followed a silver trail across the rooftops. Every step made a tiny musical note, and the lost star began to glow again.',
      'At the edge of the sky, Pip discovered a little bridge made from moonbeams. Something was waiting on the other side.',
    ],
    question: 'What should Pip carry across the bridge?',
    choices: [
      { label: 'A lantern of hope', value: 'lantern' },
      { label: 'A letter of kindness', value: 'letter' },
    ],
  },
  cloud: {
    title: 'The Friendliest Cloud',
    paragraphs: [
      'A fluffy cloud drifted down and offered Pip a ride. It smelled like vanilla and sounded like a lullaby.',
      'Together, they floated above sleepy houses until the lost star remembered a familiar constellation.',
    ],
    question: 'How should Pip help the star shine?',
    choices: [
      { label: 'Sing a little lullaby', value: 'lantern' },
      { label: 'Tell it a kind story', value: 'letter' },
    ],
  },
};

const endings = {
  lantern: {
    title: 'The Lantern of Hope',
    text: 'Pip lifted the lantern, and its warm golden light showed the star the way home. Before returning to the sky, the star left a little sparkle in Pip’s pocket. It still shines whenever someone needs courage.',
    symbol: '🏮',
  },
  letter: {
    title: 'The Letter of Kindness',
    text: 'Pip read the little letter aloud. Every kind word became a new star, until the sky was brighter than ever. The lost star found its family, and Pip discovered that kindness can light up even the longest night.',
    symbol: '💌',
  },
};

export default function ProjectExperience() {
  const slug = window.location.pathname
    .split('/')
    .filter(Boolean)
    .pop();

  const project = experiences[slug];
  const audioContext = useRef(null);
  const noteIndex = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(35);
  const [tempo, setTempo] = useState('gentle');
  const [soundMood, setSoundMood] = useState('dreamy');

  const [lampColor, setLampColor] = useState('#f3c77b');
  const [brightness, setBrightness] = useState(75);
  const [lampMood, setLampMood] = useState('moonlight');

  const [selectedStop, setSelectedStop] = useState(0);
const [delivered, setDelivered] = useState([]);
const [deliveryAnimating, setDeliveryAnimating] = useState(false);
const [showRouteCelebration, setShowRouteCelebration] = useState(false);
const [deliveryMessage, setDeliveryMessage] = useState('');
  const [storyStage, setStoryStage] = useState('beginning');
  const [ending, setEnding] = useState(null);
const [isStorySpeaking, setIsStorySpeaking] = useState(false);
  useEffect(() => {
    if (project) {
      document.title = `${project.title} | Gloomlet`;
    }

    return () => {
      if (audioContext.current) {
        audioContext.current.close().catch(() => {});
        audioContext.current = null;
      }
    };
  }, [project]);

  useEffect(() => {
    if (!playing || slug !== 'lullaby-lab') return;

    const noteSets = {
      dreamy: [261.63, 329.63, 392, 329.63, 293.66, 349.23],
      starlight: [392, 493.88, 587.33, 493.88, 440, 523.25],
      rainy: [220, 261.63, 293.66, 261.63, 196, 246.94],
    };

    const notes = noteSets[soundMood] || noteSets.dreamy;
    const delays = { gentle: 850, sleepy: 1250, twinkle: 480 };

    const timer = window.setInterval(() => {
      const ctx = audioContext.current;
      if (!ctx || ctx.state !== 'running') return;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      oscillator.type = 'sine';
      oscillator.frequency.value = notes[noteIndex.current % notes.length];

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(
        Math.max(0.0002, (volume / 100) * 0.08),
        now + 0.06
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.72);

      noteIndex.current += 1;
    }, delays[tempo] || 850);

    return () => window.clearInterval(timer);
  }, [playing, volume, tempo, soundMood, slug]);

  const toggleMusic = async () => {
    const Audio = window.AudioContext || window.webkitAudioContext;

    if (!Audio) {
      window.alert('Your browser does not support Web Audio.');
      return;
    }

    if (!audioContext.current || audioContext.current.state === 'closed') {
      audioContext.current = new Audio();
    }

    if (audioContext.current.state === 'suspended') {
      await audioContext.current.resume();
    }

    setPlaying((current) => !current);
  };

  
const deliverDream = () => {
  if (delivered.includes(selectedStop) || deliveryAnimating) {
    return;
  }

  setDeliveryAnimating(true);
  setDeliveryMessage(
    `A little dream is flying to ${destinations[selectedStop].name}...`
  );

  window.setTimeout(() => {
    setDelivered((current) => {
      if (current.includes(selectedStop)) {
        return current;
      }

      const updated = [...current, selectedStop];

      if (updated.length === destinations.length) {
        setShowRouteCelebration(true);
        setDeliveryMessage(
          'Every little dream has found its home. Wonderful work!'
        );
      } else {
        setDeliveryMessage(
          `Dream delivered to ${destinations[selectedStop].name}! ✨`
        );
      }

      return updated;
    });

    setDeliveryAnimating(false);
  }, 900);
};


  const resetStory = () => {
    setStoryStage('beginning');
    setEnding(null);
  };

  const chooseStory = (choice) => {
    if (storyStage === 'beginning') {
      setStoryStage(choice);
    } else {
      setEnding(choice);
    }
  };
  


const readStoryAloud = () => {
  if (!("speechSynthesis" in window)) {
    window.alert("Read Aloud is not supported by this browser.");
    return;
  }

  window.speechSynthesis.cancel();
  setIsStorySpeaking(false);

  const textToRead = ending
    ? `${endings[ending].title}. ${endings[ending].text}`
    : `${stories[storyStage].title}. ${stories[storyStage].paragraphs.join(" ")} ${stories[storyStage].question}`;

  const voices = window.speechSynthesis.getVoices();

  // Prefer Indian English, then another English voice.
  const indianVoice =
    voices.find((voice) => voice.lang.toLowerCase() === "en-in") ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en-in")) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));

  const utterance = new SpeechSynthesisUtterance(textToRead);

  if (indianVoice) {
    utterance.voice = indianVoice;
  }

  utterance.lang = "en-IN";
  utterance.rate = 0.88;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onstart = () => setIsStorySpeaking(true);
  utterance.onend = () => setIsStorySpeaking(false);
  utterance.onerror = () => setIsStorySpeaking(false);

  window.speechSynthesis.speak(utterance);
};


const stopStoryAloud = () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  setIsStorySpeaking(false);
};



  const goHome = () => {
    window.location.href = '/#projects';
  };

  if (!project) {
    return (
      <main className="experience-page">
        <div className="experience-shell experience-not-found">
          <span className="experience-kicker">LOST IN THE NIGHT SKY</span>
          <h1>That little dream is missing.</h1>
          <p>Let’s find our way back to the Gloomlet workshop.</p>
          <button className="experience-button" onClick={goHome}>
            <ArrowLeft size={16} /> Back to Gloomlet
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={`experience-page experience-${slug}`}>
      <div className="experience-shell">
        <header className="experience-nav">
          <a className="experience-brand" href="/">
            <span>✦</span> Gloomlet<span className="experience-brand-dot">.</span>
          </a>

          <button
            type="button"
            className="experience-back"
            onClick={goHome}
          >
            <ArrowLeft size={16} />
            Back to projects
          </button>
        </header>

        <section className="experience-heading">
          <span className="experience-kicker">
            <Sparkles size={13} />
            GLOOMLET ART COLLECTION · {project.number}
          </span>
          <h1>{project.title}</h1>
          <p className="experience-subtitle">{project.subtitle}</p>
          <p className="experience-description">{project.description}</p>
        </section>

        {slug === 'lullaby-lab' && (
          <section className="experience-panel music-panel">
            <div className="music-art">
              <div className="music-orbit music-orbit-one" />
              <div className="music-orbit music-orbit-two" />
              <span className="music-star music-star-one">✦</span>
              <span className="music-star music-star-two">✧</span>
              <div className={`music-disc ${playing ? 'music-disc-playing' : ''}`}>
                <span>♫</span>
              </div>
              <p>{playing ? 'THE STARS ARE SINGING' : 'YOUR LITTLE SOUND STUDIO'}</p>
            </div>

            <div className="experience-controls">
              <span className="experience-label">01 / SOUND LAB</span>
              <h2>Make a little magic.</h2>
              <p>Every time you press play, a soft sequence of notes begins.</p>

              <button
                type="button"
                className="experience-button experience-button-wide"
                onClick={toggleMusic}
              >
                {playing ? <Pause size={17} /> : <Play size={17} />}
                {playing ? 'Pause the lullaby' : 'Play a little lullaby'}
              </button>

              <label className="experience-field">
                Melody mood
                <select value={soundMood} onChange={(e) => setSoundMood(e.target.value)}>
                  <option value="dreamy">Dreamy piano</option>
                  <option value="starlight">Starlight sparkle</option>
                  <option value="rainy">Rainy evening</option>
                </select>
              </label>

              <label className="experience-field">
                Rhythm
                <select value={tempo} onChange={(e) => setTempo(e.target.value)}>
                  <option value="sleepy">Extra sleepy</option>
                  <option value="gentle">Gentle</option>
                  <option value="twinkle">Little twinkles</option>
                </select>
              </label>

              <label className="experience-field slider-field">
                <span><Volume2 size={16} /> Volume</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                />
                <small>{volume}%</small>
              </label>

              <p className="experience-note">
                ✦ This melody is generated in your browser. No audio file is required.
              </p>
            </div>
          </section>
        )}
        {slug === 'lullaby-lab' && <DreamscapeMixer />}

        {slug === 'nightlights' && (
          <section className="experience-panel nightlight-panel">
            <div className="lamp-stage">
              <div
                className="lamp-glow"
                style={{
                  backgroundColor: lampColor,
                  opacity: brightness / 100,
                }}
              />
              <div
                className="lamp-illustration"
                style={{
                  '--lamp-color': lampColor,
                  '--lamp-brightness': brightness / 100,
                }}
              >
                <div className="lamp-cap" />
                <div className="lamp-glass">
                  <span className="lamp-moon">☾</span>
                  <span className="lamp-star lamp-star-a">✦</span>
                  <span className="lamp-star lamp-star-b">✧</span>
                </div>
                <div className="lamp-base" />
              </div>
              <span className="lamp-stage-caption">YOUR LITTLE POCKET OF CALM</span>
            </div>

            <div className="experience-controls">
              <span className="experience-label">02 / GLOW STUDIO</span>
              <h2>Find your favorite glow.</h2>
              <p>Try a preset or choose any color for your very own nightlight.</p>

              <div className="mood-options">
                {[
                  { name: 'Moonlight', color: '#f3c77b' },
                  { name: 'Lavender', color: '#bca5f2' },
                  { name: 'Rose cloud', color: '#f2a6c5' },
                  { name: 'Ocean dream', color: '#8bc8e9' },
                ].map((mood) => (
                  <button
                    key={mood.name}
                    type="button"
                    className={`mood-swatch ${lampMood === mood.name.toLowerCase() ? 'is-selected' : ''}`}
                    onClick={() => {
                      setLampColor(mood.color);
                      setLampMood(mood.name.toLowerCase());
                    }}
                    aria-label={`Choose ${mood.name}`}
                    title={mood.name}
                    style={{ '--swatch-color': mood.color }}
                  >
                    <span />
                    {mood.name}
                  </button>
                ))}
              </div>

              <label className="experience-field color-field">
                Custom color
                <input
                  type="color"
                  value={lampColor}
                  onChange={(e) => {
                    setLampColor(e.target.value);
                    setLampMood('custom');
                  }}
                />
              </label>

              <label className="experience-field slider-field">
                <span><Sun size={16} /> Brightness</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                />
                <small>{brightness}%</small>
              </label>

              <p className="experience-note">
                ✦ Your lamp settings update instantly as you play.
              </p>
            </div>
          </section>
        )}

    
{slug === 'dream-routes' && (
  <section className="experience-panel route-panel">
    <div className="route-map-area">
      <div className="route-map-topline">
        <span>
          <span className="route-live-dot" />
          NIGHT ROUTE ACTIVE
        </span>

        <span>
          {delivered.length} / {destinations.length} DREAMS DELIVERED
        </span>
      </div>

      <div className="route-stars" aria-hidden="true">
        ✦　·　✧　·　✦　·　✧
      </div>

      <svg
        className={`route-map-svg ${
          deliveryAnimating ? 'route-map-delivering' : ''
        }`}
        viewBox="0 0 440 285"
        role="img"
        aria-label="Interactive dream delivery map with five destinations"
      >
        <defs>
          <linearGradient
            id="gloomlet-route-line"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="#efb2cc" />
            <stop offset="100%" stopColor="#b9a4f4" />
          </linearGradient>
        </defs>

        <path
          className="route-trail-glow"
          d="M65 210 Q90 130 155 115 T245 190 T320 90 T385 205"
          fill="none"
          stroke="url(#gloomlet-route-line)"
          strokeWidth="7"
          strokeDasharray="5 8"
          strokeLinecap="round"
        />

        <path
          className="route-trail"
          d="M65 210 Q90 130 155 115 T245 190 T320 90 T385 205"
          fill="none"
          stroke="url(#gloomlet-route-line)"
          strokeWidth="3"
          strokeDasharray="5 8"
          strokeLinecap="round"
        />

        {destinations.map((stop, index) => (
          <g
            key={stop.name}
            className={`route-stop ${
              selectedStop === index ? 'route-stop-active' : ''
            } ${
              delivered.includes(index) ? 'route-stop-done' : ''
            }`}
            onClick={() => setSelectedStop(index)}
            role="button"
            tabIndex="0"
            aria-label={`Select ${stop.name}${
              delivered.includes(index) ? ', delivered' : ''
            }`}
            aria-pressed={selectedStop === index}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSelectedStop(index);
              }
            }}
          >
            <circle
              cx={stop.x}
              cy={stop.y}
              r="20"
              className="route-stop-ring"
            />

            <circle
              cx={stop.x}
              cy={stop.y}
              r="9"
              className="route-stop-dot"
            />

            <text
              x={stop.x}
              y={stop.y - 29}
              textAnchor="middle"
              className="route-stop-number"
            >
              {delivered.includes(index)
                ? '✓'
                : String(index + 1).padStart(2, '0')}
            </text>

            {selectedStop === index && (
              <circle
                cx={stop.x}
                cy={stop.y}
                r="26"
                className="route-stop-pulse"
              />
            )}
          </g>
        ))}

        {deliveryAnimating && (
          <g className="route-delivery-sparkle" aria-hidden="true">
            <circle
              cx={destinations[selectedStop].x}
              cy={destinations[selectedStop].y}
              r="28"
            />
            <text
              x={destinations[selectedStop].x}
              y={destinations[selectedStop].y - 34}
              textAnchor="middle"
            >
              ✦
            </text>
          </g>
        )}
      </svg>

     

<div className="route-map-legend">
  <span>✦ FOLLOW THE DOTTED DREAM TRAIL ✦</span>
</div>

{/* DREAM JOURNAL */}
<section className="dream-journal">
  <div className="dream-journal-header">
    <div>
      <span className="dream-journal-label">
        YOUR LITTLE NIGHT ADVENTURE
      </span>
      <h3>Dream Journal</h3>
    </div>
    <span className="dream-journal-moon">☾</span>
  </div>

  <p className="dream-journal-quote">
    {delivered.length === 0
      ? '"Every beautiful journey begins with one little dream."'
      : delivered.length < 3
        ? '"The stars grow brighter with every kindness."'
        : delivered.length < 5
          ? '"You are leaving little pieces of magic everywhere."'
          : '"Tonight, every dream has found its home. Sweet dreams, little courier."'}
  </p>

  <div className="dream-journal-divider">
    <span>✦</span>
    <span>YOUR STAR COLLECTION</span>
    <span>✦</span>
  </div>

  <div className="dream-journal-stars">
    {destinations.map((stop, index) => (
      <div
        key={stop.name}
        className={`dream-journal-star ${
          delivered.includes(index) ? "collected" : ""
        }`}
        title={stop.name}
      >
        <span>
          {delivered.includes(index) ? "★" : "☆"}
        </span>
        <small>{stop.name}</small>
      </div>
    ))}
  </div>

  <div className="dream-journal-progress">
    <div className="dream-journal-progress-heading">
      <span>Nightly magic collected</span>
      <strong>{delivered.length}/{destinations.length}</strong>
    </div>

    <div className="dream-journal-progress-track">
      <div
        className="dream-journal-progress-fill"
        style={{
          width: `${
            (delivered.length / destinations.length) * 100
          }%`,
        }}
      />
    </div>
  </div>

  <div className="dream-journal-footer">
    <span className="dream-journal-footer-icon">
      {delivered.length === destinations.length ? "🌟" : "✨"}
    </span>
    <div>
      <strong>
        {delivered.length === destinations.length
          ? "Guardian of Dreams"
          : delivered.length >= 3
            ? "Keeper of the Moon"
            : delivered.length >= 1
              ? "Little Star Collector"
              : "Your adventure awaits"}
      </strong>
      <p>
        {delivered.length === destinations.length
          ? "All five dreams delivered. The night is complete!"
          : `${destinations.length - delivered.length} more ${
              destinations.length - delivered.length === 1
                ? "dream"
                : "dreams"
            } to complete your constellation.`}
      </p>
    </div>
  </div>
</section>

    </div>
    <div className="experience-controls route-controls">
      {showRouteCelebration ? (
        <div className="route-celebration">
          <div className="route-celebration-icon">🌙</div>

          <span className="experience-label">
            MISSION COMPLETE
          </span>

          <h2>Dreams delivered.</h2>

          <p>
            Every rooftop is resting peacefully. You brought a
            little magic to the whole night sky.
          </p>

          <div className="route-completion-stars">
            ✦ ✧ ✦ ✧ ✦
          </div>

          <button
            type="button"
            className="experience-button experience-button-wide"
            onClick={() => {
              setDelivered([]);
              setSelectedStop(0);
              setDeliveryAnimating(false);
              setShowRouteCelebration(false);
              setDeliveryMessage('');
            }}
          >
            <RotateCcw size={17} />
            Deliver dreams again
          </button>
        </div>
      ) : (
        <>
          <span className="experience-label">
            03 / DELIVERY LOG
          </span>

          <h2>{destinations[selectedStop].name}</h2>

          <p>{destinations[selectedStop].description}</p>

          <div className="dream-gift">
            <span>✧ TONIGHT'S LITTLE DREAM</span>
            <strong>{destinations[selectedStop].dream}</strong>
          </div>

          <div className="route-selected-status">
            {delivered.includes(selectedStop)
              ? '✓ This dream has reached its destination.'
              : `Destination ${String(selectedStop + 1).padStart(2, '0')} of ${destinations.length}`}
          </div>

          <button
            type="button"
            className={`experience-button experience-button-wide ${
              deliveryAnimating ? 'route-delivery-button-busy' : ''
            }`}
            onClick={deliverDream}
            disabled={
              delivered.includes(selectedStop) || deliveryAnimating
            }
          >
            {delivered.includes(selectedStop) ? (
              <Check size={17} />
            ) : (
              <MapPin size={17} />
            )}

            {deliveryAnimating
              ? 'Delivering a little magic...'
              : delivered.includes(selectedStop)
                ? 'Dream delivered!'
                : 'Deliver this dream'}
          </button>

          <div
            className="route-progress-track"
            role="progressbar"
            aria-label="Dream delivery progress"
            aria-valuemin={0}
            aria-valuemax={destinations.length}
            aria-valuenow={delivered.length}
          >
            <span
              style={{
                width: `${
                  (delivered.length / destinations.length) * 100
                }%`,
              }}
            />
          </div>

          <small className="route-progress-label">
            {destinations.length - delivered.length} sleepy
            destination(s) left
          </small>

          <p className="route-delivery-message" aria-live="polite">
            {deliveryMessage}
          </p>

          <div className="route-destination-list">
            {destinations.map((stop, index) => (
              <button
                type="button"
                key={stop.name}
                className={`route-destination-item ${
                  selectedStop === index ? 'is-selected' : ''
                } ${
                  delivered.includes(index) ? 'is-delivered' : ''
                }`}
                onClick={() => setSelectedStop(index)}
              >
                <span className="route-destination-number">
                  {delivered.includes(index) ? '✓' : index + 1}
                </span>

                <span>{stop.name}</span>

                <span className="route-destination-status">
                  {delivered.includes(index) ? 'Done' : 'Waiting'}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="experience-text-button"
            onClick={() => {
              setDelivered([]);
              setSelectedStop(0);
              setDeliveryAnimating(false);
              setShowRouteCelebration(false);
              setDeliveryMessage('');
            }}
          >
            <RotateCcw size={14} />
            Restart delivery route
          </button>
        </>
      )}
    </div>
  </section>
)}


        {slug === 'storybook' && (
          <section className="experience-panel storybook-panel">
            <div className="storybook-art">
              <div className="storybook-moon">☾</div>
              <span className="storybook-star storybook-star-a">✦</span>
              <span className="storybook-star storybook-star-b">✧</span>
              <div className="storybook-book">
                <div className="storybook-book-page">
                  <span>✦</span>
                  <strong>Once upon a moon...</strong>
                  <small>A Gloomlet bedtime tale</small>
                </div>
              </div>
              <div className="storybook-cloud">☁</div>
            </div>

            <div className="experience-controls story-controls">
              <span className="experience-label">04 / TONIGHT'S STORY</span>
              
<div className="storybook-progress">
  <div className="storybook-progress-heading">
    <span>
      {ending
        ? 'YOUR STORY IS COMPLETE'
        : storyStage === 'beginning'
          ? 'CHAPTER 01 · THE BEGINNING'
          : 'CHAPTER 02 · THE ADVENTURE'}
    </span>

    <span>{ending ? '100%' : storyStage === 'beginning' ? '33%' : '66%'}</span>
  </div>

  <div className="storybook-progress-track">
    <span
      style={{
        width: ending
          ? '100%'
          : storyStage === 'beginning'
            ? '33%'
            : '66%',
      }}
    />
  </div>
</div>


              {ending ? (
                <>
                  <div className="ending-symbol">{endings[ending].symbol}</div>
                  
<div className="storybook-ending-badge">
  <Sparkles size={14} />
  YOUR VERY OWN HAPPY ENDING
</div>

                  <h2>{endings[ending].title}</h2>
                  <p>{endings[ending].text}</p>
                  <div className="story-ending-note">
                    <Sparkles size={16} />
                    And everybody slept happily ever after.
                  </div>
                  <button
                    type="button"
                    className="experience-button experience-button-wide"
                    onClick={resetStory}
                  >
                    <RotateCcw size={16} /> Read another way
                  </button>
                </>
              ) : (
                <>
                  <h2>{stories[storyStage].title}</h2>
                  {stories[storyStage].paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  
<div className="storybook-audio-controls">
  <button
    type="button"
    className="storybook-audio-button"
    onClick={readStoryAloud}
  >
    <Volume2 size={16} />
    Read this chapter aloud
  </button>

  
<button
  type="button"
  className="storybook-audio-stop"
  onClick={isStorySpeaking ? stopStoryAloud : readStoryAloud}
  aria-label={isStorySpeaking ? "Stop narration" : "Start narration"}
>
  {isStorySpeaking ? (
    <>
      <Square size={15} />
      Stop
    </>
  ) : (
    <>
      <Play size={15} />
      Start
    </>
  )}
</button>

</div>


                  <div className="story-choice-box">
                    <strong>{stories[storyStage].question}</strong>
                    {stories[storyStage].choices.map((choice) => (
                      <button
                        type="button"
                        className="story-choice"
                        key={choice.value + choice.label}
                        onClick={() => chooseStory(choice.value)}
                      >
                        {choice.label}
                        <span>↗</span>
                      </button>
                    ))}
                  </div>

                  {storyStage !== 'beginning' && (
                    <button
                      type="button"
                      className="experience-text-button"
                      onClick={resetStory}
                    >
                      <RotateCcw size={14} /> Start the story again
                    </button>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        <footer className="experience-footer">
          <span>MADE AFTER MOONRISE</span>
          <span>✦ A LITTLE PIECE OF MAGIC ✦</span>
          <button type="button" onClick={goHome}>RETURN TO THE WORKSHOP ↗</button>
        </footer>
      </div>
    </main>
  );
}

