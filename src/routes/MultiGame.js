import React from "react";
import "./MultiGame.css";
import io from "socket.io-client";
import { calculateScore, calculateMax, isStuck, calcResultMulti } from "../components/Logic.js";
import { drawState, animationPath } from "../components/Drawing.js";
import MyRecorder from "../components/Recorder";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import ReactGA from "react-ga";

var constants = require("../helpers/Constants.js");
const playerColor = constants.player_color;
const playerTextColor = constants.player_text_color;
const aiColor = constants.ai_color;
const aiTextColor = constants.ai_text_color;

const socket = io();

const map_size = constants.map_size;
let pause = false;

let xDown = null;
let yDown = null;

class MultiGame extends React.Component {
    constructor(props) {
        super(props);
        //Mount Canvas
        this.canvasRef = React.createRef();
        this.ctx = null;
        this.recorder = new MyRecorder();

        let initial_state = Array(map_size * map_size).fill(0);
        let turn = true;

        if (Number(this.props.match.params.first) === 0) {
            initial_state[map_size - 1] = 1; // opponent
            initial_state[map_size * (map_size - 1)] = -1; // me
        } else {
            initial_state[map_size - 1] = -1; // opponent
            initial_state[map_size * (map_size - 1)] = 1; // me
            turn = false;
        }

        let color_theme = 0;
        if (Math.random() < 0.05) color_theme = 1;

        this.state = {
            history: [
                {
                    squares: initial_state,
                    turn: turn,
                },
            ],
            winner: null,
            index: 0,
            canvas: document.getElementById("canvas"),
            theme: color_theme,
        };
    }

    handleResize() {
        update_layout();
        let w = window.innerWidth;
        let canvasWidth = 500;
        if (w <= 600) {
            canvasWidth = Math.floor((w * 500) / 600);
        }
        this.setState({
            canvasWidth: canvasWidth,
            canvasHeight: canvasWidth,
        });

        drawState(this.canvasRef.current, this.state.history[this.state.index].squares, this.state.theme);
    }

    componentDidMount() {
        const pathName = "multigame";
        ReactGA.initialize("UA-218917298-1");
        ReactGA.set({ page: pathName });
        ReactGA.pageview(pathName);

        this.ctx = this.canvasRef.current.getContext("2d");
        drawState(this.canvasRef.current, this.state.history[this.state.index].squares, this.state.theme);

        socket.emit("roomjoin", this.props.match.params.id);

        socket.on("movetoclient", (uid, action, winner, row, col, val) => {
            if (uid == this.props.userObj.uid) return;
            console.log(uid);

            const current = this.state.history[this.state.index];
            const [paths, nxt, , ,] = calcResultMulti(current.squares, action, false, row, col, val);
            const history = this.state.history.slice(0, this.state.index + 1);

            animationPath(this.canvasRef.current, current.squares, paths, nxt, this.state.theme);
            this.setState({
                history: history.concat([
                    {
                        squares: nxt,
                        turn: true,
                    },
                ]),
                index: this.state.index + 1,
                winner: winner,
            });
            setTimeout(disablePause, 1400);
        });

        window.addEventListener("keydown", (e) => this.handleKeyboard(e));
        window.addEventListener(
            "keydown",
            function (e) {
                if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
                    e.preventDefault();
                }
            },
            false,
        );

        window.onresize = (e) => this.handleResize(e);
        document.addEventListener("touchstart", handleTouchStart, false);
        document.addEventListener("touchmove", (e) => this.handleTouchMove(e), false);

        document.getElementById("you-score").style.backgroundColor = playerColor[this.state.theme][1];
        document.getElementById("ai-score").style.backgroundColor = aiColor[this.state.theme][1];
        update_layout();
    }

    handleTouchMove(evt) {
        const current = this.state.history[this.state.index];
        if (current.turn === false || this.state.winner != null || pause) {
            return;
        }
        if (!xDown || !yDown) {
            return;
        }
        let xUp = evt.touches[0].clientX;
        let yUp = evt.touches[0].clientY;
        let xDiff = xDown - xUp;
        let yDiff = yDown - yUp;
        if (
            Math.max(Math.abs(xDiff), Math.abs(yDiff)) < 30 ||
            (Math.abs(xDiff) * 3 > Math.abs(yDiff) && Math.abs(yDiff) * 3 > Math.abs(xDiff))
        ) {
            //ignore
            return;
        }
        xDown = null;
        yDown = null;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) this.handleAction(1);
            else this.handleAction(0);
        } else {
            if (yDiff > 0) this.handleAction(3);
            else this.handleAction(2);
        }
    }

    handleKeyboard(event) {
        const current = this.state.history[this.state.index];
        if (current.turn === false || this.state.winner != null || pause) {
            return;
        }

        if (event.key === "ArrowRight") this.handleAction(0);
        else if (event.key === "ArrowLeft") this.handleAction(1);
        else if (event.key === "ArrowDown") this.handleAction(2);
        else if (event.key === "ArrowUp") this.handleAction(3);
        else return;
    }

    handleAction(action) {
        if (this.state.winner != null) {
            return;
        }
        const history = this.state.history.slice(0, this.state.index + 1);
        const current = this.state.history[this.state.index];
        const [paths, nxt, row, col, val] = calcResultMulti(current.squares, action, true, 0, 0, 0);

        //아무것도 바뀌지 않는다면 turn을 넘기지 않음.
        if (JSON.stringify(current.squares) === JSON.stringify(nxt)) {
            return false;
        }

        this.recorder.record(current.squares, action, nxt, current.turn);

        let winner = null;
        const [myScore, aiScore] = calculateScore(nxt);

        if (isStuck(nxt, !current.turn)) {
            if (myScore > aiScore) winner = true;
            else if (myScore < aiScore) winner = false;
            else winner = current.turn;
        }

        if (myScore >= aiScore * 10) winner = true;
        else if (myScore * 10 <= aiScore) winner = false;

        const [myBest, aiBest] = calculateMax(nxt);
        document.getElementById("you-score").style.color = playerTextColor[myBest];
        document.getElementById("you-score").style.backgroundColor = playerColor[this.state.theme][myBest];
        document.getElementById("ai-score").style.color = aiTextColor[aiBest];
        document.getElementById("ai-score").style.backgroundColor = aiColor[this.state.theme][aiBest];

        this.setState({
            history: history.concat([
                {
                    squares: nxt,
                    turn: false,
                },
            ]),
            index: this.state.index + 1,
            winner: winner,
        });

        pause = true;
        animationPath(this.canvasRef.current, current.squares, paths, nxt, this.state.theme);
        socket.emit("movetoserver", this.props.match.params.id, this.props.userObj.uid, action, winner, row, col, val);
        return true;
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.index];

        let message = "Your Turn";

        if (current.turn === false) {
            message = "Opponent's Turn";
        }

        const [myScore, aiScore] = calculateScore(current.squares);

        if (this.state.winner === true) {
            message = "You Win!!";
        } else if (this.state.winner === false) {
            message = "You Lose";
        }

        return (
            <div className="game">
                <div id="game-title">Battle</div>
                <div id="game-title-sub">2048</div>
                <div id="you-text">YOU</div>
                <div id="ai-text">AI</div>
                <div id="you-score">{myScore}</div>
                <div id="ai-score">{aiScore}</div>

                <canvas ref={this.canvasRef} width={500} height={500} id="game-board"></canvas>
                <h1 id="game-info">
                    <div>{message}</div>
                </h1>
                <iframe
                    src="https://coupa.ng/cbNsZs"
                    id="coupang-left-ads"
                    width="120"
                    height="240"
                    frameBorder="0"
                    scrolling="no"
                    referrerpolicy="unsafe-url"
                />
                <iframe
                    src="https://coupa.ng/cbNsUM"
                    id="coupang-right-ads"
                    width="120"
                    height="240"
                    frameBorder="0"
                    scrolling="no"
                    referrerpolicy="unsafe-url"
                />

                <div id="coupang-text">
                    이 서비스는 쿠팡파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 받을 수 있습니다.
                </div>
            </div>
        );
    }
}

function disablePause() {
    pause = false;
}

function update_layout() {
    let w = window.innerWidth,
        h = window.innerHeight;
    let canvasSize = Math.min(Math.round(w * 0.9), Math.round(h * 0.5));

    const board = document.getElementById("game-board");
    board.style.marginTop = Math.round(h * 0.2) + "px";
    board.style.width = canvasSize + "px";
    board.style.height = canvasSize + "px";
    board.style.marginLeft = Math.round((w - canvasSize) / 2) + "px";
    board.style.marginTop = Math.round((h - canvasSize) / 2 - canvasSize * 0.1) + "px";

    const title = document.getElementById("game-title");
    title.style.fontSize = Math.round((50 * canvasSize) / 500) + "px";
    title.style.marginLeft = Math.round((w - canvasSize) / 2) + "px";
    title.style.marginTop = Math.round((h - canvasSize) / 2 - canvasSize * 0.35) + "px";

    const subTitle = document.getElementById("game-title-sub");
    subTitle.style.fontSize = Math.round((30 * canvasSize) / 500) + "px";
    subTitle.style.marginLeft = Math.round((w - canvasSize) / 2) + "px";
    subTitle.style.marginTop = Math.round((h - canvasSize) / 2 - canvasSize * 0.23) + "px";

    const youText = document.getElementById("you-text");
    youText.style.fontSize = Math.round((30 * canvasSize) / 500) + "px";
    youText.style.marginLeft = Math.round((w - canvasSize) / 2 + canvasSize * 0.507) + "px";
    youText.style.marginTop = Math.round((h - canvasSize) / 2 - canvasSize * 0.35) + "px";

    const aiText = document.getElementById("ai-text");
    aiText.style.fontSize = Math.round((30 * canvasSize) / 500) + "px";
    aiText.style.marginLeft = Math.round((w - canvasSize) / 2 + canvasSize * 0.85) + "px";
    aiText.style.marginTop = Math.round((h - canvasSize) / 2 - canvasSize * 0.35) + "px";

    const youScore = document.getElementById("you-score");
    youScore.style.fontSize = Math.round((30 * canvasSize) / 500) + "px";
    youScore.style.marginLeft = Math.round((w - canvasSize) / 2 + canvasSize * 0.445) + "px";
    youScore.style.marginTop = Math.round((h - canvasSize) / 2 - canvasSize * 0.25) + "px";
    youScore.style.width = Math.round(canvasSize * 0.23) + "px";

    const aiScore = document.getElementById("ai-score");
    aiScore.style.fontSize = Math.round((30 * canvasSize) / 500) + "px";
    aiScore.style.marginLeft = Math.round((w - canvasSize) / 2 + canvasSize * 0.76) + "px";
    aiScore.style.marginTop = Math.round((h - canvasSize) / 2 - canvasSize * 0.25) + "px";
    aiScore.style.width = Math.round(canvasSize * 0.23) + "px";

    const gameInfo = document.getElementById("game-info");
    gameInfo.style.fontSize = Math.round((40 * canvasSize) / 500) + "px";
    gameInfo.style.marginLeft = Math.round((w - canvasSize) / 2 + canvasSize * 0.3) + "px";
    gameInfo.style.marginTop = Math.round(h / 2 + canvasSize * 0.45) + "px";

    const leftAds = document.getElementById("coupang-left-ads");
    leftAds.style.marginLeft = "0px";
    leftAds.style.marginTop = Math.round((h - 240) / 2) + "px";

    const rightAds = document.getElementById("coupang-right-ads");
    rightAds.style.marginLeft = Math.round(w - 120) + "px";
    rightAds.style.marginTop = Math.round((h - 240) / 2) + "px";

    const coupangText = document.getElementById("coupang-text");
    coupangText.style.fontSize = Math.round(h * 0.015) + "px";
    coupangText.style.marginLeft = Math.round(w * 0.5 - h * 0.29) + "px";
    coupangText.style.marginTop = Math.round(h * 0.75 + canvasSize * 0.45) + "px";
}

function getTouches(evt) {
    return (
        evt.touches || // browser API
        evt.originalEvent.touches
    ); // jQuery
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

MultiGame.propTypes = {
    userObj: PropTypes.object.isRequired,
    match: PropTypes.any,
    history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
};

export default withRouter(MultiGame);
