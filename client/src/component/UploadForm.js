import React, { useState } from 'react';
import axios from 'axios'

const UploadForm = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("Please upload your photo.");

    const imageSelectHandler = (event) => {
        const imageFile = event.target.files[0];
        setFile(imageFile);
        setFileName(imageFile.name)
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("image", file)
        try {
            const res = await axios.post("/upload", formData, {
                headers: {"Content-Type":"multipart/form-data"}
            });
            console.log({ res })
            alert("Success!");
        } catch (err) {
            alert("Fail!");
            console.error(err);
        }
    }

    return (
        <form onSubmit={onSubmitHandler}>
            <label htmlFor='image'>{fileName}</label>
            <input
                id='image'
                type='file'
                onChange={imageSelectHandler} />
            <button type='submit'>Submit</button>
        </form>
    );
};

export default UploadForm;