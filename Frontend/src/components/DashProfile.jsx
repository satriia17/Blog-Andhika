import { Alert, Button, Modal, TextInput } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { updateStart, updateSuccess, updateFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure, signOutSuccess } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { HiOutlineExclamationCircle } from "react-icons/hi";


export default function DashProfile() {
  const { currentUser, error } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageProgress, setImageProgress] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const filePicker = useRef();
  const dispatch = useDispatch();
  const handleImageChange = (e) => {
    const file = e.target.files[0]; //membuat objek file untuk mengambil data dengan nilai awal 0 apabila nilai terisi maka akan mengambil data
    if (file) {
      setImageFile(file); //menyimpan data/gambar yang di upload
      setImageUrl(URL.createObjectURL(file)); //membuat url sementara untuk gambar
    }
  };
  useEffect(() => {
    if (imageFile) {
      uploadImage(); //apabila ada file image yang di upload maka akan menjalankan fungsi uploadImage
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageUploaded(true); //untuk mencegah user submit sebelum upload selesai
    setImageError(null);
    const storage = getStorage(app); //mengambil storage dari firebase
    const fileName = new Date().getTime() + imageFile.name; //menyimpan nama file dengan waktu supaya tidak error
    const storageRef = ref(storage, fileName); //menyimpan file dalam storage(firebase) dengan fungsi ref() dan menyimpan nama file
    const uploadTask = uploadBytesResumable(storageRef, imageFile); //menyimpan hasil dari image yang di upload oleh user
    uploadTask.on( //menjalankan fungsi uploadTask
      "state_changed", //membuat event listener
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100; //menghitung progress yang dijalankan
        setImageProgress(progress.toFixed(0)); //menyimpan progress yang dijalankan
      }, 
      (error) => {
        setImageError("Image must be less than 2MB"); //error disebabkan gambar yang di upload lebih dari 2MB yang di setting dalam firebase
        setImageProgress(null);
        setImageUrl(null);
        setImageFile(null);
        setImageUploaded(false);
      },
      () => { //arrow function untuk menjalankan fungsi ketika upload selesai
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => { //mengambil url dari image yang di upload
          setImageUrl(downloadURL); //menyimpan url dari image
          setFormData({
            ...formData,
            profilePic: downloadURL, 
          }); //menyimpan url image yang di upload dalam firebase
          setImageUploaded(false);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value,})
  }; //fungsi untuk memecah setiap data yang ada dan track data apa saja yang di input oleh user

  const handleSubmit = async (e) => { //fungsi untuk menyimpan hasil yang di input oleh user
    e.preventDefault();
    setUpdateUserSuccess(null);
    setUpdateUserError(null);
    if(Object.keys(formData).length === 0){ //validasi user supaya tidak submit data yang tidak berubah
      setUpdateUserError("No changes made")
      return;
    }
    if(imageUploaded){ //validasi gambar yang di upload user sudah selesai
      setUpdateUserError("Please wait while image is being uploaded");
      return;
    }
    try{
      dispatch(updateStart()); //memulai fungsi update
      const res = await fetch(`/api/user/update/${currentUser._id}`, { //mengambil data dari backend
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json(); //menunggu data yang di upload oleh user dan memberikan hasil
      if(!res.ok){ //apabila data tidak sesuai akan menghasilkan error
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      }else{ //apabila data sudah tervalidasi maka data user akan ter-update
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("Profile has been updated");
      }
    }catch(error){ //error lain seperti jaringan atau file yang di upload tidak sesuai
      dispatch(updateFailure(error.message));
      setUpdateUserError(data.message);
    }
  }

  const handleDelete = async () => {
    setShowModal(false);
    try{
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if(!res.ok){
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data));
      }
    }catch(error){
      dispatch(deleteUserFailure(error.message));
    }
  }

  const handleSignOut = async () => {
    try{
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if(!res.ok){
        console.log(data.message)
      }else{
        dispatch(signOutSuccess());
      }
    }catch(error){
      console.log(error)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePicker}
          hidden
        />
        <div
          className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
          onClick={() => filePicker.current.click()}
        >
          {imageProgress && (
            <CircularProgressbar
              value={imageProgress || 0}
              text={`${imageProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                },
                path: { stroke: `rgba(62, 152, 199, ${imageProgress / 100})` },
              }}
            />
          )}
          <img
            src={imageUrl || currentUser.profilePic}
            alt="user"
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${
              imageProgress && imageProgress < 100 && "opacity-60"
            }`}
          />
        </div>
        {imageError && <Alert color="failure">{imageError}</Alert>}
        <TextInput
          type="text"
          id="username"
          placeholder="Username"
          defaultValue={currentUser.username} onChange={handleChange}
        />
        <TextInput
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email} onChange={handleChange}
        />
        <TextInput type="password" id="password" placeholder="Password" onChange={handleChange} />
        <Button type="submit" gradientDuoTone={"purpleToBlue"} outline>
          Update
        </Button>
      </form>
      <div className="text-red-500 flex justify-between mt-5">
        <span onClick={()=> setShowModal(true)} className="cursor-pointer">Delete Account</span>
        <span onClick={handleSignOut} className="cursor-pointer">Sign Out</span>
      </div>
      {updateUserSuccess && <Alert color="success" className="mt-5">{updateUserSuccess}</Alert>}
      {updateUserError && <Alert color="failure" className="mt-5">{updateUserError}</Alert>}
      {error && <Alert color="failure" className="mt-5">{error}</Alert>}
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size={'md'} >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400" >Are you sure you want to delete your account?</h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDelete}>Yes I'm sure</Button>
              <Button color="gray" onClick={() => setShowModal(false)}>No, Cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
