import React from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Google Analytics
import ReactGA from "react-ga";

// Import Swiper styles
import "swiper/swiper.min.css";
import "swiper/components/pagination/pagination.min.css";

import "./listStyles.css";

// import Swiper core and required modules
import SwiperCore, { Pagination } from "swiper/core";
import { dbService } from "../fbase";
import ReactRouterPropTypes from "react-router-prop-types";
import PropTypes from "prop-types";

var constants = require("../helpers/Constants.js");
const playerColor = constants.player_color[0];
const playerTextColor = constants.player_text_color;

// install Swiper modules
SwiperCore.use([Pagination]);

const aiDays = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
    32, 33, 34, 35, 36, 37, 38, 39, 40,
];

class List extends React.Component {
    constructor(props) {
        super(props);

        const [colNum, rowNum] = calculate_layout();

        this.state = {
            colNum: colNum,
            rowNum: rowNum,
            clearlist: [],
        };

        this.lists = aiDays.map((i) => {
            return (
                <SwiperSlide onClick={() => this.handleClick(i)} key={i}>
                    <div className="swiper-content">
                        <img
                            className="cleared-image"
                            src="https://user-images.githubusercontent.com/17401630/129873431-4c8144a2-0721-459b-9296-69c5481b5b21.png"
                        />
                        <div className="day-number">{i}</div>
                        <div className="cleared-head">Who Cleared</div>
                        <div className="cleared-number">0</div>
                    </div>
                </SwiperSlide>
            );
        });
        window.onresize = (e) => this.handleResize(e);
        //window.addEventListener('resize', (e)=>this.handleResize(e));
    }

    componentDidMount() {
        // google analytics - list
        const pathName = "list";
        ReactGA.initialize("UA-218917298-1");
        ReactGA.set({ page: pathName });
        ReactGA.pageview(pathName);

        let h = window.innerHeight;
        document.getElementById("list-inside").style.paddingTop = Math.round(h / 10) + "px";
        const [colNum, rowNum] = calculate_layout();

        this.setState({
            colNum: colNum,
            rowNum: rowNum,
        });
        update_layout(this.props.userObj.uid);
    }

    handleResize() {
        let h = window.innerHeight;
        document.getElementById("list-inside").style.paddingTop = Math.round(h / 10) + "px";
        update_layout(this.props.userObj.uid);

        const [rowNum, colNum] = calculate_layout();
        this.setState({
            colNum: colNum,
            rowNum: rowNum,
        });
    }

    handleClick(i) {
        const listDocRef = dbService.collection("list_info").doc("clear_array");
        listDocRef.get().then((doc) => {
            if (doc.exists && i <= doc.data().maxDays) {
                const { history } = this.props;
                history.push(`/list/${i}`);
            }
        });
    }

    render() {
        const [rowNum, colNum] = calculate_layout();
        return (
            <div id="list-inside">
                <Swiper
                    slidesPerView={colNum}
                    slidesPerColumn={rowNum}
                    slidesPerGroup={colNum}
                    pagination={{ clickable: true }}
                    className="mySwiper"
                >
                    {this.lists}
                </Swiper>
            </div>
        );
    }
}

export default List;

function calculate_layout() {
    let w = window.innerWidth,
        h = window.innerHeight;

    let colNum = 5,
        rowNum = 3;
    if (h < 450) rowNum = 1;
    else if (h < 750) rowNum = 2;
    else if (h < 1100) rowNum = 3;
    else if (h < 1400) rowNum = 4;
    else if (h < 1600) rowNum = 5;
    else if (h < 1800) rowNum = 6;
    else rowNum = 7;

    if (w < 400) colNum = 1;
    else if (w < 680) colNum = 2;
    else if (w < 950) colNum = 3;
    else if (w < 1250) colNum = 4;
    else if (w < 1600) colNum = 5;
    else if (w < 1800) colNum = 6;
    else colNum = 7;
    return [rowNum, colNum];
}

function update_layout(uid) {
    let w = window.innerWidth,
        h = window.innerHeight;
    const [rowNum, colNum] = calculate_layout();
    const sliders = document.getElementsByClassName("swiper-slide");
    const contents = document.getElementsByClassName("swiper-content");

    for (let i = 0; i < sliders.length; i++) {
        sliders[i].style.height = Math.round(90 / rowNum) + "%";
    }
    const size = Math.round(Math.min((((h / rowNum) * 9) / 10) * 0.8, (w / colNum) * 0.8));

    const listDocRef = dbService.collection("list_info").doc("clear_array");
    listDocRef.get().then((doc) => {
        if (doc.exists) {
            const clearList = doc.data().clearArray;
            const maxDays = doc.data().maxDays;
            for (let i = 0; i < Math.min(contents.length, maxDays); i++) {
                const clearedNum = contents[i].getElementsByClassName("cleared-number")[0];
                clearedNum.textContent = clearList[i + 1];
            }
        }
    });

    const userDocRef = dbService.collection("user_info").doc(uid);
    userDocRef.get().then((doc) => {
        for (let i = 0; i < contents.length; i++) {
            contents[i].style.width = size + "px";
            contents[i].style.height = size + "px";
            const dayNumber = contents[i].getElementsByClassName("day-number")[0];
            const num = Number(dayNumber.textContent);
            const clearedHead = contents[i].getElementsByClassName("cleared-head")[0];
            const clearedNum = contents[i].getElementsByClassName("cleared-number")[0];
            const clearedImg = contents[i].getElementsByClassName("cleared-image")[0];
            contents[i].style.background = playerColor[Math.floor((num - 1) / 10) + 1];
            dayNumber.style.color = playerTextColor[Math.floor((num - 1) / 10) + 1];
            clearedHead.style.color = playerTextColor[Math.floor((num - 1) / 10) + 1];
            clearedNum.style.color = playerTextColor[Math.floor((num - 1) / 10) + 1];

            if (num < 10) {
                dayNumber.style.fontSize = Math.round(size * 0.7) + "px";
                clearedHead.style.marginTop = "63%";
            } else {
                dayNumber.style.fontSize = Math.round(size * 0.6) + "px";
                dayNumber.style.marginTop = "0%";
                dayNumber.style.marginLeft = "17%";
                clearedHead.style.marginTop = "63%";
            }
            clearedNum.style.marginTop = "76%";
            clearedNum.style.marginLeft = "45%";
            clearedHead.style.fontSize = Math.round(size * 0.12) + "px";
            clearedNum.style.fontSize = Math.round(size * 0.18) + "px";

            if (num > doc.data().level) {
                clearedImg.style.visibility = "hidden";
            }
        }
    });
}

List.propTypes = {
    userObj: PropTypes.object.isRequired,
    history: ReactRouterPropTypes.history.isRequired,
};
