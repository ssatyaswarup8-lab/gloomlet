
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Disc3,
  Heart,
  ListMusic,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import "./LullabyLab.css";

const tracks = [
  {
    title: "Moonlit Piano",
    mood: "A little melody beneath the moon",
    src: "/audio/clavier-music-moonlight-relaxing-piano-music-285580.mp3",
    category: "PIANO",
  },
  {
    title: "Rainy Window",
    mood: "Soft rain for a quieter mind",
    src: "/audio/oxidvideos-rain-ambience-319235.mp3",
    category: "AMBIENT",
  },
  {
    title: "Sleepy Stars",
    mood: "A gentle goodnight to the stars",
    src: "/audio/marlowemusic-dreamy-ambient-587567.mp3",
    category: "DREAMSCAPE",
  },
];

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function LullabyLab({ onBack }) {
  const audioRef = useRef(null);

  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.65);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState("");

  const track = tracks[trackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = isMuted;

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
        setAudioError(
          "This track could not be played. Check that its MP3 file exists."
        );
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, trackIndex, volume, isMuted]);

  function togglePlayback() {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setAudioError("");
    setIsPlaying(true);
  }

  function selectTrack(index) {
    setTrackIndex(index);
    setCurrentTime(0);
    setDuration(0);
    setAudioError("");
    setIsPlaying(true);
  }

  function nextTrack() {
    selectTrack((trackIndex + 1) % tracks.length);
  }

  function previousTrack() {
    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    selectTrack((trackIndex - 1 + tracks.length) % tracks.length);
  }

  function seek(event) {
    const nextTime = Number(event.target.value);

    if (audioRef.current && Number.isFinite(nextTime)) {
      audioRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  }

  return (
    <div className="lullaby-page">
      <audio
        ref={audioRef}
        src={track.src}
        preload="metadata"
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onLoadedMetadata={(event) =>
          setDuration(event.currentTarget.duration || 0)
        }
        onDurationChange={(event) =>
          setDuration(event.currentTarget.duration || 0)
        }
        onEnded={nextTrack}
        onError={() => {
          setIsPlaying(false);
          setAudioError(
            "Audio file not found. Check the filename in public/audio."
          );
        }}
      />

      <header className="lullaby-header">
        <button className="lullaby-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Gloomlet</span>
        </button>

        <span className="lullaby-brand">
          GLOOMLET <span>RADIO ✦</span>
        </span>

        <span className="lullaby-live">
          <span /> YOUR LITTLE MUSIC ROOM
        </span>
      </header>

      <main className="lullaby-main">
        <section className="lullaby-intro">
          <span className="lullaby-eyebrow">
            THE MIDNIGHT LISTENING ROOM
          </span>

          <h1>
            The Lullaby <em>Lab.</em>
          </h1>

          <p>
            A little music for the hours when the world grows quiet.
            Choose a tune, get comfortable, and stay awhile.
          </p>
        </section>

        <section className="lullaby-studio">
          <div className="lullaby-art">
            <div className="lullaby-orbit lullaby-orbit-one" />
            <div className="lullaby-orbit lullaby-orbit-two" />

            <span className="lullaby-star star-a">✦</span>
            <span className="lullaby-star star-b">✧</span>
            <span className="lullaby-star star-c">✦</span>

            <div
              className={`lullaby-record ${
                isPlaying ? "record-playing" : ""
              }`}
            >
              <div className="record-center">
                <span>☾</span>
                <small>G</small>
              </div>
            </div>

            <div className="lullaby-art-caption">
              <span>FIG. 001</span>
              <span>A SOFTER KIND OF SOUND</span>
            </div>
          </div>

          <div className="lullaby-player">
            <div className="lullaby-track-heading">
              <div>
                <span className="lullaby-eyebrow">
                  NOW {isPlaying ? "PLAYING" : "LISTENING"}
                </span>
                <h2>{track.title}</h2>
                <p>{track.mood}</p>
              </div>

              <span className="lullaby-track-category">
                {track.category}
              </span>
            </div>

            <div className="lullaby-progress">
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={Math.min(currentTime, duration || 0)}
                onChange={seek}
                disabled={!duration}
                aria-label="Track progress"
                style={{
                  "--progress": `${
                    duration ? (currentTime / duration) * 100 : 0
                  }%`,
                }}
              />

              <div className="lullaby-time">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="lullaby-controls">
              <button
                className="lullaby-icon-button"
                onClick={previousTrack}
                aria-label="Previous track"
                title="Previous track"
              >
                <SkipBack size={19} />
              </button>

              <button
                className="lullaby-play-button"
                onClick={togglePlayback}
                aria-label={isPlaying ? "Pause music" : "Play music"}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause size={22} fill="currentColor" />
                ) : (
                  <Play size={22} fill="currentColor" />
                )}
              </button>

              <button
                className="lullaby-icon-button"
                onClick={nextTrack}
                aria-label="Next track"
                title="Next track"
              >
                <SkipForward size={19} />
              </button>

              <div className="lullaby-volume">
                <button
                  className="lullaby-icon-button"
                  onClick={() => setIsMuted((value) => !value)}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={18} />
                  ) : (
                    <Volume2 size={18} />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(event) =>
                    setVolume(Number(event.target.value))
                  }
                  aria-label="Volume"
                />
              </div>
            </div>

            {audioError && (
              <p className="lullaby-error" role="status">
                {audioError}
              </p>
            )}

            <div className="lullaby-note">
              <Heart size={14} />
              <span>Made for your slower moments.</span>
            </div>
          </div>
        </section>

        <section className="lullaby-playlist">
          <div className="lullaby-playlist-heading">
            <div>
              <span className="lullaby-eyebrow">THE LITTLE COLLECTION</span>
              <h2>Your bedtime playlist</h2>
            </div>
            <span className="lullaby-track-count">
              {tracks.length} TRACKS
            </span>
          </div>

          <div className="lullaby-track-list">
            {tracks.map((item, index) => (
              <button
                key={item.src}
                className={`lullaby-track-row ${
                  index === trackIndex ? "active" : ""
                }`}
                onClick={() => selectTrack(index)}
                aria-current={index === trackIndex ? "true" : undefined}
              >
                <span className="lullaby-row-icon">
                  {index === trackIndex && isPlaying ? (
                    <span className="lullaby-equalizer">♫</span>
                  ) : index === trackIndex ? (
                    <Play size={15} />
                  ) : (
                    <ListMusic size={17} />
                  )}
                </span>

                <span className="lullaby-row-title">
                  <strong>{item.title}</strong>
                  <small>{item.mood}</small>
                </span>

                <span className="lullaby-row-category">
                  {item.category}
                </span>

                <span className="lullaby-row-action">
                  {index === trackIndex && isPlaying ? (
                    <Pause size={16} />
                  ) : (
                    <Play size={16} />
                  )}
                </span>
              </button>
            ))}
          </div>
        </section>

        <footer className="lullaby-footer">
          <Disc3 size={16} />
          <span>A SMALL MUSIC BOX FOR A VERY LARGE NIGHT.</span>
          <span>☾ ✦</span>
        </footer>
      </main>
    </div>
  );
}
