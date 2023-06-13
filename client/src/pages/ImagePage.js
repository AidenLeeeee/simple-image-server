import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ImageContext } from "../context/ImageContext";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ImagePage = () => {
    const navigate = useNavigate();
    const { imageId } = useParams();
    const { images, setImages, setMyImages } = useContext(ImageContext);
    const [me] = useContext(AuthContext);
    const [hasLiked, setHasLiked] = useState(false);
    const [image, setImage] = useState();
    const [error, setError] = useState(false);

    useEffect(() => {
        const img = images.find((image) => image._id === imageId);
        if (img) setImage(img);
    }, [images, imageId]);

    useEffect(() => {
        if (image && image._id === imageId) return;
        axios
            .get(`/images/${imageId}`)
            .then(({ data }) => {
                setError(false);
                setImage(data);
            })
            .catch((err) => {
                setError(true);
                toast.error(err.response.data.message);
            });
    }, [imageId, image]);

    useEffect(() => {
        if (me && image && image.likes.includes(me.userId)) setHasLiked(true);
    }, [me, image]);

    if (error) return <h3>Error...</h3>;
    else if (!image) return <h3>Loading...</h3>;

    const updateImage = (images, image) =>
        [...images.filter((image) => image._id !== imageId), image].sort(
            (a, b) => {
                if (a._id < b._id) return 1;
                else return -1;
            }
        );

    const onSubmitHandler = async () => {
        const result = await axios.patch(
            `/images/${imageId}/${hasLiked ? "unlike" : "like"}`
        );
        if (result.data.public)
            setImages((prevData) => updateImage(prevData, result.data));
        setMyImages((prevData) => updateImage(prevData, result.data));
        setHasLiked(!hasLiked);
    };

    const deleteHandler = async () => {
        try {
            if (!window.confirm("Are you sure?")) return;
            const result = await axios.delete(`/images/${imageId}`);
            toast.success(result.data.message);
            setImages((prevData) =>
                prevData.filter((image) => image._id !== imageId)
            );
            setMyImages((prevData) =>
                prevData.filter((image) => image._id !== imageId)
            );
            navigate("/");
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };

    return (
        <div>
            <h3>Image page - {imageId}</h3>
            <img
                style={{ width: "100%" }}
                alt={imageId}
                src={`https://simple-image-server.s3.ap-northeast-2.amazonaws.com/raw/${image.key}`}
            />
            <span>{`👍🏼 Likes ${image.likes.length}`}</span>
            {me && image.user._id === me.userId && (
                <button
                    style={{ float: "right", marginLeft: 10 }}
                    onClick={deleteHandler}
                >
                    Delete
                </button>
            )}
            <button style={{ float: "right" }} onClick={onSubmitHandler}>
                {hasLiked ? "Unlike" : "Like"}
            </button>
        </div>
    );
};

export default ImagePage;
