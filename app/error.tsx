'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="error-page">
      <div className="wrap error-page__inner">
        <span className="tag-label">Error</span>
        <h2 className="error-page__title">Algo salió mal</h2>
        <p className="lede error-page__lede">
          Ocurrió un error inesperado. Podés intentar recargar la página.
        </p>
        <button onClick={reset} className="btn-gradient error-page__btn">
          Reintentar
        </button>
      </div>
    </main>
  );
}
