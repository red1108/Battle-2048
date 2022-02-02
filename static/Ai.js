importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.8.0/dist/tf.min.js");

let model;
const map_size = 5;

let random_per = 0.08; // default

async function loadModel(level) {
    if (level == undefined) level = 1;
    let model_url = "http://localhost/models/day" + level + "/model.json";
    model = await tf.loadLayersModel(model_url);
    console.log("loaded model = ", model_url);
}

onmessage = function (e) {
    const data = e.data;
    /*
    function onmessage : communicate with the ai worker user
    param e.data : data sent to ai
        -> e.data["type"], e.data["value"] and e.data["state"]
    
    This function does not return, but instead replies with postMessage.
    */
    if (data["type"] === "message") {
        if (data["value"] === "start") {
            random_per = data["random"];
            loadModel(data["level"]);
        } else if (data["value"] === "again") {
            console.log("bug occur");
        }
        return;
    } else if (data["type"] === "state") {
        const state = data["state"];
        let possible = get_possible_actions(state);
        console.log("possible = ", possible, "random_per = ", random_per);

        // If nothing can be done, the game is over.
        if (possible.length == 0) {
            postMessage({
                type: "message",
                value: "end",
            });
            return;
        }
        // Get ai prediction
        const input = convert(state);
        const prediction = model.predict(tf.tensor([input])).dataSync();

        // Among the possible actions, choose the best action.
        let action = possible[0];
        for (let i = 1; i < possible.length; i++) {
            if (prediction[action] < prediction[possible[i]]) {
                action = possible[i];
            }
        }

        // Apply random probability
        if (Math.random() < random_per) {
            action = possible[Math.floor(Math.random() * possible.length)];
        }
        postMessage({
            type: "action",
            value: action,
        });
        return;
    }
};

function get_possible_actions(state) {
    /*
    function get_possible_actions
    param state : state of the game (2D array)
    return : 1D list of possible actions
    */
    const l_state = [];
    for (let i = 0; i < map_size; i++) {
        for (let j = 0; j < map_size; j++) {
            l_state.push(state[i][j]);
        }
    }
    const possible_actions = [];
    for (let i = 0; i < 4; i++) {
        const [, nxt] = calcResult(state, i, true);
        if (JSON.stringify(state) != JSON.stringify(nxt)) {
            possible_actions.push(i);
        }
    }
    return possible_actions;
}

function calcResult(l_state, action, turn) {
    /*
    calculate result function
    param l_state : 1D version state
    action : 0:→, 1:←, 2:↓, 3:↑
    turn : true = player, false = ai
    return : [path, next_state(1D)]
    It should be noted that ai is represented by a positive number, and the player is represented by a negative number.
    */
    const map_size = Math.round(Math.sqrt(l_state.length));
    const state = new Array(map_size).fill(0).map(() => new Array(map_size).fill(0));
    const next_state = [];

    if (action === 0) {
        //reshape 1D -> 2D
        for (let i = 0; i < map_size; i++) for (let j = 0; j < map_size; j++) state[i][j] = l_state[i * map_size + j];

        const [path, next_2d] = action_right(state, turn);

        //reshape 2D -> 1D
        for (let i = 0; i < map_size; i++) {
            for (let j = 0; j < map_size; j++) {
                next_state.push(next_2d[i][j]);
            }
        }
        return [path, next_state];
    } else if (action === 1) {
        //reshape 1D -> 2D
        for (let i = 0; i < map_size; i++)
            for (let j = 0; j < map_size; j++) state[i][map_size - j - 1] = l_state[i * map_size + j];

        const [_path, next_2d] = action_right(state, turn);

        //reshape 2D -> 1D
        for (let i = 0; i < map_size; i++) {
            for (let j = 0; j < map_size; j++) {
                next_state.push(next_2d[i][map_size - j - 1]);
            }
        }
        const path = _path.map((x) => [x[0], map_size - x[1] - 1, x[2], map_size - x[3] - 1]);
        return [path, next_state];
    } else if (action === 2) {
        //reshape 1D -> 2D
        for (let i = 0; i < map_size; i++)
            for (let j = 0; j < map_size; j++) state[map_size - j - 1][i] = l_state[i * map_size + j];

        const [_path, next_2d] = action_right(state, turn);

        //reshape 2D -> 1D
        for (let i = 0; i < map_size; i++) {
            for (let j = 0; j < map_size; j++) {
                next_state.push(next_2d[map_size - j - 1][i]);
            }
        }
        const path = _path.map((x) => [x[1], map_size - x[0] - 1, x[3], map_size - x[2] - 1]);
        return [path, next_state];
    } else if (action === 3) {
        //reshape 1D -> 2D
        for (let i = 0; i < map_size; i++)
            for (let j = 0; j < map_size; j++) state[j][map_size - i - 1] = l_state[i * map_size + j];

        const [_path, next_2d] = action_right(state, turn);

        //reshape 2D -> 1D
        for (let i = 0; i < map_size; i++) {
            for (let j = 0; j < map_size; j++) {
                next_state.push(next_2d[j][map_size - i - 1]);
            }
        }
        const path = _path.map((x) => [map_size - x[1] - 1, x[0], map_size - x[3] - 1, x[2]]);
        return [path, next_state];
    }
}

function action_right(state, turn) {
    const map_size = state.length;
    const paths = [];
    const next_state = new Array(map_size).fill(0).map(() => new Array(map_size).fill(0));

    for (let row = 0; row < map_size; row++) {
        let holder = map_size;

        for (let col = map_size - 1; col >= 0; col--) {
            if (state[row][col] === 0) continue;
            if (holder >= map_size) {
                holder--;
                next_state[row][holder] = state[row][col];
                paths.push([row, col, row, holder]);
                continue;
            }
            if (next_state[row][holder] === 0) {
                //move
                next_state[row][holder] = state[row][col];
                paths.push([row, col, row, holder]);
            } else if (next_state[row][holder] === state[row][col]) {
                //merge
                if (next_state[row][holder] > 0) {
                    next_state[row][holder]++;
                } else {
                    next_state[row][holder]--;
                }
                paths.push([row, col, row, holder]);
                holder--;
            } else if (next_state[row][holder] === -state[row][col]) {
                //conquer
                if (next_state[row][holder] > 0) {
                    next_state[row][holder]++;
                } else {
                    next_state[row][holder]--;
                }
                if (turn === true) {
                    next_state[row][holder] = -Math.abs(next_state[row][holder]);
                } else {
                    next_state[row][holder] = Math.abs(next_state[row][holder]);
                }
                paths.push([row, col, row, holder]);
                holder--;
            } else {
                holder--;
                next_state[row][holder] = state[row][col];
                paths.push([row, col, row, holder]);
            }
        }
    }
    //create random block (1 or 2)
    const empty_pos = [];
    for (let row = 0; row < map_size; row++) {
        for (let col = 0; col < map_size; col++) {
            if (next_state[row][col] === 0) {
                empty_pos.push([row, col]);
            }
        }
    }
    if (empty_pos.length === 0) {
        return [paths, next_state];
    }

    const [row, col] = empty_pos[Math.floor(Math.random() * empty_pos.length)];
    const random_val = Math.floor(Math.random() * 2) + 1;
    //자신의 턴 이후 자신의 블럭 생성
    if (turn === true) {
        next_state[row][col] = -random_val;
    } else {
        next_state[row][col] = random_val;
    }
    return [paths, next_state];
}

function convert(state) {
    let ret = Array(map_size * map_size * 2).fill(0);
    let max = 0;
    for (let i = 0; i < map_size * map_size; i++) {
        if (state[i] > 0 && max < state[i]) max = state[i];
        if (state[i] < 0 && max < -state[i]) max = -state[i];
    }
    for (let i = 0; i < map_size * map_size; i++) {
        if (state[i] > 0) {
            //ai 먼저
            ret[i] = Math.pow(2, state[i] - max);
        } else if (state[i] < 0) {
            //뒤에 player
            ret[i + map_size * map_size] = Math.pow(2, -state[i] - max);
        }
    }
    return ret;
}
