import React from "react";
import UploadForm from "./component/UploadForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
    return (
        <div>
            <ToastContainer />
            <h2>Photos</h2>
            <UploadForm />
        </div>
    );
};

export default App;
