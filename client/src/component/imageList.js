import React, { useContext } from "react";
import { ImageContext } from "../context/ImageContext";
import { AuthContext } from "../context/AuthContext";
import "./ImageList.css";
import { Link } from "react-router-dom";

const ImageList = () => {
    const {
        images,
        myImages,
        isPublic,
        setIsPublic,
        loadMoreImages,
        imageLoading,
        imageError,
    } = useContext(ImageContext);
    const [me] = useContext(AuthContext);

    const imgList = (isPublic ? images : myImages).map((image) => (
        <Link key={image.key} to={`/images/${image._id}`}>
            <img
                alt=""
                key={image.key}
                src={`http://localhost:8799/uploads/${image.key}`}
            />
        </Link>
    ));

    return (
        <div>
            <h3 style={{ display: "inline-block", marginRight: 10 }}>
                {isPublic ? "🌍 Public" : "🔐 Private"} Photos
            </h3>
            {me && (
                <button onClick={() => setIsPublic(!isPublic)}>
                    {(isPublic ? "Private" : "Public") + " photos"}
                </button>
            )}
            <div className="image-list-container">{imgList}</div>
            {imageError && <div>Error...</div>}
            {imageLoading ? (
                <div>Loading...</div>
            ) : (
                <button onClick={loadMoreImages}>Load More Images</button>
            )}
        </div>
    );
};

export default ImageList;
