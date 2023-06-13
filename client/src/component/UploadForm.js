import React, { useState, useContext, useRef } from "react";
import axios from "axios";
import "./UploadForm.css";
import { toast } from "react-toastify";
import ProgressBar from "./ProgressBar";
import { ImageContext } from "../context/ImageContext";

const UploadForm = () => {
    const { setImages, setMyImages } = useContext(ImageContext);
    const [files, setFiles] = useState(null);
    const [previews, setPreviews] = useState([]);
    const [percent, setPercent] = useState([]);
    const [isPublic, setIsPublic] = useState(true);
    const inputRef = useRef();

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
        try {
            const presignedData = await axios.post("/images/presigned", {
                contentTypes: [...files].map((file) => file.type),
            });

            await Promise.all(
                [...files].map((file, index) => {
                    const { presigned } = presignedData.data[index];
                    const formData = new FormData();
                    for (const key in presigned.fields) {
                        formData.append(key, presigned.fields[key]);
                    }
                    formData.append("Content-Type", file.type);
                    formData.append("file", file);
                    return axios.post(presigned.url, formData, {
                        onUploadProgress: (event) => {
                            setPercent((prevData) => {
                                const newData = [...prevData];
                                newData[index] = Math.round(
                                    (100 * event.loaded) / event.total
                                );
                                return newData;
                            });
                        },
                    });
                })
            );

            const res = await axios.post("/images", {
                images: [...files].map((file, index) => ({
                    imageKey: presignedData.data[index].imageKey,
                    originalname: file.name,
                })),
                isPublic,
            });

            if (isPublic) setImages((prevData) => [...res.data, ...prevData]);
            setMyImages((prevData) => [...res.data, ...prevData]);

            toast.success("Uploaded!");
            setTimeout(() => {
                setPercent([]);
                setPreviews([]);
                inputRef.current.value = null;
            }, 3000);
        } catch (err) {
            console.error(err);
            toast.error(err.response.data.message);
            setPercent([]);
            setPreviews([]);
        }
    };

    const previewImages = previews.map((preview, index) => (
        <div key={index}>
            <img
                style={{ width: 200, height: 200, objectFit: "cover" }}
                src={preview.imgSrc}
                alt=""
                className={`image-preview ${preview.imgSrc &&
                    "image-preview-show"}`}
            />
            <ProgressBar percent={percent[index]} />
        </div>
    ));

    const fileName =
        previews.length === 0
            ? "Please upload your photos."
            : previews.reduce((prev, curr) => prev + `${curr.fileName},`, "");

    return (
        <form onSubmit={onSubmitHandler}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-around",
                    flexWrap: "wrap",
                }}
            >
                {previewImages}
            </div>
            <div className="file-dropper">
                {fileName}
                <input
                    ref={(ref) => (inputRef.current = ref)}
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
