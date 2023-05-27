import React, { useState, useContext } from "react";
import axios from "axios";
import "./UploadForm.css";
import { toast } from "react-toastify";
import ProgressBar from "./ProgressBar";
import { ImageContext } from "../context/ImageContext";

const UploadForm = () => {
    const [images, setImages] = useContext(ImageContext);
    const defaultFileName = "Please upload your photo.";
    const [file, setFile] = useState(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [fileName, setFileName] = useState(defaultFileName);
    const [percent, setPercent] = useState(0);

    const imageSelectHandler = (event) => {
        const imageFile = event.target.files[0];
        setFile(imageFile);
        setFileName(imageFile.name);
        const fileReader = new FileReader();
        fileReader.readAsDataURL(imageFile);
        fileReader.onload = (event) => setImgSrc(event.target.result);
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("image", file);
        try {
            const res = await axios.post("/images", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (event) => {
                    setPercent(Math.round((100 * event.loaded) / event.total));
                },
            });
            setImages([...images, res.data]);
            toast.success("Uploaded!");
            setTimeout(() => {
                setPercent(0);
                setFileName(defaultFileName);
                setImgSrc(null);
            }, 3000);
        } catch (err) {
            toast.error("Failed");
            setPercent(0);
            setFileName(defaultFileName);
            setImgSrc(null);
            console.error(err);
        }
    };

    return (
        <form onSubmit={onSubmitHandler}>
            <img
                src={imgSrc}
                className={`image-preview ${imgSrc && "image-preview-show"}`}
            ></img>
            <ProgressBar percent={percent} />
            <div className="file-dropper">
                {fileName}
                <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={imageSelectHandler}
                />
            </div>
            <button
                type="submit"
                style={{
                    width: "100%",
                    height: 40,
                    borderRadius: 5,
                    cursor: "pointer",
                }}
            >
                Upload
            </button>
        </form>
    );
};

export default UploadForm;
