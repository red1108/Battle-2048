//action
// 0 = right
// 1 = left
// 2 = down
// 3 = up

// turn : true = player's turn, false = Ai's turn
// 100이상의 값은 벽을 의미

export function make_initial_state(map_size) {
    // create initial game state
    let ret = Array(map_size * map_size).fill(0);
    ret[map_size - 1] = 1; // Player 1
    ret[Math.floor((map_size * map_size) / 2)] = 100; // Wall
    ret[map_size * (map_size - 1)] = -1; // Player 2
    return ret;
}

export function calcResult(l_state, action, turn) {
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
    /*
    function action_right
    param state : 게임상태(2D)
    param turn : true면 플레이어, false면 ai

    return : [path, nxt_state]
    */
    const map_size = state.length;
    const paths = [];
    const next_state = new Array(map_size).fill(0).map(() => new Array(map_size).fill(0));

    // 점수계산을 위해 1차원으로 바꿈
    const l_state = [];
    let wallCount = 0;
    for (let i = 0; i < map_size; i++) {
        for (let j = 0; j < map_size; j++) {
            l_state.push(state[i][j]);
            if (state[i][j] >= 100) wallCount++;
        }
    }
    const [playerScore, aiScore] = calculateScore(l_state);
    const totScore = playerScore + aiScore;
    let isWall = false;
    // 만약 벽의 개수가 부족하고, 지금 내가 이기는 중이라면 벽을 추가
    if (1 + Math.floor(totScore / 100) > wallCount) {
        if ((turn && playerScore > aiScore) || (!turn && playerScore < aiScore)) {
            isWall = true;
        }
    }
    console.log("hmm", "p = ", playerScore, "ai = ", aiScore, "tot = ", totScore, "wc = ", wallCount, isWall);
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
    // 새로 생길 블럭의 위치를 랜덤으로 고름
    const [row, col] = empty_pos[Math.floor(Math.random() * empty_pos.length)];
    const random_val = Math.floor(Math.random() * 2) + 1;

    // 벽을 만들어야 할 경우엔 벽을 생성함
    if (isWall) {
        next_state[row][col] = 100 + wallCount;
    } else {
        // 자신의 턴 이후 자신의 블럭 생성
        if (turn === true) {
            next_state[row][col] = -random_val;
        } else {
            next_state[row][col] = random_val;
        }
    }
    return [paths, next_state];
}

export function calcResultMulti(l_state, action, turn, row, col, val) {
    const map_size = Math.round(Math.sqrt(l_state.length));
    const state = new Array(map_size).fill(0).map(() => new Array(map_size).fill(0));
    const next_state = [];

    if (action === 0) {
        //reshape 1D -> 2D
        for (let i = 0; i < map_size; i++) for (let j = 0; j < map_size; j++) state[i][j] = l_state[i * map_size + j];

        const [path, next_2d, r, c, v] = action_right_multi(state, turn, row, col, val);

        //reshape 2D -> 1D
        for (let i = 0; i < map_size; i++) {
            for (let j = 0; j < map_size; j++) {
                next_state.push(next_2d[i][j]);
            }
        }
        return [path, next_state, r, c, v];
    } else if (action === 1) {
        //reshape 1D -> 2D
        for (let i = 0; i < map_size; i++)
            for (let j = 0; j < map_size; j++) state[i][map_size - j - 1] = l_state[i * map_size + j];

        const [_path, next_2d, r, c, v] = action_right_multi(state, turn, row, col, val);

        //reshape 2D -> 1D
        for (let i = 0; i < map_size; i++) {
            for (let j = 0; j < map_size; j++) {
                next_state.push(next_2d[i][map_size - j - 1]);
            }
        }
        const path = _path.map((x) => [x[0], map_size - x[1] - 1, x[2], map_size - x[3] - 1]);
        return [path, next_state, r, c, v];
    } else if (action === 2) {
        //reshape 1D -> 2D
        for (let i = 0; i < map_size; i++)
            for (let j = 0; j < map_size; j++) state[map_size - j - 1][i] = l_state[i * map_size + j];

        const [_path, next_2d, r, c, v] = action_right_multi(state, turn, row, col, val);

        //reshape 2D -> 1D
        for (let i = 0; i < map_size; i++) {
            for (let j = 0; j < map_size; j++) {
                next_state.push(next_2d[map_size - j - 1][i]);
            }
        }
        const path = _path.map((x) => [x[1], map_size - x[0] - 1, x[3], map_size - x[2] - 1]);
        return [path, next_state, r, c, v];
    } else if (action === 3) {
        //reshape 1D -> 2D
        for (let i = 0; i < map_size; i++)
            for (let j = 0; j < map_size; j++) state[j][map_size - i - 1] = l_state[i * map_size + j];

        const [_path, next_2d, r, c, v] = action_right_multi(state, turn, row, col, val);

        //reshape 2D -> 1D
        for (let i = 0; i < map_size; i++) {
            for (let j = 0; j < map_size; j++) {
                next_state.push(next_2d[j][map_size - i - 1]);
            }
        }
        const path = _path.map((x) => [map_size - x[1] - 1, x[0], map_size - x[3] - 1, x[2]]);
        return [path, next_state, r, c, v];
    }
}

function action_right_multi(state, turn, r, c, val) {
    /*
    function action_right_multi
    param state : 게임상태(2D)
    param turn :
    param r :
    param c :
    param val :

    return : 
    */
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
    const random_val = Math.floor(Math.random() * 2) + 1;
    if (turn) {
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
        //자신의 턴 이후 자신의 블럭 생성
        next_state[row][col] = -random_val;
        return [paths, next_state, row, col, random_val];
    } else {
        next_state[r][c] = val;
        return [paths, next_state, r, c, val];
    }
}

export function calculateScore(state) {
    /*
    calculate score function
    param state : 1D array of game state
    return : [p1 score, p2 score]
    */
    let myScore = 0,
        aiScore = 0;
    for (let i = 0; i < state.length; i++) {
        // 100 이상은 벽
        if (state[i] >= 100) continue;

        if (state[i] > 0) {
            aiScore += Math.pow(2, state[i] - 1);
        } else if (state[i] < 0) {
            myScore += Math.pow(2, -state[i] - 1);
        }
    }
    return [myScore, aiScore];
}

export function isStuck(state, turn) {
    let ret = true;
    for (let i = 0; i < 4; i++) {
        const [, nxt] = calcResult(state, i, turn);
        if (JSON.stringify(state) != JSON.stringify(nxt)) {
            ret = false;
            break;
        }
    }
    return ret;
}

export function calculateMax(state) {
    /*
    functioin calculateMax
    return max block level of player

    param state : 1D array of game state
    return : [player1's max leve, player2's max level]
    */
    let score1 = 0,
        score2 = 0;
    for (let i = 0; i < state.length; i++) {
        if (state[i] >= 100) continue; // 100이상은 벽
        if (state[i] > 0) {
            score2 = Math.max(score2, state[i]);
        } else if (state[i] < 0) {
            score1 = Math.max(score1, -state[i]);
        }
    }
    return [score1, score2];
}
