import React from "react";
import "./Home.css";
import { calcResult, calculateScore, calculateMax, isStuck } from "../components/Logic.js";
import { drawState, animationPath } from "../components/Drawing.js";
import { Link } from "react-router-dom";

var constants = require("../helpers/Constants.js");
const playerColor = constants.player_color;
const aiColor = constants.ai_color;

const model1 = new Worker("Ai.js");
model1.postMessage({ type: "message", value: "start", random: 1 });

const model2 = new Worker("Ai.js");
model2.postMessage({ type: "message", value: "start", random: 0 });

const map_size = constants.map_size;

class Home extends React.Component {
    constructor(props) {
        super(props);
        //Mount Canvas
        this.canvasRef = React.createRef();
        this.ctx = null;

        let initial_state = Array(map_size * map_size).fill(0);
        initial_state[map_size - 1] = 1; // AI1
        initial_state[map_size * (map_size - 1)] = -1; //AI2

        const isMobile = window.innerWidth <= window.innerHeight * 0.84;
        const canvasWidth = isMobile ? window.innerWidth * 0.524 : window.innerHeight * 0.491;
        let color_theme = 0;
        if (Math.random() < 0.3) color_theme = 1;

        this.state = {
            history: [
                {
                    squares: initial_state,
                    turn: true, //AI1 turn
                },
            ],
            winner: null,
            index: 0,
            canvas: document.getElementById("canvas"),
            canvasWidth: canvasWidth,
            canvasHeight: canvasWidth,
            theme: color_theme,
        };

        let tmp = this;
        model1.onmessage = function (e) {
            const data = e.data;
            if (data["type"] === "action") {
                if (tmp.state.winner != null) {
                    return;
                }
                const action = data["value"];
                const ret = tmp.handleAction(action);

                if (ret === false) {
                    const current = tmp.state.history[tmp.state.index];
                    model1.postMessage({
                        type: "message",
                        value: "again",
                        action: data["value"],
                        state: current.squares,
                    });
                } else {
                    const nxt = tmp.state.history[tmp.state.index].squares;
                    if (tmp.state.winner === null) {
                        setTimeout(() => model2.postMessage({ type: "state", state: nxt }), 1000);
                    }
                }
            }
        };

        model2.onmessage = function (e) {
            const data = e.data;
            if (data["type"] === "action") {
                if (tmp.state.winner != null) {
                    return;
                }
                const action = data["value"];
                const ret = tmp.handleAction(action);

                if (ret === false) {
                    const current = tmp.state.history[tmp.state.index];
                    model2.postMessage({
                        type: "message",
                        value: "again",
                        action: data["value"],
                        state: current.squares,
                    });
                } else {
                    const nxt = tmp.state.history[tmp.state.index].squares;
                    if (tmp.state.winner === null) {
                        setTimeout(() => model1.postMessage({ type: "state", state: nxt }), 1000);
                    }
                }
            }
        };

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
    }

    handleResize() {
        const isMobile = window.innerWidth <= window.innerHeight * 0.84;
        const canvasWidth = isMobile ? window.innerWidth * 0.524 : window.innerHeight * 0.491;

        this.setState({
            canvasWidth: canvasWidth,
            canvasHeight: canvasWidth,
        });

        if (isMobile) {
            document.getElementById("mhome-score").style.left = 0.238 * window.innerWidth + this.state.canvasWidth / 4;
            document.getElementById("mhome-score").style.top = 0.548 * window.innerHeight + this.state.canvasWidth;
            document.getElementById("mhome-score").style.width = this.state.canvasWidth / 2;
            document.getElementById("mhome-score").style.backgroundColor = "#bbaca1";
        } else {
            document.getElementById("home-score").style.removeProperty("left");
            document.getElementById("home-score").style.right = 0.0353 * window.innerWidth + this.state.canvasWidth / 4;
            document.getElementById("home-score").style.top = 0.893 * window.innerHeight;
            document.getElementById("home-score").style.width = this.state.canvasWidth / 2;
            document.getElementById("home-score").style.backgroundColor = "#bbaca1";
        }
        drawState(this.canvasRef.current, this.state.history[this.state.index].squares, this.state.theme);
    }

    componentDidMount() {
        const isMobile = window.innerWidth <= window.innerHeight * 0.84;
        //this.renderText("Welcome to Battle 2048", 50, "text1");
        this.ctx = this.canvasRef.current.getContext("2d");
        drawState(this.canvasRef.current, this.state.history[this.state.index].squares, this.state.theme);
        const nxt = this.state.history[this.state.index].squares;
        if (this.state.winner === null) {
            setTimeout(() => model1.postMessage({ type: "state", state: nxt }), 1000);
        }
        if (isMobile) {
            document.getElementById("mhome-score").style.left = 0.238 * window.innerWidth + this.state.canvasWidth / 4;
            document.getElementById("mhome-score").style.top = 0.548 * window.innerHeight + this.state.canvasWidth;
            document.getElementById("mhome-score").style.width = this.state.canvasWidth / 2;
            document.getElementById("mhome-score").style.backgroundColor = "#bbaca1";
        } else {
            document.getElementById("home-score").style.removeProperty("left");
            document.getElementById("home-score").style.right = 0.0353 * window.innerWidth + this.state.canvasWidth / 4;
            document.getElementById("home-score").style.top = 0.893 * window.innerHeight;
            document.getElementById("home-score").style.width = this.state.canvasWidth / 2;
            document.getElementById("home-score").style.backgroundColor = "#bbaca1";
        }
        let ins = document.createElement("ins");
        let scr = document.createElement("script");

        if (isMobile) {
            ins.className = "kakao_ad_area";
            ins.style = "display:none;";
            scr.async = "true";
            scr.type = "text/javascript";
            scr.src = "//t1.daumcdn.net/kas/static/ba.min.js";
            ins.setAttribute("data-ad-width", "320");
            ins.setAttribute("data-ad-height", "50");
            ins.setAttribute("data-ad-unit", "DAN-Qsczy4q6rY9wbwdE");

            document.querySelector(".madfit").appendChild(ins);
            document.querySelector(".madfit").appendChild(scr);
        } else {
            ins.className = "kakao_ad_area";
            ins.style = "display:none;";
            scr.async = "true";
            scr.type = "text/javascript";
            scr.src = "//t1.daumcdn.net/kas/static/ba.min.js";
            ins.setAttribute("data-ad-width", "320");
            ins.setAttribute("data-ad-height", "50");
            ins.setAttribute("data-ad-unit", "DAN-Qsczy4q6rY9wbwdE");

            document.querySelector(".adfit").appendChild(ins);
            document.querySelector(".adfit").appendChild(scr);
        }
    }

    handleAction(action) {
        if (this.state.winner != null) {
            return;
        }
        const history = this.state.history.slice(0, this.state.index + 1);
        const current = this.state.history[this.state.index];
        const [paths, nxt] = calcResult(current.squares, action, current.turn);

        //아무것도 바뀌지 않는다면 turn을 넘기지 않음.
        if (JSON.stringify(current.squares) === JSON.stringify(nxt)) {
            return false;
        }

        let winner = null;
        const [myScore, aiScore] = calculateScore(nxt);

        if (isStuck(nxt, !current.turn)) {
            if (myScore > aiScore) {
                winner = true;
            } else if (myScore < aiScore) {
                winner = false;
            } else {
                winner = current.turn;
            }
        }
        if (myScore >= aiScore * 10) {
            winner = true;
        } else if (myScore * 10 <= aiScore) {
            winner = false;
        }

        this.setState({
            history: history.concat([
                {
                    squares: nxt,
                    turn: !current.turn,
                },
            ]),
            index: this.state.index + 1,
            winner: winner,
        });

        animationPath(this.canvasRef.current, current.squares, paths, nxt, this.state.theme);
        return true;
    }

    /*renderText(txt, size, id) {
    let text = document.getElementById(id);
    const typewriter = new Typewriter(text, {
      loop: false
    });
    typewriter.typeString(txt);
  }*/

    render() {
        const history = this.state.history;
        const current = history[this.state.index];

        const [myScore, aiScore] = calculateScore(current.squares);

        const isMobile = window.innerWidth <= window.innerHeight * 0.84;
        const [myBest, aiBest] = calculateMax(current.squares);

        if (isMobile) {
            return (
                <>
                    <div className="mhome-game">
                        <canvas
                            ref={this.canvasRef}
                            width={this.state.canvasWidth}
                            height={this.state.canvasHeight}
                            className="mhome-game-board"
                        ></canvas>
                    </div>
                    <div id="mhome-score">
                        <span style={{ color: playerColor[this.state.theme][myBest] }}>{myScore}</span>
                        <span>&nbsp;&nbsp;Score&nbsp;&nbsp;</span>
                        <span style={{ color: aiColor[this.state.theme][aiBest] }}>{aiScore}</span>
                    </div>
                    <div className="mhome-hello">Hello!</div>
                    <div className="mhome-text1">
                        <span>Play</span>
                        <span style={{ color: "#796c65" }}>&nbsp;Battle 2048</span>
                    </div>
                    <div className="mhome-text2">
                        <span style={{ color: "#796c65" }}>With </span>
                        <span>Ai </span>
                        <span style={{ color: "#796c65" }}>or </span>
                        <span>Players </span>
                    </div>
                    <Link to="/game">
                        <div className="mhome-playbutton">play</div>
                    </Link>
                    <Link to="/game">
                        <div className="mhome-learnbutton">learn more</div>
                    </Link>
                    <div className="madfit" />
                </>
            );
        } else {
            return (
                <>
                    <div className="home-game">
                        <canvas
                            ref={this.canvasRef}
                            width={this.state.canvasWidth}
                            height={this.state.canvasHeight}
                            className="home-game-board"
                        ></canvas>
                    </div>
                    <div id="home-score">
                        <span style={{ color: playerColor[this.state.theme][myBest] }}>{myScore}</span>
                        <span>&nbsp;&nbsp;Score&nbsp;&nbsp;</span>
                        <span style={{ color: aiColor[this.state.theme][aiBest] }}>{aiScore}</span>
                    </div>
                    <div className="home-hello">Hello!</div>
                    <div className="home-text1">
                        <span>Play</span>
                        <span style={{ color: "#796c65" }}>&nbsp;Battle 2048</span>
                    </div>
                    <div className="home-text2">
                        <span style={{ color: "#796c65" }}>With </span>
                        <span>Ai </span>
                        <span style={{ color: "#796c65" }}>or </span>
                        <span>Players </span>
                    </div>
                    <Link to="/game">
                        <div className="home-playbutton">play</div>
                    </Link>
                    <Link to="/game">
                        <div className="home-learnbutton">learn more</div>
                    </Link>
                    <div className="adfit" />
                </>
            );
        }
    }
}

export default Home;
