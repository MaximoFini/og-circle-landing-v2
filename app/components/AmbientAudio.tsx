'use client';

import { useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * Los navegadores bloquean el autoplay con sonido, asi que el audio arranca
 * muteado y el usuario decide si lo activa. `loop` + `preload="none"` para
 * no gastar ancho de banda hasta que alguien lo pida.
 */
export default function AmbientAudio({ className = '' }: { className?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    // Force load if not ready
    if (audio.readyState === 0) {
      audio.load();
    }
    audio.muted = false;
    audio.volume = 0.35;
    audio.play()
      .then(() => setPlaying(true))
      .catch((err) => {
        console.error('Audio play failed:', err);
        setPlaying(false);
      });
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/hero-theme.mp3" loop preload="metadata" muted={!playing} />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Silenciar música' : 'Activar música'}
        aria-pressed={playing}
        className={`ambient-audio-toggle ${className}`.trim()}
      >
        {playing ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </>
  );
}
