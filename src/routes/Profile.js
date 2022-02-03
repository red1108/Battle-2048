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
        window.onresize = (e) => update_layout(e);
        getGameRecord();
        updateGA();
        update_layout();
    }, []);

    return (
        <div className="profile">
            <iframe
                id="amazon-left-ads"
                width="120"
                height="240"
                style={{
                    marginWidth: 0 + "px",
                    marginHeight: 0 + "px",
                }}
                scrolling="no"
                frameBorder="0"
                src="//ws-na.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=US&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=2048b02-20&language=en_US&marketplace=amazon&region=US&placement=B07RLRWWPJ&asins=B07RLRWWPJ&linkId=ebcb1be7da04ed627ed8c807078d41b2&show_border=true&link_opens_in_new_window=true"
            ></iframe>
            <iframe
                id="amazon-right-ads"
                width="120"
                height="240"
                style={{
                    marginWidth: 0 + "px",
                    marginHeight: 0 + "px",
                }}
                scrolling="no"
                frameBorder="0"
                src="//ws-na.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=US&source=ac&ref=tf_til&ad_type=product_link&tracking_id=2048b02-20&marketplace=amazon&amp;region=US&placement=B00U26V4VQ&asins=B00U26V4VQ&linkId=0fb00ea090251699f5675fab6a226a0a&show_border=false&link_opens_in_new_window=true&price_color=333333&title_color=0066c0&bg_color=E2D8D0"
            ></iframe>
            <center className="profile-info">
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
        </div>
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

function update_layout() {
    let w = window.innerWidth,
        h = window.innerHeight;

    const leftAds = document.getElementById("amazon-left-ads");
    leftAds.style.marginLeft = "0px";
    leftAds.style.marginTop = Math.round((h - 240) / 2) + "px";

    const rightAds = document.getElementById("amazon-right-ads");
    rightAds.style.marginLeft = Math.round(w - 120) + "px";
    rightAds.style.marginTop = Math.round((h - 240) / 2) + "px";
}

export default Profile;
