import React, { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';

export function Login() {
  const auth = getAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Lắng nghe trạng thái đăng nhập của Firebase và chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        navigate('/dashboard');
      }
    });
    return unsubscribe;
  }, [auth, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError(null);
      // Chuyển hướng sẽ được xử lý trong onAuthStateChanged
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleLogin} className="space-y-8">
            <h2 className="text-5xl font-bold mb-12 text-center">Admin Login</h2>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-4 px-6 rounded-lg text-lg font-medium bg-black text-white hover:bg-gray-800 transition-colors duration-300"
              >
                Login
                <Send className="ml-2 h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
