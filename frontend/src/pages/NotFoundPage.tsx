import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold mb-4" style={{ color: 'var(--color-border)' }}>404</div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Страница не найдена</h1>
        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Такой страницы не существует. Проверьте правильность адреса.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          На главную
        </Link>
      </div>
    </div>
  );
}
