import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { HeroContent } from '../types';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export function Content() {
  // Danh sách hero content có thêm trường id
  const [heroContents, setHeroContents] = useState<(HeroContent & { id: string })[]>([]);
  // Lưu id của nội dung đang được chỉnh sửa (nếu có)
  const [selectedId, setSelectedId] = useState<string | null>(null);
   const auth = getAuth();
    const navigate = useNavigate(); // Khai báo useNavigate để điều hướng
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log('Auth state changed:', currentUser);
        setUser(currentUser);
        if (!currentUser) {
          navigate('/'); // Chuyển hướng đến trang login nếu chưa đăng nhập
        }
      });
      return unsubscribe;
    }, [auth]);
  // Form dữ liệu cho hero content
  const [formData, setFormData] = useState<HeroContent>({
    title: '',
    description: '',
    videoUrl: '',
  });

  const heroCollectionRef = collection(db, 'heroSection');

  // Hàm lấy dữ liệu từ Firestore
  const fetchHeroContents = async () => {
    try {
      const snapshot = await getDocs(heroCollectionRef);
      const contents = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as HeroContent),
      }));
      setHeroContents(contents);
    } catch (error) {
      console.error('Error fetching hero content:', error);
    }
  };

  useEffect(() => {
    fetchHeroContents();
  }, []);

  // Xử lý thay đổi input
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Thêm nội dung mới
  const handleAddContent = async () => {
    try {
      await addDoc(heroCollectionRef, { ...formData } as any);
      fetchHeroContents();
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
      });
    } catch (error) {
      console.error('Error adding hero content:', error);
    }
  };

  // Xoá nội dung
  const handleDeleteContent = async (id: string) => {
    try {
      const docRef = doc(db, 'heroSection', id);
      await deleteDoc(docRef);
      fetchHeroContents();
    } catch (error) {
      console.error('Error deleting hero content:', error);
    }
  };

  // Chuẩn bị chỉnh sửa nội dung: đưa dữ liệu hiện tại vào form
  const handleEditContent = (id: string, content: HeroContent) => {
    setSelectedId(id);
    setFormData({
      title: content.title,
      description: content.description,
      videoUrl: content.videoUrl,
    });
  };

  // Cập nhật nội dung đã chỉnh sửa
  const handleUpdateContent = async () => {
    if (!selectedId) return;
    try {
      const docRef = doc(db, 'heroContent', selectedId);
      await updateDoc(docRef, { ...formData } as any);
      setSelectedId(null);
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
      });
      fetchHeroContents();
    } catch (error) {
      console.error('Error updating hero content:', error);
    }
  };

  // Xoá form chỉnh sửa
  const handleClearForm = () => {
    setSelectedId(null);
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
    });
  };

  return (
    <div className="min-h-screen bg-white text-black pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-12 text-center">Content Collection</h1>

        {/* Form thêm/chỉnh sửa HeroContent */}
        <div className="max-w-md mx-auto mb-12 border p-6 rounded-lg shadow-lg bg-gray-50">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            {selectedId ? 'Edit Hero Content' : 'Add New Hero Content'}
          </h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter title"
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="text"
                name="videoUrl"
                id="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                placeholder="Enter video URL"
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                required
              />
            </div>
            <div>
              {selectedId ? (
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleUpdateContent}
                    className="w-full flex justify-center items-center py-4 px-6 rounded-lg text-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300"
                  >
                    Update Content
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
                  type="button"
                  onClick={handleAddContent}
                  className="w-full flex justify-center items-center py-4 px-6 rounded-lg text-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-colors duration-300"
                >
                  Add Content
                  <Send className="ml-2 h-5 w-5" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Danh sách HeroContent */}
        <div className="overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">Hero Content List</h2>
          <table className="min-w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Title</th>
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Video URL</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {heroContents.map((content) => (
                <tr key={content.id} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{content.title}</td>
                  <td className="border px-4 py-2">{content.description}</td>
                  <td className="border px-4 py-2">
                    <a
                      href={content.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 underline"
                    >
                      Link
                    </a>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() =>
                          handleEditContent(content.id, {
                            title: content.title,
                            description: content.description,
                            videoUrl: content.videoUrl,
                          })
                        }
                        className="flex items-center bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteContent(content.id)}
                        className="flex items-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {heroContents.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-4">
                    No hero content found.
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
