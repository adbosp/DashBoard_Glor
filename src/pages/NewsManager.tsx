import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { News } from "../types";

function formatDate(ts?: Timestamp) {
  if (!ts) return "-";
  const d = ts.toDate();
  return d.toLocaleString("vi-VN");
}

export function NewsManager() {
  const [news, setNews] = useState<News[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "news"), orderBy("updatedAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setNews(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<News, "id">),
        }))
      );
    });

    return unsub;
  }, []);

  const draftNews = news.filter((n) => n.status === "draft");
  const publishedNews = news.filter((n) => n.status === "published");

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Delete this news?");
    if (!ok) return;
    await deleteDoc(doc(db, "news", id));
  };

  const renderList = (items: News[]) => (
    <div className="border rounded-lg overflow-hidden">
      {items.length === 0 && (
        <div className="p-4 text-gray-500 text-sm">No items</div>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-gray-50"
        >
          {/* THUMB */}
          {item.image ? (
            <img
              src={item.image}
              className="w-16 h-10 object-cover rounded border"
              alt={item.title}
            />
          ) : (
            <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
              No image
            </div>
          )}

          {/* CONTENT */}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{item.title}</div>
            <div className="text-xs text-gray-500">
              Updated: {formatDate(item.updatedAt || item.createdAt)}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 text-sm">
            <button
              onClick={() => navigate(`/News/edit/${item.id}`)}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-24 p-6 md:ml-64">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">News Manager</h1>
        <button
          onClick={() => navigate("/News/create")}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
        >
          + Create News
        </button>
      </div>

      {/* DRAFT */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Draft ({draftNews.length})
        </h2>
        {renderList(draftNews)}
      </div>

      {/* PUBLISHED */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Published ({publishedNews.length})
        </h2>
        {renderList(publishedNews)}
      </div>
    </div>
  );
}
