function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true,
    });
}

define("map_size", 5);
define("block_padding", 15);
define("block_round", 10);

define("player_color", [
    [
        "_",
        "#eee6db",
        "#ede1c8",
        "#eeb27d",
        "#f29767",
        "#f37c62",
        "#f26140",
        "#ebce74",
        "#edcb67",
        "#ebc85b",
        "#e7c359",
        "#e9be4f",
    ],
    [
        "_",
        "#eaf9f1",
        "#d0f2eb",
        "#a3e4d7",
        "#76d7c3",
        "#48c9b0",
        "#f26140",
        "#1abc9b",
        "#19a589",
        "#148f77",
        "#127864",
        "#0e6251",
    ],
]);

define("player_text_color", [
    "_",
    "#796c65",
    "#796c65",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
]);

define("ai_color", [
    ["_", "#D5D8DC", "#ABB2B9", "#808B96", "#566573", "#2C3E50", "#273746", "#212F3D", "#1C2833", "#17202A", "#060E18"],
    ["_", "#f9eae9", "#f2d7d5", "#e6b0aa", "#d98880", "#cc6155", "#bf392b", "#a93225", "#922b21", "#7a241c", "#641e16"],
]);

define("ai_text_color", [
    "_",
    "#796c65",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
]);
