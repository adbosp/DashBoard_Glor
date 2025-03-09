import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Game } from '../types';
import { Send } from 'lucide-react';

export function Games() {
  // --- Authentication state ---
  const auth = getAuth();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      setUser(currentUser);
    });
    return unsubscribe;
  }, [auth]);

  // --- CRUD state for Games ---
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<Omit<Game, 'id'>>({
    title: '',
    description: '',
    imageUrl: '',
    category: 'action',
    rating: 0,
    releaseDate: '',
  });

  // Sử dụng tên collection đồng nhất: 'featuredGames'
  const gamesCollectionRef = collection(db, 'featuredGames');

  const fetchGames = async () => {
    try {
      const snapshot = await getDocs(gamesCollectionRef);
      if (snapshot.empty) {
        console.log('No games found in Firestore.');
      } else {
        console.log('Fetched games:', snapshot.docs.map(doc => doc.data()));
      }
      const gamesData = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Game, 'id'>),
      }));
      setGames(gamesData);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  // Tải dữ liệu khi người dùng đã đăng nhập
  useEffect(() => {
    if (user) {
      fetchGames();
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value,
    }));
  };

  // Thêm game mới
  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding game:', formData);
    try {
      await addDoc(gamesCollectionRef, formData);
      await fetchGames();
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        category: 'action',
        rating: 0,
        releaseDate: '',
      });
    } catch (error) {
      console.error('Error adding game:', error);
    }
  };

  // Xoá game
  const handleDeleteGame = async (id: string) => {
    console.log('Deleting game with id:', id);
    try {
      const docRef = doc(db, 'featuredGames', id);
      await deleteDoc(docRef);
      await fetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
    }
  };

  // Chuẩn bị chỉnh sửa game
  const handleEditGame = (game: Game) => {
    console.log('Editing game:', game);
    setSelectedGame(game);
    setFormData({
      title: game.title,
      description: game.description,
      imageUrl: game.imageUrl,
      category: game.category,
      rating: game.rating,
      releaseDate: game.releaseDate,
    });
  };

  // Cập nhật game đã chỉnh sửa
  const handleUpdateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) return;
    console.log('Updating game:', formData);
    try {
      const docRef = doc(db, 'featuredGames', selectedGame.id);
      await updateDoc(docRef, formData);
      setSelectedGame(null);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        category: 'action',
        rating: 0,
        releaseDate: '',
      });
      await fetchGames();
    } catch (error) {
      console.error('Error updating game:', error);
    }
  };

  // Reset form
  const handleClearForm = () => {
    setSelectedGame(null);
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      category: 'action',
      rating: 0,
      releaseDate: '',
    });
  };

  // Nếu chưa đăng nhập, yêu cầu người dùng đăng nhập
  if (!user) {
    return (
      <div className="min-h-screen bg-white text-black pt-24">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Please log in to access the admin dashboard.</h2>
          <p className="text-lg text-gray-600">Go to the login page to sign in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-12 text-center">Games Collection</h1>

        {/* Form thêm/chỉnh sửa game */}
        <div className="max-w-3xl mx-auto mb-12 border p-6 rounded-lg shadow-lg bg-gray-50">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            {selectedGame ? 'Edit Game' : 'Add New Game'}
          </h2>
          <form onSubmit={selectedGame ? handleUpdateGame : handleAddGame} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Title"
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              required
            />
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description"
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              required
            />
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="Image URL"
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              required
            />
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              required
            >
              <option value="action">Action</option>
              <option value="strategy">Strategy</option>
              <option value="puzzle">Puzzle</option>
              <option value="adventure">Adventure</option>
            </select>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              placeholder="Rating"
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              required
            />
            <input
              type="date"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleInputChange}
              placeholder="Release Date"
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              required
            />
            <div className="col-span-2 mt-6">
              {selectedGame ? (
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center py-4 px-6 rounded-lg text-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300"
                  >
                    Update Game
                    <Send className="ml-2 h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="w-full flex justify-center items-center py-4 px-6 rounded-lg text-lg font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-4 px-6 rounded-lg text-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-colors duration-300"
                >
                  Add Game
                  <Send className="ml-2 h-5 w-5" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Danh sách game */}
        <div className="overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">Game List</h2>
          <table className="min-w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Title</th>
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Category</th>
                <th className="border px-4 py-2">Rating</th>
                <th className="border px-4 py-2">Release Date</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{game.title}</td>
                  <td className="border px-4 py-2">{game.description}</td>
                  <td className="border px-4 py-2">{game.category}</td>
                  <td className="border px-4 py-2">{game.rating}</td>
                  <td className="border px-4 py-2">{game.releaseDate}</td>
                  <td className="border px-4 py-2">
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => handleEditGame(game)}
                        className="flex items-center bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="flex items-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {games.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4">
                    No games found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
