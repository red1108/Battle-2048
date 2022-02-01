import React, { useState, useEffect } from "react";
import "./Multi.css";
import { dbService } from "../fbase";
import { useHistory } from "react-router";
import ReactGA from "react-ga";

const Multi = () => {
    const [roomid, setRoomId] = useState("");
    const [password, setPassword] = useState("");
    const [isMakeRoom, setIsMakeRoom] = useState(false);
    const [error, setError] = useState("");
    const [mobile, setMoblie] = useState(window.innerWidth <= window.innerHeight * 0.84 ? "m" : "");
    const history = useHistory();

    window.addEventListener("resize", () => setMoblie(window.innerWidth <= window.innerHeight * 0.84 ? "m" : ""));

    const onChange = (event) => {
        const {
            target: { name, value },
        } = event;
        if (name === "roomid") {
            setRoomId(value);
        } else if (name === "password") {
            setPassword(value);
        }
    };

    const checkId = async () => {
        const idNotExist = (await dbService.collection("room_info").where("roomid", "==", roomid).get()).empty;
        if (!idNotExist) {
            setError("ID exist");
            return false;
        }
        /*
        const idRegExp = /^[a-zA-z0-9_-]{4,12}$/;
        if (!idRegExp.test(id)) {
            setError("ID should be 4-12 english character");
            return false;
        }*/
        return true;
    };

    useEffect(() => {
        updateGA();
    }, []);

    const onSubmit = async (event) => {
        event.preventDefault();
        let first = "0";
        try {
            if (isMakeRoom) {
                if (!(await checkId())) {
                    return;
                }
                await dbService.collection("room_info").doc(roomid).set({
                    roomid: roomid,
                    password: password,
                });
            } else {
                await dbService
                    .collection("room_info")
                    .doc(roomid)
                    .get()
                    .then((doc) => {
                        if (!doc.exists) throw new Error("no room with roomid");
                        if (doc.data().password != password) throw new Error("password wrong");
                    });
                first = "1";
            }
            history.push("/multi/" + String(roomid) + "/" + first + "/" + password);
        } catch (error) {
            setError(error.message);
        }
    };
    const toggleAccount = () => {
        setIsMakeRoom((prev) => !prev);
        setError("");
    };

    if (isMakeRoom) {
        return (
            <>
                <div className={mobile + "maketitle"}>MakeRoom</div>
                <form onSubmit={onSubmit} className="makecontainer">
                    <input
                        type="text"
                        name="roomid"
                        placeholder="ID"
                        required
                        value={roomid}
                        onChange={onChange}
                        className={mobile + "makeid"}
                    />
                    <input
                        type="text"
                        name="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={onChange}
                        className={mobile + "makepw"}
                    />
                    <input type="submit" className={mobile + "makesubmit"} value="Generate" />
                </form>
                <div onClick={toggleAccount} className={mobile + "makeswitch"}>
                    ToRoom
                </div>
                <div className={mobile + "makeerror"}>{error}</div>
            </>
        );
    } else {
        return (
            <>
                <div className={mobile + "totitle"}>ToRoom</div>
                <form onSubmit={onSubmit} className="tocontainer">
                    <input
                        type="text"
                        name="roomid"
                        placeholder="ID"
                        required
                        value={roomid}
                        onChange={onChange}
                        className={mobile + "toid"}
                    />
                    <input
                        type="text"
                        name="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={onChange}
                        className={mobile + "topw"}
                    />
                    <input type="submit" className={mobile + "tosubmit"} value="Get In" />
                </form>
                <div onClick={toggleAccount} className={mobile + "toswitch"}>
                    MakeRoom
                </div>
                <div className={mobile + "toerror"}>{error}</div>
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

export default Multi;
