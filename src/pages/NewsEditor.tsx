import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { db } from "../firebase";
import { News } from "../types";

/* ================= QUILL CONFIG ================= */
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "align",
  "list",
  "bullet",
  "link",
  "image",
];

/* ================= COMPONENT ================= */
export function NewsEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = getAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<Omit<News, "id">>({
    title: "",
    description: "",
    coverImage: "",
    content: "",
    status: "draft",
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/");
    });
    return unsub;
  }, [auth, navigate]);

  /* ================= FETCH (EDIT MODE) ================= */
  useEffect(() => {
    if (!isEdit || !id) {
      setInitialLoading(false);
      return;
    }

    const fetchNews = async () => {
      const snap = await getDoc(doc(db, "news", id));
      if (!snap.exists()) {
        alert("News not found");
        navigate("/News");
        return;
      }
      setForm(snap.data() as Omit<News, "id">);
      setInitialLoading(false);
    };

    fetchNews();
  }, [id, isEdit, navigate]);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!form.title || !form.description) {
      alert("Title & Description are required");
      return;
    }

    setLoading(true);

    const ref = doc(db, "news", id ?? crypto.randomUUID());

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
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 p-6 md:ml-64">
        Loading...
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-white pt-24 p-6 md:ml-64 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? "Edit News" : "Create News"}
      </h1>

      {/* TITLE */}
      <input
        className="border p-3 w-full mb-4"
        placeholder="Title"
        value={form.title}
        onChange={(e) =>
          setForm((p) => ({ ...p, title: e.target.value }))
        }
      />

      {/* DESCRIPTION */}
      <textarea
        className="border p-3 w-full mb-6"
        placeholder="Short description (for card)"
        value={form.description}
        onChange={(e) =>
          setForm((p) => ({ ...p, description: e.target.value }))
        }
      />

      {/* COVER IMAGE */}
      <h2 className="font-semibold mb-2">Cover image (News card)</h2>
      <input
        className="border p-3 w-full mb-2"
        placeholder="Cover image URL"
        value={form.coverImage}
        onChange={(e) =>
          setForm((p) => ({ ...p, coverImage: e.target.value }))
        }
      />

      {form.coverImage && (
        <img
          src={form.coverImage}
          className="h-48 w-full object-cover rounded mb-8 border"
          alt="cover"
        />
      )}

      {/* CONTENT EDITOR */}
      <h2 className="font-semibold mb-2">Content</h2>
      <div className="bg-white mb-8">
        <ReactQuill
          theme="snow"
          value={form.content}
          onChange={(value) =>
            setForm((p) => ({ ...p, content: value }))
          }
          modules={quillModules}
          formats={quillFormats}
          placeholder="Write something amazing..."
        />
      </div>

      {/* STATUS */}
      <select
        className="border p-3 mb-8"
        value={form.status}
        onChange={(e) =>
          setForm((p) => ({
            ...p,
            status: e.target.value as "draft" | "published",
          }))
        }
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>

      {/* ACTIONS */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded"
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
