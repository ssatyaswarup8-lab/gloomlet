
import { useEffect, useRef, useState } from 'react';
import {
  AudioLines,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Waves,
  Wind,
  CloudRain,
  Piano,
  Volume2,
  Sparkles,
  BookmarkPlus,
  Trash2,
  Check,
  Save,
} from 'lucide-react';
import './DreamscapeMixer.css';

const INITIAL_VOLUMES = {
  rain: 35,
  wind: 18,
  ocean: 28,
  piano: 22,
};

const SOUND_INFO = [
  {
    id: 'rain',
    name: 'Soft rain',
    icon: CloudRain,
    description: 'Rain on a quiet window',
  },
  {
    id: 'wind',
    name: 'Night wind',
    icon: Wind,
    description: 'A gentle airy breeze',
  },
  {
    id: 'ocean',
    name: 'Ocean waves',
    icon: Waves,
    description: 'Slow, distant waves',
  },
  {
    id: 'piano',
    name: 'Dream piano',
    icon: Piano,
    description: 'Soft generated notes',
  },
];

const PIANO_NOTES = [
  261.63, 329.63, 392, 349.23, 293.66, 440, 392, 329.63,
];

const SAVED_MIXES_STORAGE_KEY =
  'gloomlet-lullaby-lab-saved-mixes-v1';

const SOUND_PRESETS = [
  {
    id: 'rainy-night',
    name: 'Rainy Night',
    description: 'Gentle rain with a little night breeze',
    icon: CloudRain,
    volumes: { rain: 68, wind: 24, ocean: 8, piano: 14 },
  },
  {
    id: 'deep-sleep',
    name: 'Deep Sleep',
    description: 'A soft, low-key mix for winding down',
    icon: Moon,
    volumes: { rain: 24, wind: 12, ocean: 18, piano: 8 },
  },
  {
    id: 'ocean-dreams',
    name: 'Ocean Dreams',
    description: 'Distant waves and a calm airy breeze',
    icon: Waves,
    volumes: { rain: 10, wind: 22, ocean: 72, piano: 16 },
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    description: 'Balanced ambience with a gentle melody',
    icon: Sparkles,
    volumes: { rain: 18, wind: 8, ocean: 12, piano: 42 },
  },
];

function createNoiseBuffer(context) {
  const length = context.sampleRate * 3;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

function createNoiseLayer(context, master, buffer, id, volume) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = buffer;
  source.loop = true;

  if (id === 'rain') {
    filter.type = 'highpass';
    filter.frequency.value = 650;
    filter.Q.value = 0.5;
  } else if (id === 'wind') {
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 0.7;
  } else {
    filter.type = 'lowpass';
    filter.frequency.value = 750;
    filter.Q.value = 0.6;
  }

  gain.gain.value = (volume / 100) * 0.18;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start();

  const nodes = {
    source,
    filter,
    gain,
    lfo: null,
    lfoGain: null,
  };

  if (id === 'wind' || id === 'ocean') {
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();

    lfo.type = 'sine';
    lfo.frequency.value = id === 'wind' ? 0.09 : 0.045;
    lfoGain.gain.value = id === 'wind' ? 0.035 : 0.055;

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();

    nodes.lfo = lfo;
    nodes.lfoGain = lfoGain;
  }

  return nodes;
}

export default function DreamscapeMixer() {
  const audioRef = useRef(null);
  const pianoIntervalRef = useRef(null);
  const sleepIntervalRef = useRef(null);
  const noteIndexRef = useRef(0);
  const volumesRef = useRef(INITIAL_VOLUMES);

  const [playing, setPlaying] = useState(false);
  const [volumes, setVolumes] = useState(INITIAL_VOLUMES);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [masterVolume, setMasterVolume] = useState(55);
  const [mixName, setMixName] = useState('');

  const [savedMixes, setSavedMixes] = useState(() => {
    try {
      const stored = window.localStorage.getItem(
        SAVED_MIXES_STORAGE_KEY
      );
      const parsed = stored ? JSON.parse(stored) : [];

      return Array.isArray(parsed)
        ? parsed.filter(
            (mix) =>
              mix &&
              typeof mix.id === 'string' &&
              typeof mix.name === 'string' &&
              mix.volumes &&
              typeof mix.volumes === 'object'
          )
        : [];
    } catch {
      return [];
    }
  });

  const [sleepMinutes, setSleepMinutes] = useState(15);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [error, setError] = useState('');

  const stopTimers = () => {
    if (pianoIntervalRef.current !== null) {
      window.clearInterval(pianoIntervalRef.current);
      pianoIntervalRef.current = null;
    }

    if (sleepIntervalRef.current !== null) {
      window.clearInterval(sleepIntervalRef.current);
      sleepIntervalRef.current = null;
    }
  };

  const clearSleepTimer = () => {
    if (sleepIntervalRef.current !== null) {
      window.clearInterval(sleepIntervalRef.current);
      sleepIntervalRef.current = null;
    }
  };

  const startSleepTimer = (minutes) => {
    clearSleepTimer();

    if (minutes <= 0) {
      setRemainingSeconds(null);
      return;
    }

    setRemainingSeconds(minutes * 60);

    sleepIntervalRef.current = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous === null || previous <= 1) {
          return 0;
        }

        return previous - 1;
      });
    }, 1000);
  };

  const stopAudio = () => {
    stopTimers();

    const audio = audioRef.current;
    audioRef.current = null;

    if (audio) {
      audio.sources.forEach((source) => {
        try {
          source.stop();
        } catch {
          // The source may already have stopped.
        }
      });

      audio.context.close().catch(() => {});
    }

    setPlaying(false);
  };

  const playPianoNote = (audio) => {
    if (!audio || audio.context.state !== 'running') {
      return;
    }

    const { context, pianoGain } = audio;
    const now = context.currentTime;

    const frequency =
      PIANO_NOTES[
        noteIndexRef.current % PIANO_NOTES.length
      ];

    noteIndexRef.current += 1;

    const oscillator = context.createOscillator();
    const noteGain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.5, now + 0.08);
    noteGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 1.7
    );

    oscillator.connect(noteGain);
    noteGain.connect(pianoGain);

    oscillator.start(now);
    oscillator.stop(now + 1.75);

    audio.sources.push(oscillator);

    oscillator.onended = () => {
      try {
        oscillator.disconnect();
        noteGain.disconnect();
      } catch {
        // Already disconnected.
      }

      const index = audio.sources.indexOf(oscillator);

      if (index !== -1) {
        audio.sources.splice(index, 1);
      }
    };
  };

  const startAudio = async () => {
    setError('');

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      setError('Your browser does not support Web Audio.');
      return;
    }

    try {
      const context = new AudioContextClass();
      const master = context.createGain();

      master.gain.value = masterVolume / 100;
      master.connect(context.destination);

      const buffer = createNoiseBuffer(context);
      const layers = {};
      const sources = [];

      ['rain', 'wind', 'ocean'].forEach((id) => {
        layers[id] = createNoiseLayer(
          context,
          master,
          buffer,
          id,
          volumes[id]
        );

        sources.push(layers[id].source);

        if (layers[id].lfo) {
          sources.push(layers[id].lfo);
        }
      });

      const pianoGain = context.createGain();
      pianoGain.gain.value = (volumes.piano / 100) * 0.12;
      pianoGain.connect(master);

      const audio = {
        context,
        master,
        layers,
        pianoGain,
        sources,
      };

      audioRef.current = audio;

      if (context.state === 'suspended') {
        await context.resume();
      }

      if (audioRef.current !== audio) {
        await context.close().catch(() => {});
        return;
      }

      setPlaying(true);

      if (volumesRef.current.piano > 0) {
        playPianoNote(audio);

        pianoIntervalRef.current = window.setInterval(() => {
          if (
            audioRef.current === audio &&
            volumesRef.current.piano > 0
          ) {
            playPianoNote(audio);
          }
        }, 1250);
      }

      startSleepTimer(sleepMinutes);
    } catch {
      stopAudio();
      setError(
        'Audio could not start. Please try pressing Play again.'
      );
    }
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SAVED_MIXES_STORAGE_KEY,
        JSON.stringify(savedMixes)
      );
    } catch {
      setError(
        'Your browser could not save mixes. Check storage settings.'
      );
    }
  }, [savedMixes]);

  useEffect(() => {
    volumesRef.current = volumes;

    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    ['rain', 'wind', 'ocean'].forEach((id) => {
      const layer = audio.layers[id];

      if (layer) {
        const baseGain = (volumes[id] / 100) * 0.18;

        layer.gain.gain.setTargetAtTime(
          baseGain,
          audio.context.currentTime,
          0.08
        );
      }
    });

    audio.pianoGain.gain.setTargetAtTime(
      (volumes.piano / 100) * 0.12,
      audio.context.currentTime,
      0.08
    );

    if (volumes.piano > 0 && !pianoIntervalRef.current) {
      playPianoNote(audio);

      pianoIntervalRef.current = window.setInterval(() => {
        if (
          audioRef.current === audio &&
          volumesRef.current.piano > 0
        ) {
          playPianoNote(audio);
        }
      }, 1250);
    } else if (
      volumes.piano === 0 &&
      pianoIntervalRef.current !== null
    ) {
      window.clearInterval(pianoIntervalRef.current);
      pianoIntervalRef.current = null;
    }
  }, [volumes]);

  useEffect(() => {
    if (remainingSeconds === 0 && playing) {
      stopAudio();
    }
  }, [remainingSeconds, playing]);

  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.master.gain.setTargetAtTime(
        masterVolume / 100,
        audio.context.currentTime,
        0.08
      );
    }
  }, [masterVolume]);

  useEffect(() => {
    return () => {
      stopTimers();

      const audio = audioRef.current;
      audioRef.current = null;

      if (audio) {
        audio.sources.forEach((source) => {
          try {
            source.stop();
          } catch {
            // Already stopped.
          }
        });

        audio.context.close().catch(() => {});
      }
    };
  }, []);

  const togglePlayback = () => {
    if (playing) {
      stopAudio();
      setRemainingSeconds(null);
    } else {
      startAudio();
    }
  };

  const applyPreset = (preset) => {
    setVolumes({ ...preset.volumes });
    setSelectedPreset(preset.id);
    setError('');
  };

  const saveCurrentMix = (event) => {
    event.preventDefault();

    const cleanName = mixName.trim().slice(0, 32);

    if (!cleanName) {
      setError('Give your mix a name before saving it.');
      return;
    }

    const newMix = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      name: cleanName,
      volumes: { ...volumes },
      masterVolume,
      createdAt: new Date().toISOString(),
    };

    setSavedMixes((current) => [newMix, ...current]);
    setMixName('');
    setSelectedPreset(null);
    setError('');
  };

  const loadSavedMix = (mix) => {
    setVolumes({ ...INITIAL_VOLUMES, ...mix.volumes });

    setMasterVolume(
      Number.isFinite(mix.masterVolume) ? mix.masterVolume : 55
    );

    setSelectedPreset(null);
    setError('');
  };

  const deleteSavedMix = (id) => {
    setSavedMixes((current) =>
      current.filter((mix) => mix.id !== id)
    );
    setError('');
  };

  const resetMixer = () => {
    stopAudio();
    setVolumes(INITIAL_VOLUMES);
    setSelectedPreset(null);
    setMasterVolume(55);
    setSleepMinutes(15);
    setRemainingSeconds(null);
    setError('');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      remainder
    ).padStart(2, '0')}`;
  };

  return (
    <section className="dream-mixer">
      <div className="dream-mixer-heading">
        <span className="dream-mixer-kicker">
          <AudioLines size={15} /> YOUR PERSONAL SOUND UNIVERSE
        </span>

        <h2>Build a dreamscape.</h2>

        <p>
          Layer a little rain, a quiet breeze, distant waves, and a
          melody made just for this moment.
        </p>
      </div>

      <div
        className="dream-presets"
        aria-labelledby="dream-presets-title"
      >
        <div className="dream-presets-heading">
          <span className="dream-presets-icon" aria-hidden="true">
            <Sparkles size={17} />
          </span>

          <div>
            <h3 id="dream-presets-title">Start with a preset</h3>
            <p>Choose a mood, then fine-tune every sound below.</p>
          </div>
        </div>

        <div className="dream-presets-grid">
          {SOUND_PRESETS.map((preset) => {
            const PresetIcon = preset.icon;
            const isSelected = selectedPreset === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                className={`dream-preset-card${
                  isSelected ? ' is-active' : ''
                }`}
                onClick={() => applyPreset(preset)}
                aria-pressed={isSelected}
              >
                <span
                  className="dream-preset-card-icon"
                  aria-hidden="true"
                >
                  <PresetIcon size={19} />
                </span>

                <span className="dream-preset-card-copy">
                  <strong>{preset.name}</strong>
                  <small>{preset.description}</small>
                </span>

                <span
                  className="dream-preset-check"
                  aria-hidden="true"
                >
                  {isSelected ? '✓' : '+'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="dream-saved-mixes"
        aria-labelledby="dream-saved-title"
      >
        <div className="dream-saved-heading">
          <span className="dream-saved-icon" aria-hidden="true">
            <BookmarkPlus size={18} />
          </span>

          <div>
            <h3 id="dream-saved-title">Your saved mixes</h3>
            <p>Keep your favorite sound combinations close by.</p>
          </div>

          <span className="dream-saved-count">
            {savedMixes.length}
          </span>
        </div>

        <form className="dream-save-form" onSubmit={saveCurrentMix}>
          <label
            className="sr-only"
            htmlFor="dream-mix-name"
          >
            Name your mix
          </label>

          <input
            id="dream-mix-name"
            type="text"
            value={mixName}
            onChange={(event) => setMixName(event.target.value)}
            maxLength={32}
            placeholder="Name this mix (e.g. Rainy Study Night)"
            aria-label="Name your mix"
          />

          <button type="submit" className="dream-save-button">
            <Save size={16} /> Save current mix
          </button>
        </form>

        {savedMixes.length > 0 ? (
          <div className="dream-saved-grid">
            {savedMixes.map((mix) => (
              <article className="dream-saved-card" key={mix.id}>
                <div className="dream-saved-card-main">
                  <span
                    className="dream-saved-card-art"
                    aria-hidden="true"
                  >
                    <Moon size={19} />
                  </span>

                  <div className="dream-saved-card-copy">
                    <strong>{mix.name}</strong>

                    <small>
                      Rain {mix.volumes.rain ?? 0}% · Wind{' '}
                      {mix.volumes.wind ?? 0}%
                      <br />
                      Ocean {mix.volumes.ocean ?? 0}% · Piano{' '}
                      {mix.volumes.piano ?? 0}%
                      <br />
                      Master {mix.masterVolume ?? 55}%
                    </small>
                  </div>
                </div>

                <div className="dream-saved-card-actions">
                  <button
                    type="button"
                    className="dream-load-button"
                    onClick={() => loadSavedMix(mix)}
                    aria-label={`Load ${mix.name}`}
                  >
                    <Check size={15} /> Load mix
                  </button>

                  <button
                    type="button"
                    className="dream-delete-button"
                    onClick={() => deleteSavedMix(mix.id)}
                    aria-label={`Delete ${mix.name}`}
                    title={`Delete ${mix.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="dream-saved-empty">
            <Moon size={20} />
            <span>Your saved mixes will appear here.</span>
            <small>
              Adjust the sound layers, enter a name, and save your
              first mix.
            </small>
          </div>
        )}
      </div>

      <div className="dream-mixer-player">
        <div className="dream-mixer-disc" aria-hidden="true">
          <span>☾</span>
          <i>✦</i>
        </div>

        <div className="dream-mixer-now">
          <span>
            {playing ? 'NOW DRIFTING' : 'READY WHEN YOU ARE'}
          </span>

          <strong>
            {playing
              ? 'Your midnight soundscape'
              : 'A quieter little world'}
          </strong>

          <small>
            {playing
              ? 'Adjust any layer while your sounds play.'
              : 'Press play to begin your soundscape.'}
          </small>
        </div>

        <button
          type="button"
          className="dream-mixer-play"
          onClick={togglePlayback}
          aria-label={playing ? 'Stop soundscape' : 'Play soundscape'}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
          {playing ? 'Stop' : 'Play mix'}
        </button>
      </div>

      <div className="dream-mixer-layers">
        {SOUND_INFO.map((sound) => {
          const Icon = sound.icon;

          return (
            <div className="dream-layer" key={sound.id}>
              <div className="dream-layer-top">
                <span className="dream-layer-icon">
                  <Icon size={19} />
                </span>

                <div className="dream-layer-info">
                  <strong>{sound.name}</strong>
                  <small>{sound.description}</small>
                </div>

                <span className="dream-layer-value">
                  {volumes[sound.id]}%
                </span>
              </div>

              <label className="dream-slider-label">
                <span className="sr-only">
                  {sound.name} volume
                </span>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumes[sound.id]}
                  onChange={(event) => {
                    setSelectedPreset(null);
                    setVolumes((current) => ({
                      ...current,
                      [sound.id]: Number(event.target.value),
                    }));
                  }}
                  aria-label={`${sound.name} volume`}
                />
              </label>
            </div>
          );
        })}
      </div>

      <div className="dream-mixer-master">
        <div className="dream-master-title">
          <Volume2 size={18} />

          <div>
            <strong>Master volume</strong>
            <small>Controls the whole soundscape</small>
          </div>

          <span>{masterVolume}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={masterVolume}
          onChange={(event) => {
            setSelectedPreset(null);
            setMasterVolume(Number(event.target.value));
          }}
          aria-label="Master volume"
        />
      </div>

      <div className="dream-mixer-footer">
        <label className="dream-timer">
          <span>
            <Moon size={17} /> Sleep timer
          </span>

          <select
            className="dream-sleep-select"
            aria-label="Choose sleep timer duration"
            value={sleepMinutes}
            onChange={(event) => {
              const next = Number(event.target.value);
              setSleepMinutes(next);

              if (playing) {
                startSleepTimer(next);
              } else {
                clearSleepTimer();
                setRemainingSeconds(null);
              }
            }}
          >
            <option value={0}>No timer</option>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </label>

        <div className="dream-timer-status" aria-live="polite">
          {remainingSeconds !== null && remainingSeconds > 0
            ? `Stops in ${formatTime(remainingSeconds)}`
            : remainingSeconds === 0
              ? 'Your soundscape has ended.'
              : 'No timer running'}
        </div>

        <button
          type="button"
          className="dream-mixer-reset"
          onClick={resetMixer}
        >
          <RotateCcw size={15} /> Reset
        </button>
      </div>

      {error && (
        <p className="dream-mixer-error" role="alert">
          {error}
        </p>
      )}

      <p className="dream-mixer-note">
        ✦ All sounds are synthesized locally in your browser. No
        audio files or backend requests are needed.
      </p>
    </section>
  );
}
