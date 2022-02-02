import { calculateScore } from "./Logic.js";

export default class MyRecorder {
    constructor() {
        this.replay = []; //모든 기록 저장
        this.database = []; //학습용 기록
        this.map_size = 5;
        this.zeros = Array(this.map_size * this.map_size).fill(0);
    }
    record(state, action, next_state, turn) {
        this.replay.push({
            state: state,
            action: action,
            next_state: next_state,
            turn: turn,
            done: false,
        });
        if (turn == true) {
            return;
        }
        if (this.database.length == 0) {
            this.database.push({
                state: state,
                action: action,
                reward: null,
                next_state: this.zeros,
                done: false,
            });
            return;
        }

        const i = this.database.length - 1;
        this.database[i]["next_state"] = state;
        const [player_bef, ai_bef] = calculateScore(this.database[i]["state"]);
        const [player_aft, ai_aft] = calculateScore(state);

        this.database[i]["reward"] = ((ai_aft - player_aft - ai_bef + player_bef) / (player_aft + ai_aft)) * 200;
        this.database.push({
            state: state,
            action: action,
            reward: null,
            next_state: this.zeros,
            done: false,
        });
    }
    finishRecord(winner, state) {
        const i = this.database.length - 1;
        const [player, ai] = calculateScore(state);
        if (winner == true) {
            //player승 -> reward음수
            this.database[i]["reward"] = -(((player - ai) / (player + ai)) * 200 + 100);
        } else {
            this.database[i]["reward"] = ((ai - player) / (ai + player)) * 200 + 100;
        }
        this.database[i]["next_state"] = state;
        this.database[i]["done"] = true;

        for (let i = 0; i < this.database.length; i++) {
            this.database[i]["state"] = this.convert(this.database[i]["state"]);
            this.database[i]["next_state"] = this.convert(this.database[i]["next_state"]);
        }
        const j = this.replay.length - 1;
        this.replay[j]["done"] = true;
        return [this.database, this.replay];
    }
    convert(state) {
        let ret = [];
        let ind = 0;
        for (let i = 0; i < this.map_size; i++) {
            let a = [];
            for (let j = 0; j < this.map_size; j++) {
                let v = state[ind];
                let tmp = [];
                for (let k = 0; k < 32; k++) tmp.push(0);
                if (v == 100) {
                    //wall
                    tmp[31] = 1;
                } else if (v > 0) {
                    tmp[v - 1] = 1;
                } else if (v < 0) {
                    tmp[-v - 1 + 16] = 1;
                }
                a.push(tmp);
                ind = ind + 1;
            }
            ret.push(a);
        }
        return ret;
    }
}
