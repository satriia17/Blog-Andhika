import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import { useState } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [imageUpload, setImageUpload] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const navigate = useNavigate();
  const handleUpload = async () => {
    try {
      if (!file) {
        setImageError("Please select an image file");
        return;
      }
      setImageError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "-" + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUpload(progress.toFixed(0));
        },
        (error) => {
          setImageError("Image upload Failed");
          setImageUpload(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUpload(null);
            setImageError(null);
            setFormData({ ...formData, image: downloadURL });
          });
        }
      );
    } catch (error) {
      setImageError("Something went wrong");
      setImageUpload(null);
      console.log(error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const res = await fetch("api/post/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if(!res.ok){
        setPublishError(data.message)
        return
      }
      if(res.ok){
        setPublishError(null)
        navigate(`/post/${data.slug}`)
      }
    }catch(error){
      setPublishError('Something went wrong')
    }
  }

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text3xl my-7 font-semibold">Create Post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Select
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="uncategorized">Select a Category</option>
            <option value="Javascript">Javascript</option>
            <option value="React">React</option>
            <option value="Node">Node</option>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type="button"
            gradientDuoTone={"purpleToBlue"}
            size="sm"
            outline
            onClick={handleUpload}
            disabled={imageUpload}
          >
            {imageUpload ? (
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={imageUpload}
                  maxValue={100}
                  text={`${imageUpload || 0}%`}
                />
              </div>
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
        {imageError && <Alert color="failure">{imageError}</Alert>}
        {formData.image && (
          <img
            src={formData.image}
            alt="image"
            className="w-full h-72 object-cover"
          />
        )}
        <ReactQuill
          required
          theme="snow"
          placeholder="Write your post here..."
          className="h-72 mb-12"
          onChange={(value) => setFormData({ ...formData, content: value })}
        />
        <Button type="submit" gradientDuoTone={"purpleToBlue"}>
          Publish
        </Button>
        {publishError && <Alert className="mt-5" color="failure">{publishError}</Alert>}
      </form>
    </div>
  );
}
