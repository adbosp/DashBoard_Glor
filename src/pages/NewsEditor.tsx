import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { News } from "../types";

export function NewsEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<Omit<News, "id">>({
    title: "",
    description: "",
    content: "",
    image: "",
    status: "draft",
  });

  const [loading, setLoading] = useState(false);

  /* ================= AUTH CHECK (GIỐNG ABOUT) ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/"); // chưa login → về trang login
      }
    });
    return unsub;
  }, [auth, navigate]);

  /* ================= FETCH NEWS (EDIT) ================= */
  useEffect(() => {
    if (!isEdit) return;

    const fetchNews = async () => {
      try {
        const snap = await getDoc(doc(db, "news", id!));
        if (snap.exists()) {
          setForm(snap.data() as Omit<News, "id">);
        }
      } catch (err) {
        console.error("Error fetching news:", err);
      }
    };

    fetchNews();
  }, [id, isEdit]);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!form.title || !form.description) {
      alert("Title & Description are required");
      return;
    }

    try {
      setLoading(true);

      const ref = doc(db, "news", id || crypto.randomUUID());

      await setDoc(
        ref,
        {
          ...form,
          updatedAt: serverTimestamp(),
          ...(isEdit ? {} : { createdAt: serverTimestamp() }),
        },
        { merge: true }
      );

      navigate("/News");
    } catch (error: any) {
      console.error("Error saving news:", error);

      if (error.code === "permission-denied") {
        alert("You do not have permission to save this content.");
      } else {
        alert("Failed to save news.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-white pt-24 p-6 md:ml-64">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? "Edit News" : "Create News"}
      </h1>

      <input
        className="border p-3 w-full mb-4"
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <textarea
        className="border p-3 w-full mb-4"
        placeholder="Short description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <textarea
        className="border p-3 w-full mb-4 h-40"
        placeholder="Full content"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
      />
      {/* IMAGE URL */}
      <input
        type="text"
        className="border p-3 w-full mb-2"
        placeholder="Image URL (ImageKit, Cloudinary, CDN...)"
        value={form.image}
        onChange={(e) => setForm({ ...form, image: e.target.value })}
      />

      {form.image && (
        <img
          src={form.image}
          alt="Preview"
          className="h-40 rounded mb-4 object-cover border"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/400x200?text=Invalid+Image+URL";
          }}
        />
      )}
      <select
        className="border p-3 mb-6"
        value={form.status}
        onChange={(e) =>
          setForm({ ...form, status: e.target.value as any })
        }
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          {loading ? "Saving..." : "Save"}
        </button>

        <button
          onClick={() => navigate("/News")}
          className="border px-6 py-3 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
