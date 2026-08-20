import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="error-page">
      <div className="wrap error-page__inner">
        <span className="tag-label">404</span>
        <h2 className="error-page__title">Página no encontrada</h2>
        <p className="lede error-page__lede">
          Esta ruta no existe. El link puede estar roto o la página fue movida.
        </p>
        <Link href="/" className="btn-gradient error-page__btn">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
