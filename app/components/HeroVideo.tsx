'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * HeroVideo — Video de fondo autoejecutable.
 *
 * En mobile, los navegadores bloquean autoplay o no tienen suficiente datos
 * cargados al momento del montaje. Se reintenta la reproducción:
 *   1. Al montar (intento base)
 *   2. Cuando el video tiene datos suficientes (evento `canplay`)
 *   3. Al primer touchstart/click/scroll del usuario
 *   4. Al volver a la pestaña (Visibility API)
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let resolved = false;

    const markOk = () => {
      resolved = true;
      setAutoplayFailed(false);
    };

    const tryPlay = () => {
      if (!video.paused) return;
      video.play().then(markOk).catch(() => {});
    };

    // 1. Intento inicial
    video.play().then(markOk).catch(() => {
      // 2. Reintentar cuando el video tiene datos suficientes para reproducir
      video.addEventListener('canplay', tryPlay, { once: true });

      // 3. Reintentar en la primera interacción del usuario
      const onGesture = () => {
        tryPlay();
        // Si sigue sin funcionar después de la interacción, marcar como fallido
        setTimeout(() => {
          if (!resolved) setAutoplayFailed(true);
        }, 1500);
      };
      document.addEventListener('touchstart', onGesture, { once: true, passive: true });
      document.addEventListener('click', onGesture, { once: true });
      document.addEventListener('scroll', onGesture, { once: true, passive: true });
    });

    // 4. Visibility API: reanudar si el usuario vuelve a la pestaña/app
    const handleVisibility = () => {
      if (!document.hidden) tryPlay();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <div
      className={`hero-video-wrapper ${autoplayFailed ? 'autoplay-failed' : ''}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: 'var(--bg)',
        backgroundImage: autoplayFailed ? 'url(/images/hero-poster.jpg)' : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/hero-poster.jpg"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: autoplayFailed ? 'none' : 'block',
        }}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
          type="video/mp4"
        />
      </video>
    </div>
  );
}
