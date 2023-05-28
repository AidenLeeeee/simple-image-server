import React, { useState, useContext } from "react";
import CustomInput from "../component/CustomInput";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [, setMe] = useContext(AuthContext);
    const navigate = useNavigate();

    const loginHandler = async (event) => {
        try {
            event.preventDefault();
            const result = await axios.patch("/users/login", {
                username,
                password,
            });
            setMe({
                name: result.data.name,
                sessionId: result.data.sessionId,
                userId: result.data.userId,
            });
            navigate("/");
            toast.success("Hello 👋🏼");
        } catch (err) {
            console.error(err.response);
            toast.error(err.response.data.message);
        }
    };

    return (
        <div
            style={{
                marginTop: 100,
                maxWidth: 350,
                marginLeft: "auto",
                marginRight: "auto",
            }}
        >
            <h3>Login</h3>
            <form onSubmit={loginHandler}>
                <CustomInput
                    label="User Name"
                    value={username}
                    setValue={setUsername}
                />
                <CustomInput
                    label="Password"
                    value={password}
                    setValue={setPassword}
                    type="password"
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;
