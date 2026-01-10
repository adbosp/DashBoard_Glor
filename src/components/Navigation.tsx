import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { Menu, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import '../google-fonts.css';


export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Menu user trên mobile
  const auth = getAuth();

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  if (!user) return null;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/Games', label: 'Games' },
    { path: '/News', label: 'News' },
    { path: '/Content', label: 'Content' },
    { path: '/About', label: 'About' },
    
  ];

  return (
    <nav
      className={`fixed bg-white shadow-lg transition-all duration-300 flex z-50 ${
        isMobile
          ? 'bottom-0 w-full h-16 flex-row items-center justify-between px-4' // Mobile Navigation
          : `left-0 top-0 h-full flex-col ${isCollapsed ? 'w-16' : 'w-64'}`
      }`}
    >
      {/* Logo Luôn Hiển Thị */}
      <div className={`flex items-center ${isMobile ? 'h-full' : 'h-20 justify-center border-b border-gray-200'}`}>
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="https://res.cloudinary.com/dk7hsdijn/image/upload/c_thumb,w_200,g_face/v1741444897/Logo_dxl23c.png"
            alt="Logo"
            className="h-10 w-10 object-cover"
          />
          {!isCollapsed && !isMobile && (
            <span className="montserrat-uniquifier text-2xl text-black">GLORGAMES</span>
          )}
        </Link>
      </div>

      {/* Menu Items */}
      <div className={`flex-1 ${isMobile ? 'flex justify-around' : 'p-4'}`}>
        <ul className={`${isMobile ? 'flex space-x-4' : 'space-y-4'}`}>
          {menuItems.map(({ path, label }) => (
            <li key={path}>
              <motion.div
                whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Link
                  to={path}
                  className={`block transition-colors duration-300 text-lg font-medium rounded-md border border-gray-800 p-2 text-center hover:backdrop-blur-sm ${
                    activePath === path
                      ? 'bg-gray-800 text-white'
                      : 'bg-transparent text-gray-600 hover:bg-gray-800 hover:text-white'
                  } ${isMobile ? 'text-sm' : ''}`}
                >
                  {isCollapsed ? label.charAt(0) : label}
                </Link>
              </motion.div>
            </li>
          ))}
        </ul>
      </div>

      {/* User Info + Sign Out */}
      {isMobile ? (
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-300"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>

          {isMenuOpen && (
            <div className="absolute bottom-16 right-0 bg-white shadow-lg p-4 rounded-lg">
              <p className="text-sm text-gray-700">Logged in as:</p>
              <p className="text-base font-medium text-black mb-2">
                {user.email || user.displayName}
              </p>
              <button
                onClick={handleSignOut}
                className="w-full flex justify-center items-center py-2 px-4 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors duration-300"
              >
                <LogOut className="h-5 w-5 mr-2" /> Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="border-t border-gray-200 p-4">
          {!isCollapsed && (
            <>
              <p className="text-sm text-gray-700">Logged in as:</p>
              <p className="text-base font-medium text-black mb-2">
                {user.email || user.displayName}
              </p>
            </>
          )}
      
          <button
            onClick={handleSignOut}
            className="w-full flex justify-center items-center py-2 px-4 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors duration-300"
            >
            Sign Out
          </button>
        </div>
      )}

      {/* Nút toggle (Chỉ hiển thị trên PC) */}
      {!isMobile && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-300"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-700" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            )}
          </button>
        </div>
      )}
    </nav>
  );
}
