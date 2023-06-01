import React, { useState, useContext } from "react";
import axios from "axios";
import "./UploadForm.css";
import { toast } from "react-toastify";
import ProgressBar from "./ProgressBar";
import { ImageContext } from "../context/ImageContext";

const UploadForm = () => {
    const { images, setImages, myImages, setMyImages } = useContext(
        ImageContext
    );
    const [files, setFiles] = useState(null);
    const [previews, setPreviews] = useState([]);
    const [percent, setPercent] = useState(0);
    const [isPublic, setIsPublic] = useState(true);

    const imageSelectHandler = async (event) => {
        const imageFiles = event.target.files;
        setFiles(imageFiles);

        const imagePreviews = await Promise.all(
            [...imageFiles].map(async (imageFile) => {
                return new Promise((resolve, reject) => {
                    try {
                        const fileReader = new FileReader();
                        fileReader.readAsDataURL(imageFile);
                        fileReader.onload = (event) =>
                            resolve({
                                imgSrc: event.target.result,
                                fileName: imageFile.name,
                            });
                    } catch (err) {
                        reject(err);
                    }
                });
            })
        );

        setPreviews(imagePreviews);
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        const formData = new FormData();

        for (let file of files) formData.append("image", file);

        formData.append("public", isPublic);
        try {
            const res = await axios.post("/images", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (event) => {
                    setPercent(Math.round((100 * event.loaded) / event.total));
                },
            });
            if (isPublic) {
                setImages([...images, ...res.data]);
                setMyImages([...myImages, ...res.data]);
            } else setMyImages([...myImages, ...res.data]);
            toast.success("Uploaded!");
            setTimeout(() => {
                setPercent(0);
                setPreviews([]);
            }, 3000);
        } catch (err) {
            toast.error(err.response.data.message);
            setPercent(0);
            setPreviews([]);
            console.error(err);
        }
    };

    const previewImages = previews.map((preview, index) => (
        <img
            key={index}
            style={{ width: 200, height: 200, objectFit: "cover" }}
            src={preview.imgSrc}
            alt=""
            className={`image-preview ${preview.imgSrc &&
                "image-preview-show"}`}
        />
    ));

    const fileName =
        previews.length === 0
            ? "Please upload your photos."
            : previews.reduce((prev, curr) => prev + `${curr.fileName},`, "");

    return (
        <form onSubmit={onSubmitHandler}>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {previewImages}
            </div>
            <ProgressBar percent={percent} />
            <div className="file-dropper">
                {fileName}
                <input
                    id="image"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={imageSelectHandler}
                />
            </div>
            <input
                type="checkbox"
                id="public-check"
                value={!isPublic}
                onChange={() => setIsPublic(!isPublic)}
            />
            <label htmlFor="public-check">Private</label>
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
