import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { authService, dbService } from "../fbase";
import PropTypes from "prop-types";
import ReactGA from "react-ga";
import "./Profile.css";

const Profile = ({ userObj }) => {
    const history = useHistory();
    const [records, setRecord] = useState([]);

    const onLogOutClick = () => {
        authService.signOut();
        history.push("/");
    };

    const getGameRecord = async () => {
        const dbRecord = await dbService.collection("game_record").where("userUid", "==", userObj.uid).get();
        dbRecord.forEach((doc) => {
            const recordObject = {
                ...doc.data(),
                id: doc.id,
            };
            setRecord((prev) => [recordObject, ...prev]);
        });
    };

    useEffect(() => {
        getGameRecord();
        updateGA();
    }, []);

    return (
        <center className="profile">
            <button id="logoutBtn" onClick={onLogOutClick}>
                Log Out
            </button>
            <div>
                {records.map((record) => (
                    <div key={record.id}>
                        <h4 className="profile-history">
                            {record.winner ? "Win" : "Lose"} {record.myScore}:{record.aiScore}
                        </h4>
                        <h4 className="profile-history">When: {record.endedAt}</h4>
                    </div>
                ))}
            </div>
        </center>
    );
};

Profile.propTypes = {
    userObj: PropTypes.object.isRequired,
};

function updateGA() {
    // google analytics - learn
    const pathName = "profile";
    ReactGA.initialize("UA-218917298-1");
    ReactGA.set({ page: pathName });
    ReactGA.pageview(pathName);
}

export default Profile;
