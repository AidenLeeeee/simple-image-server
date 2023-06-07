import React, { useCallback, useContext, useEffect, useRef } from "react";
import { ImageContext } from "../context/ImageContext";
import { AuthContext } from "../context/AuthContext";
import "./ImageList.css";
import { Link } from "react-router-dom";

const ImageList = () => {
    const {
        images,
        isPublic,
        setIsPublic,
        imageLoading,
        imageError,
        setImageUrl,
    } = useContext(ImageContext);
    const [me] = useContext(AuthContext);
    const elementRef = useRef(null);

    const loadMoreImages = useCallback(() => {
        if (images.length === 0 || imageLoading) return;
        const lastImageId = images[images.length - 1]._id;
        setImageUrl(
            `${isPublic ? "" : "users/me"}/images?lastid=${lastImageId}`
        );
    }, [images, imageLoading, isPublic, setImageUrl]);

    useEffect(() => {
        if (!elementRef.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) loadMoreImages();
        });
        observer.observe(elementRef.current);
        return () => observer.disconnect();
    }, [loadMoreImages]);

    const imgList = images.map((image, index) => (
        <Link
            key={image.key}
            to={`/images/${image._id}`}
            ref={index + 5 === images.length ? elementRef : undefined}
        >
            <img alt="" src={`http://localhost:8799/uploads/${image.key}`} />
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
            {imageLoading && <div>Loading...</div>}
        </div>
    );
};

export default ImageList;
