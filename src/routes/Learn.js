import React from "react";
import "./Learn.css";
import { Link } from "react-router-dom";
import ReactGA from "react-ga";

/*
var constants = require("../helpers/Constants.js");

const playerColor = constants.player_color;
const aiColor = constants.ai_color;

const map_size = constants.map_size;
*/
class Learn extends React.Component {
    constructor(props) {
        super(props);
        //Mount Canvas

        let color_theme = 0;
        this.state = {
            theme: color_theme,
        };

        window.onresize = (e) => this.handleResize(e);
    }

    handleResize() {
        update_layout();
    }

    componentDidMount() {
        // google analytics - learn
        const pathName = "learn";
        ReactGA.initialize("UA-218917298-1");
        ReactGA.set({ page: pathName });
        ReactGA.pageview(pathName);
        update_layout();
    }

    render() {
        return (
            <div id="learn-main">
                <img
                    id="learn-image-1"
                    src="https://user-images.githubusercontent.com/17401630/151644196-02cb3b6d-2a5f-45c4-beb0-4e1f56bc9dd3.png"
                />
                <div id="learn-text">Then...</div>
                <img
                    id="learn-image-2"
                    src="https://user-images.githubusercontent.com/17401630/151649954-a1e45997-b2e0-43ee-92e3-ceed8d067a41.png"
                />
                <Link to="/game">
                    <div id="learn-playbutton">Play</div>
                </Link>
            </div>
        );
    }
}

function update_layout() {
    let w = window.innerWidth,
        h = window.innerHeight;
    const isPc = h * 1.21 <= w;
    if (isPc) {
        const image1_w = h * 0.55;
        const image2_w = h * 0.65;
        const image1_h = (image1_w * 645) / 700;
        const image2_h = (image2_w * 732) / 700;
        const image1_ml = Math.round(w * 0.25 - image1_w / 2);
        const image2_ml = Math.round(w * 0.75 - image2_w / 2);
        const image1_bottom = Math.round(h * 0.1) + image1_h;

        const image1 = document.getElementById("learn-image-1");
        image1.style.marginLeft = image1_ml + "px";
        image1.style.marginTop = Math.round(h * 0.13) + "px";
        image1.style.width = image1_w + "px";
        image1.style.height = image1_h + "px";

        const image2 = document.getElementById("learn-image-2");
        image2.style.marginLeft = image2_ml + "px";
        image2.style.marginTop = Math.round(h * 0.13) + "px";
        image2.style.width = image2_w + "px";
        image2.style.height = image2_h + "px";

        const text = document.getElementById("learn-text");
        text.style.fontSize = Math.round(h * 0.04) + "px";
        text.style.marginLeft = Math.round(w * 0.25 - h * 0.16) + "px";
        text.style.marginTop = Math.round(image1_bottom + h * 0.15) + "px";

        const btn = document.getElementById("learn-playbutton");
        btn.style.width = Math.round(h * 0.12) + "px";
        btn.style.height = Math.round(h * 0.12 * 0.4) + "px";
        btn.style.marginLeft = Math.round(w * 0.25) + "px";
        btn.style.fontSize = Math.round(h * 0.03) + "px";
        btn.style.marginTop = Math.round(image1_bottom + h * 0.15) + "px";

        const learnPage = document.getElementById("learn-main");
        learnPage.style.height = h + "px";
    } else {
        const image1_w = w * 0.6;
        const image2_w = w * 0.7;
        const image1_h = (image1_w * 645) / 600;
        const image2_h = (image2_w * 732) / 700;
        const image1_ml = Math.round(w * 0.5 - image1_w / 2);
        const image2_ml = Math.round(w * 0.53 - image2_w / 2);

        const image1 = document.getElementById("learn-image-1");
        image1.style.marginLeft = image1_ml + "px";
        image1.style.marginTop = Math.round(h * 0.13) + "px";
        image1.style.width = image1_w + "px";
        image1.style.height = image1_h + "px";

        const image2 = document.getElementById("learn-image-2");
        image2.style.marginLeft = image2_ml + "px";
        image2.style.marginTop = Math.round(h * 0.23 + image1_h) + "px";
        image2.style.width = image2_w + "px";
        image2.style.height = image2_h + "px";

        const text = document.getElementById("learn-text");
        text.style.fontSize = Math.round(w * 0.05) + "px";
        text.style.marginLeft = Math.round(w * 0.5 - w * 0.15) + "px";
        text.style.marginTop = Math.round(h * 0.26 + image1_h + image2_h) + "px";

        const btn = document.getElementById("learn-playbutton");
        btn.style.width = Math.round(w * 0.13) + "px";
        btn.style.height = Math.round(w * 0.13 * 0.4) + "px";
        btn.style.marginLeft = Math.round(w * 0.53) + "px";
        btn.style.fontSize = Math.round(h * 0.025) + "px";
        btn.style.marginTop = Math.round(h * 0.26 + image1_h + image2_h) + "px";

        const learnPage = document.getElementById("learn-main");
        learnPage.style.height = Math.round(h * 0.38 + image1_h + image2_h) + "px";
    }
}

export default Learn;
