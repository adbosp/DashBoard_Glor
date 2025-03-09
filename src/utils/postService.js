import { db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const createPost = async (title, content, file) => {
  try {
    let fileURL = "";

    if (file) {
      const fileRef = ref(storage, `uploads/${file.name}`);
      await uploadBytes(fileRef, file);
      fileURL = await getDownloadURL(fileRef);
    }

    const postRef = collection(db, "posts");
    await addDoc(postRef, {
      title,
      content,
      fileURL,
      createdAt: serverTimestamp()
    });

    console.log("Post added successfully!");
  } catch (error) {
    console.error("Error adding post:", error);
  }
};
