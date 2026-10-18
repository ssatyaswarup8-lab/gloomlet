import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Heart,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  WandSparkles,
} from "lucide-react";
import "./LullabyLab.css";

const SCALES = {
  Dreamy: [261.63, 293.66, 329.63, 392, 440, 523.25],
  Stardust: [293.66, 349.23, 392, 440, 523.25, 587.33],
  Rainy: [220, 261.63, 293.66, 329.63, 392, 440],
};

const MOODS = [
  { name: "Dreamy", note: "Soft moonlight and sleepy stars", symbol: "☾" },
  { name: "Stardust", note: "A tiny dance between constellations", symbol: "✦" },
  { name: "Rainy", note: "Gentle raindrops on the nursery window", symbol: "☂" },
];

function createAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  return new AudioContextClass();
}

export default function LullabyLab({ onBack }) {
  const contextRef = useRef(null);
  const timerRef = useRef(null);
  const stepRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mood, setMood] = useState("Dreamy");
  const [tempo, setTempo] = useState(78);
  const [volume, setVolume] = useState(45);
  const [melodySeed, setMelodySeed] = useState(0);
  const [step, setStep] = useState(0);
  const [audioError, setAudioError] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  const playNote = useCallback((frequency, duration = 1.15) => {
    const context = contextRef.current;
    if (!context || isMuted || volume === 0) return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const overtone = context.createOscillator();
    const gain = context.createGain();
    const overtoneGain = context.createGain();
    const master = Math.max(0.0001, (volume / 100) * 0.13);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    overtone.type = "triangle";
    overtone.frequency.setValueAtTime(frequency * 2, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(master, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.exponentialRampToValueAtTime(master * 0.22, now + 0.025);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.72);
    oscillator.connect(gain).connect(context.destination);
    overtone.connect(overtoneGain).connect(context.destination);
    oscillator.start(now);
    overtone.start(now);
    oscillator.stop(now + duration + 0.04);
    overtone.stop(now + duration + 0.04);
  }, [isMuted, volume]);

  const tick = useCallback(() => {
    const scale = SCALES[mood] || SCALES.Dreamy;
    const pattern = [0, 2, 4, 3, 1, 4, 5, 2];
    const current = stepRef.current % pattern.length;
    const variation = (melodySeed + current) % 3 === 0 ? 1 : 0;
    const noteIndex = (pattern[current] + variation) % scale.length;
    playNote(scale[noteIndex], current % 3 === 0 ? 1.45 : 0.95);
    stepRef.current = (current + 1) % pattern.length;
    setStep(stepRef.current);
  }, [mood, melodySeed, playNote]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const start = useCallback(async () => {
    setAudioError("");
    try {
      if (!contextRef.current) contextRef.current = createAudioContext();
      if (!contextRef.current) {
        setAudioError("This browser does not support Web Audio. Try a recent browser.");
        return;
      }
      if (contextRef.current.state === "suspended") await contextRef.current.resume();
      setIsPlaying(true);
      tick();
    } catch {
      setAudioError("The music box could not start. Please tap Play again.");
      setIsPlaying(false);
    }
  }, [tempo, tick]);

  const togglePlayback = () => {
    if (isPlaying) stop();
    else void start();
  };

  const composeNew = () => {
    setMelodySeed((value) => value + 1);
    stepRef.current = 0;
    setStep(0);
    // When playback is active, the interval effect picks up the new melody seed.
    // When paused, the next Play starts from the beginning of the new pattern.
  };

  useEffect(() => {
    if (!isPlaying) return undefined;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(tick, Math.round(60000 / tempo));
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, tempo, tick]);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (contextRef.current && contextRef.current.state !== "closed") {
      contextRef.current.close().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      // The interval is refreshed by the effect above when mood or melody changes.
      stepRef.current = step % 8;
    }
  }, [mood, melodySeed]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="lullaby-page">
      <header className="lullaby-header">
        <button className="lullaby-back" onClick={onBack} type="button">
          <ArrowLeft size={16} />
          <span>Back to Gloomlet</span>
        </button>
        <span className="lullaby-brand">GLOOMLET <span>RADIO ✦</span></span>
        <span className="lullaby-live"><span /> LIVE MUSIC BOX</span>
      </header>

      <main className="lullaby-main">
        <section className="lullaby-intro">
          <span className="lullaby-eyebrow">THE MIDNIGHT LISTENING ROOM</span>
          <h1>The Lullaby <em>Lab.</em></h1>
          <p>Wind up a tiny music box and let it invent a gentle melody just for this moment.</p>
        </section>

        <section className="lullaby-studio">
          <div className="lullaby-art">
            <div className="lullaby-orbit lullaby-orbit-one" />
            <div className="lullaby-orbit lullaby-orbit-two" />
            <span className="lullaby-star star-a">✦</span>
            <span className="lullaby-star star-b">✧</span>
            <span className="lullaby-star star-c">✦</span>
            <div className={`lullaby-record ${isPlaying ? "record-playing" : ""}`}>
              <div className="record-center"><span>{MOODS.find((item) => item.name === mood)?.symbol || "☾"}</span><small>G</small></div>
            </div>
            <div className="lullaby-art-caption"><span>FIG. 008</span><span>MADE OF TINY NOTES</span></div>
          </div>

          <div className="lullaby-player">
            <div className="lullaby-track-heading">
              <div>
                <span className="lullaby-eyebrow">NOW {isPlaying ? "PLAYING" : "WAITING TO PLAY"}</span>
                <h2>{mood} Lullaby</h2>
                <p>{MOODS.find((item) => item.name === mood)?.note}</p>
              </div>
              <span className="lullaby-track-category">WEB AUDIO</span>
            </div>

            <div className="lullaby-sequence" aria-label={`Melody step ${step + 1} of 8`}>
              {Array.from({ length: 8 }, (_, index) => (
                <span key={index} className={isPlaying && index === step ? "active" : ""} aria-hidden="true">
                  {index % 2 === 0 ? "✦" : "·"}
                </span>
              ))}
            </div>

            <div className="lullaby-controls">
              <button className="lullaby-icon-button" onClick={composeNew} type="button" aria-label="Compose a new melody" title="Compose a new melody">
                <WandSparkles size={18} />
              </button>
              <button className="lullaby-play-button" onClick={togglePlayback} type="button" aria-label={isPlaying ? "Pause music box" : "Play music box"} title={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
              </button>
              <button className="lullaby-icon-button" onClick={() => { stepRef.current = 0; setStep(0); }} type="button" aria-label="Reset melody position" title="Reset melody position">
                <RefreshCw size={18} />
              </button>
              <div className="lullaby-volume">
                <button className="lullaby-icon-button" onClick={() => setIsMuted((value) => !value)} type="button" aria-label={isMuted ? "Unmute music" : "Mute music"} title={isMuted ? "Unmute" : "Mute"}>
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input type="range" min="0" max="100" step="5" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Music box volume" />
              </div>
            </div>

            <div className="lullaby-lab-controls">
              <label>
                <span>MELODY MOOD</span>
                <select value={mood} onChange={(event) => setMood(event.target.value)} aria-label="Choose melody mood">
                  {MOODS.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                </select>
              </label>
              <label>
                <span>TEMPO <b>{tempo} BPM</b></span>
                <input type="range" min="48" max="120" step="2" value={tempo} onChange={(event) => setTempo(Number(event.target.value))} aria-label="Melody tempo" />
              </label>
            </div>

            {audioError && <p className="lullaby-error" role="status">{audioError}</p>}
            <div className="lullaby-note"><Heart size={14} /><span>Every lullaby is made live in your browser. No audio files needed.</span></div>
          </div>
        </section>

        <section className="lullaby-playlist">
          <div className="lullaby-playlist-heading">
            <div><span className="lullaby-eyebrow">PICK A LITTLE UNIVERSE</span><h2>Choose your bedtime mood</h2></div>
            <span className="lullaby-track-count">3 MOODS</span>
          </div>
          <div className="lullaby-track-list">
            {MOODS.map((item) => (
              <button key={item.name} type="button" className={`lullaby-track-row ${mood === item.name ? "active" : ""}`} onClick={() => setMood(item.name)} aria-pressed={mood === item.name}>
                <span className="lullaby-row-icon">{item.symbol}</span>
                <span className="lullaby-row-title"><strong>{item.name}</strong><small>{item.note}</small></span>
                <span className="lullaby-row-category">GENERATIVE</span>
                <span className="lullaby-row-action"><Sparkles size={16} /></span>
              </button>
            ))}
          </div>
        </section>

        <footer className="lullaby-footer"><Heart size={16} /><span>A SMALL MUSIC BOX FOR A VERY LARGE NIGHT.</span><span>☾ ✦</span></footer>
      </main>
    </div>
  );
}
