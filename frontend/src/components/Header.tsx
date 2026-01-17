import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { Button } from './Button';

export function Header() {
  const { isAuthenticated } = useAuthStore();

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Лицей-интернат №64
            </h1>
          </Link>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Профиль
                </Link>
                <Button variant="outline" onClick={handleLogout} className="text-sm">
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Войти
                </Link>
                <Link to="/register">
                  <Button className="text-sm">Регистрация</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
