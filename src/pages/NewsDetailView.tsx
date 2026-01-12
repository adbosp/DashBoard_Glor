import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { News } from "../types";

/* ================= UTILS ================= */
function formatDate(ts?: Timestamp) {
  if (!ts) return "-";
  return ts.toDate().toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ================= COMPONENT ================= */
export function NewsDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH NEWS ================= */
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchNews = async () => {
      try {
        const snap = await getDoc(doc(db, "news", id));

        if (!snap.exists()) {
          setNews(null);
          return;
        }

        setNews({
          id: snap.id,
          ...(snap.data() as Omit<News, "id">),
        });
      } catch (err) {
        console.error("Error loading news:", err);
        setNews(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 p-6 md:ml-64 text-gray-500">
        Loading...
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-white pt-24 p-6 md:ml-64">
        <p className="text-gray-500 mb-4">News not found.</p>
        <button
          onClick={() => navigate("/News")}
          className="text-blue-600 hover:underline"
        >
          ← Back to News Manager
        </button>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-white pt-24 p-6 md:ml-64 max-w-4xl">
      {/* BACK */}
      <Link
        to="/News"
        className="text-gray-500 hover:text-gray-800 mb-6 inline-block"
      >
        ← Back to News Manager
      </Link>

      {/* STATUS */}
      <div className="mb-2">
        <span
          className={`inline-block px-3 py-1 text-xs rounded-full ${
            news.status === "published"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {news.status.toUpperCase()}
        </span>
      </div>

      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-2">{news.title}</h1>

      {/* DATE */}
      <div className="text-sm text-gray-500 mb-6">
        {formatDate(news.updatedAt || news.createdAt)}
      </div>

      {/* COVER IMAGE */}
      {news.coverImage && (
        <img
          src={news.coverImage}
          alt={news.title}
          className="w-full max-h-[420px] object-cover rounded-xl mb-8 border"
        />
      )}

      {/* CONTENT */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: news.content }}
      />
    </div>
  );
}
