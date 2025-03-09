import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { aboutCollection } from '../types';
import { Send } from 'lucide-react';

export function About() {
  // Lưu danh sách các record có thêm field id
  const [aboutRecords, setAboutRecords] = useState<(aboutCollection & { id: string })[]>([]);
  // Lưu id của record đang được chỉnh sửa (nếu có)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Form data cho about record
  const [formData, setFormData] = useState<aboutCollection>({
    docs: '',
    description: '',
  });

  const aboutCollectionRef = collection(db, 'about');

  // Lấy danh sách record từ Firestore
  const fetchAboutRecords = async () => {
    try {
      const snapshot = await getDocs(aboutCollectionRef);
      const records = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as aboutCollection),
      }));
      setAboutRecords(records);
    } catch (error) {
      console.error('Error fetching about records:', error);
    }
  };

  useEffect(() => {
    fetchAboutRecords();
  }, []);

  // Xử lý thay đổi input trong form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Thêm mới record
  const handleAddRecord = async () => {
    try {
      await addDoc(aboutCollectionRef, { ...formData } as any);
      fetchAboutRecords();
      setFormData({ docs: '', description: '' });
    } catch (error) {
      console.error('Error adding about record:', error);
    }
  };

  // Xoá record
  const handleDeleteRecord = async (id: string) => {
    try {
      const docRef = doc(db, 'about', id);
      await deleteDoc(docRef);
      fetchAboutRecords();
    } catch (error) {
      console.error('Error deleting about record:', error);
    }
  };

  // Chuẩn bị chỉnh sửa record: đưa dữ liệu hiện tại vào form
  const handleEditRecord = (id: string, record: aboutCollection) => {
    setSelectedId(id);
    setFormData({
      docs: record.docs,
      description: record.description,
    });
  };

  // Cập nhật record đã chỉnh sửa
  const handleUpdateRecord = async () => {
    if (!selectedId) return;
    try {
      const docRef = doc(db, 'about', selectedId);
      await updateDoc(docRef, { ...formData } as any);
      setSelectedId(null);
      setFormData({ docs: '', description: '' });
      fetchAboutRecords();
    } catch (error) {
      console.error('Error updating about record:', error);
    }
  };

  // Xoá form chỉnh sửa
  const handleClearForm = () => {
    setSelectedId(null);
    setFormData({ docs: '', description: '' });
  };

  return (
    <div className="min-h-screen bg-white text-black pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-12 text-center">About Collection</h1>
        
        {/* Form thêm/chỉnh sửa record */}
        <div className="max-w-md mx-auto mb-12 border p-6 rounded-lg shadow-lg bg-gray-50">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            {selectedId ? 'Edit About Record' : 'Add New About Record'}
          </h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="docs" className="block text-sm font-medium text-gray-700 mb-2">
                Docs
              </label>
              <input
                type="text"
                name="docs"
                id="docs"
                value={formData.docs}
                onChange={handleInputChange}
                placeholder="Enter docs"
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
              {selectedId ? (
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleUpdateRecord}
                    className="w-full flex justify-center items-center py-4 px-6 rounded-lg text-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300"
                  >
                    Update Record
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
                  onClick={handleAddRecord}
                  className="w-full flex justify-center items-center py-4 px-6 rounded-lg text-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-colors duration-300"
                >
                  Add Record
                  <Send className="ml-2 h-5 w-5" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Danh sách các record */}
        <div className="overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">About Collection List</h2>
          <table className="min-w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Docs</th>
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {aboutRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{record.docs}</td>
                  <td className="border px-4 py-2">{record.description}</td>
                  <td className="border px-4 py-2">
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => handleEditRecord(record.id, record)}
                        className="flex items-center bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="flex items-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {aboutRecords.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center p-4">
                    No records found.
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
