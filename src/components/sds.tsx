import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import '../google-fonts.css';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, [auth]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/Games', label: 'Games' },
    { path: '/Content', label: 'Content' },
    { path: '/About', label: 'About' },
  ];

  return (
    <nav
      className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 flex flex-col relative ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="https://res.cloudinary.com/dk7hsdijn/image/upload/c_thumb,w_200,g_face/v1741444897/Logo_dxl23c.png"
            alt="Logo"
            className="h-14 w-14 object-cover"
          />
          {!isCollapsed && (
            <span className="montserrat-uniquifier text-2xl text-black">
              GLORGAMES
            </span>
          )}
        </Link>
      </div>

      {/* Menu Items (hiển thị khi đã đăng nhập) */}
      {user && (
        <div className="p-4 flex-1">
          <ul className="space-y-4">
            {menuItems.map(({ path, label }) => (
              <li key={path}>
                <motion.div
                  whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    to={path}
                    className={`block transition-colors duration-300 text-lg font-medium rounded-md border border-black p-2 text-center hover:backdrop-blur-sm ${
                      activePath === path
                        ? 'bg-black text-white'
                        : 'bg-transparent text-gray-600 hover:bg-black hover:text-white'
                    }`}
                  >
                    {isCollapsed ? label.charAt(0) : label}
                  </Link>
                </motion.div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom: User info & Sign Out (chỉ hiển thị khi đã đăng nhập) */}
      {user && (
        <div className="border-t border-gray-200 p-4">
          {!isCollapsed && (
            <>
              <p className="text-sm text-gray-700">Logged in as:</p>
              <p className="text-base font-medium text-black mb-2">
                {user.email || user.displayName}
              </p>
              <button
                onClick={handleSignOut}
                className="w-full flex justify-center items-center py-2 px-4 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors duration-300"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}

      {/* Nút toggle luôn hiển thị */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute bottom-4 left-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-300"
      >
        {isCollapsed ? (
          <ChevronRight className="h-5 w-5 text-gray-700" />
        ) : (
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        )}
      </button>
    </nav>
  );
}
