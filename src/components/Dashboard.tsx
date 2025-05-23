import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Game } from '../types';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

export function Dashboard() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [games, setGames] = useState<Game[]>([]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate('/');
      }
    });
    return unsubscribe;
  }, [auth]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'featuredGames'));
        const gamesData = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Game, 'id'>)
        }));
        setGames(gamesData);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };
    fetchGames();
  }, []);

  const totalGames = games.length;
  const sortedByReleaseDate = [...games].sort(
    (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );
  const latestGames = sortedByReleaseDate.slice(0, 3);
  const sortedByRating = [...games].sort((a, b) => b.rating - a.rating);
  const topRatedGames = sortedByRating.slice(0, 3);

  const categoryCounts: { [key: string]: number } = {};
  games.forEach(game => {
    categoryCounts[game.category] = (categoryCounts[game.category] || 0) + 1;
  });

  const categoryData = Object.keys(categoryCounts).map(category => ({
    name: category,
    value: categoryCounts[category]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-white text-black pt-24 p-4 md:ml-64 md:p-8">
      <motion.h1
        className="text-4xl font-bold mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Dashboard
      </motion.h1>

      {/* Summary Cards */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <motion.div className="p-6 bg-gray-100 rounded-lg shadow" whileHover={{ scale: 1.02 }}>
          <h2 className="text-2xl font-semibold mb-4">Total Games</h2>
          <p className="text-4xl font-bold">{totalGames}</p>
        </motion.div>

        <motion.div className="p-6 bg-gray-100 rounded-lg shadow" whileHover={{ scale: 1.02 }}>
          <h2 className="text-2xl font-semibold mb-4">Category Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* Latest Releases & Top Rated */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <motion.div className="p-6 bg-gray-100 rounded-lg shadow" whileHover={{ scale: 1.02 }}>
          <h2 className="text-2xl font-semibold mb-4">Latest Releases</h2>
          {latestGames.length > 0 ? (
            <ul>
              {latestGames.map(game => (
                <li key={game.id} className="flex items-center space-x-4 mb-4">
                  <img src={game.imageUrl} alt={game.title} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <h3 className="text-xl font-bold">{game.title}</h3>
                    <p className="text-gray-600">Released on: {game.releaseDate}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No latest games found.</p>
          )}
        </motion.div>

        <motion.div className="p-6 bg-gray-100 rounded-lg shadow" whileHover={{ scale: 1.02 }}>
          <h2 className="text-2xl font-semibold mb-4">Top Rated Games</h2>
          {topRatedGames.length > 0 ? (
            <ul>
              {topRatedGames.map((game, index) => (
                <li key={game.id} className="flex items-center space-x-4 mb-4">
                  <div className="text-3xl font-bold text-gray-700 mr-4">{index + 1}</div>
                  <img src={game.imageUrl} alt={game.title} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <h3 className="text-xl font-bold">{game.title}</h3>
                    <p className="text-gray-600">Rating: {game.rating}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No top rated games found.</p>
          )}
        </motion.div>
      </motion.div>

      {/* Bar Chart */}
      <motion.div className="p-6 bg-gray-100 rounded-lg shadow" whileHover={{ scale: 1.02 }}>
        <h2 className="text-2xl font-semibold mb-4">Games by Rating</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedByRating}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="title" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="rating" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
