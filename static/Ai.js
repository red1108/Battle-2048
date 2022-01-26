importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.8.0/dist/tf.min.js");

let model;
const map_size = 5;
let state = Array(map_size * map_size).fill(0);
state[map_size - 1] = 1; // AI
state[map_size * (map_size - 1)] = -1; //Player

let possible = [0, 1, 2, 3];
let random_per = 0.08;

async function loadModel(level) {
    if(level == undefined) level = 1;
    model_url = "http://ec2-34-228-197-123.compute-1.amazonaws.com:8000/models/day" + level + "/model.json";
    model = await tf.loadLayersModel(model_url);
    console.log(model_url);
}

onmessage = function (e) {
    const data = e.data;
    if (data["type"] === "message") {
        if (data["value"] === "start") {
            random_per = data["random"];
            loadModel(data["level"]);
        } else if (data["value"] === "again") {
            state = data["state"];
            tmp = [];
            for (let i = 0; i < possible.length; i++) {
                if (possible[i] != data["action"]) {
                    tmp.push(possible[i]);
                }
            }
            possible = tmp;
            console.log("possible = ", possible);
            predict();
        }
        const input = convert(state);
        const prediction = model.predict(tf.tensor([input])).dataSync();
        console.log("ai predict", prediction);
        action = possible.reduce((i, j) => (prediction[i] > prediction[j] ? i : j));
        if (Math.random() < random_per) {
            //choose possible action
            action = possible[Math.floor(Math.random() * possible.length)];
        }
        postMessage({
            type: "message",
            value: "lose",
        });
        return;
    }
    const input = convert(state);
    const prediction = model.predict(tf.tensor([input])).dataSync();

    action = possible.reduce((i, j) => (prediction[i] > prediction[j] ? i : j));
    if (Math.random() < random_per) {
        //choose possible action
        action = possible[Math.floor(Math.random() * possible.length)];
    }
    postMessage({
        type: "action",
        value: action,
    });
};

function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
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
