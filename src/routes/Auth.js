import React, { useState, useEffect } from "react";
import "./Auth.css";
import { authService, firebaseInstance, dbService } from "../fbase";
import { useHistory } from "react-router";
import ReactGA from "react-ga";

const Auth = () => {
    const [id, setId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState("");
    const [mobile, setMoblie] = useState(window.innerWidth <= window.innerHeight * 0.84 ? "m" : "");
    const history = useHistory();

    window.addEventListener("resize", () => setMoblie(window.innerWidth <= window.innerHeight * 0.84 ? "m" : ""));

    const onChange = (event) => {
        const {
            target: { name, value },
        } = event;
        if (name === "email/id" || name === "email") {
            setEmail(value);
        } else if (name === "id") {
            setId(value);
        } else if (name === "password") {
            setPassword(value);
        }
    };

    const checkId = async () => {
        const idNotExist = (await dbService.collection("user_info").where("id", "==", id).get()).empty;
        if (!idNotExist) {
            setError("ID exist");
            return false;
        }
        const idRegExp = /^[a-zA-z0-9_-]{4,12}$/;
        if (!idRegExp.test(id)) {
            setError("ID should be 4-12 english character");
            return false;
        }
        return true;
    };

    useEffect(() => {
        updateGA();
    }, []);

    const onSubmit = async (event) => {
        event.preventDefault();
        try {
            if (isRegister) {
                if (!(await checkId())) {
                    return;
                }
                let user_uid;
                await authService.createUserWithEmailAndPassword(email, password).then((result) => {
                    user_uid = result.user.uid;
                });
                await dbService.collection("user_info").doc(user_uid).set({
                    uid: user_uid,
                    id: id,
                    email: email,
                });
            } else {
                if (!email.includes("@")) {
                    const user_id = email;
                    const dbData = await dbService.collection("user_info").where("id", "==", user_id).get();
                    const user_email = dbData.docs[0].data().email;
                    await authService.signInWithEmailAndPassword(user_email, password);
                } else await authService.signInWithEmailAndPassword(email, password);
            }
            history.push("/");
        } catch (error) {
            setError(error.message);
        }
    };
    const toggleAccount = () => {
        setIsRegister((prev) => !prev);
        setError("");
    };

    const onSocialClick = async (event) => {
        const {
            target: { name },
        } = event;
        let provider;
        if (name === "google") {
            provider = new firebaseInstance.auth.GoogleAuthProvider();
            let user_email, user_uid, is_new;
            await authService
                .signInWithPopup(provider)
                .then((result) => {
                    user_email = result.user.email;
                    user_uid = result.user.uid;
                    is_new = result.additionalUserInfo.isNewUser;
                    if (is_new) {
                        dbService
                            .collection("user_info")
                            .doc(user_uid)
                            .set({
                                uid: user_uid,
                                id: user_email.substring(0, user_email.indexOf("@")),
                                email: user_email,
                                level: 0,
                            });
                    }
                })
                .then(() => {
                    history.push("/");
                });
        } else {
            //error
        }
    };

    if (isRegister) {
        return (
            <>
                <div className={mobile + "regtitle"}>Register</div>
                <form onSubmit={onSubmit} className="regcontainer">
                    <input
                        type="text"
                        name="id"
                        placeholder="ID"
                        required
                        value={id}
                        onChange={onChange}
                        className={mobile + "regid"}
                    />
                    <input
                        type="text"
                        name="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={onChange}
                        className={mobile + "regemail"}
                    />
                    <input
                        type="text"
                        name="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={onChange}
                        className={mobile + "regpw"}
                    />
                    <input type="submit" className={mobile + "regsubmit"} value="Sign Up" />
                </form>
                <div onClick={toggleAccount} className={mobile + "regswitch"}>
                    Login
                </div>
                <div className={mobile + "regforgot"}>Forgot?</div>
                <button onClick={onSocialClick} name="google" className={mobile + "regbtn"}>
                    <span>with&nbsp;</span>
                    <span style={{ color: "#1147a5" }}>G</span>
                    <span style={{ color: "red" }}>o</span>
                    <span style={{ color: "#ebc85b" }}>o</span>
                    <span style={{ color: "#1147a5" }}>g</span>
                    <span style={{ color: "green" }}>l</span>
                    <span style={{ color: "red" }}>e</span>
                </button>
                <div className={mobile + "regerror"}>{error}</div>
            </>
        );
    } else {
        return (
            <>
                <div className={mobile + "authtitle"}>Login</div>
                <form onSubmit={onSubmit} className="container">
                    <input
                        type="text"
                        name="email/id"
                        placeholder="Email/ID"
                        required
                        value={email}
                        onChange={onChange}
                        className={mobile + "authemail"}
                    />
                    <input
                        type="text"
                        name="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={onChange}
                        className={mobile + "authpw"}
                    />
                    <input type="submit" className={mobile + "authsubmit"} value="Sign In" />
                </form>
                <div onClick={toggleAccount} className={mobile + "authswitch"}>
                    Register
                </div>
                <div className={mobile + "authforgot"}>Forgot?</div>
                <button onClick={onSocialClick} name="google" className={mobile + "authbtn"}>
                    <span>with&nbsp;</span>
                    <span style={{ color: "#1147a5" }}>G</span>
                    <span style={{ color: "red" }}>o</span>
                    <span style={{ color: "#ebc85b" }}>o</span>
                    <span style={{ color: "#1147a5" }}>g</span>
                    <span style={{ color: "green" }}>l</span>
                    <span style={{ color: "red" }}>e</span>
                </button>
                <div className={mobile + "autherror"}>{error}</div>
            </>
        );
    }
};

function updateGA() {
    // google analytics - auth
    const pathName = "auth";
    ReactGA.initialize("UA-218917298-1");
    ReactGA.set({ page: pathName });
    ReactGA.pageview(pathName);
}

export default Auth;
