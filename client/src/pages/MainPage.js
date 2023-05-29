import React, { useContext } from "react";
import UploadForm from "../component/UploadForm";
import ImageList from "../component/ImageList";
import { AuthContext } from "../context/AuthContext";

const MainPage = () => {
    const [me] = useContext(AuthContext);

    return (
        <div>
            <h2>Photo Book</h2>
            {me && <UploadForm />}
            <ImageList />
        </div>
    );
};

export default MainPage;
