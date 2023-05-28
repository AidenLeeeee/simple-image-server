import React from "react";
import UploadForm from "../component/UploadForm";
import ImageList from "../component/ImageList";

const MainPage = () => {
    return (
        <div>
            <h2>Photo Book</h2>
            <UploadForm />
            <ImageList />
        </div>
    );
};

export default MainPage;
