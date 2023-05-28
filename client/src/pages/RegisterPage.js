import React, { useState, useContext } from "react";
import CustomInput from "../component/CustomInput";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [, setMe] = useContext(AuthContext);
    const navigate = useNavigate();

    const registerHandler = async (event) => {
        try {
            event.preventDefault();
            if (username.length < 3) throw new Error("Username too short");
            if (password.length < 6) throw new Error("Password too short");
            if (password !== passwordCheck)
                throw new Error("Password not match");
            const result = await axios.post("/users/register", {
                name,
                username,
                password,
            });
            setMe({
                userId: result.data.userId,
                sessionId: result.data.sessionId,
                name: result.data.name,
            });
            navigate("/");
            toast.success("Congraturation! 🎉");
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
            <h3>Register</h3>
            <form onSubmit={registerHandler}>
                <CustomInput label="Name" value={name} setValue={setName} />
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
                <CustomInput
                    label="Confirm Password"
                    value={passwordCheck}
                    setValue={setPasswordCheck}
                    type="password"
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegisterPage;
