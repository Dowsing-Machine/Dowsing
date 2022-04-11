import _ from "lodash";
import Draco from "draco-vis";
const draco = new Draco();

let inited = false;
let queue = [];
draco.init().then(() => {
    inited = true;
    for (const event of queue) {
        solve(event);
    }
});

function solve(event) {
    const {
        program, softW, options = { models: 20 }
    } = event.data;
    draco.soft=softW;
    console.log("worker",softW);
    const res = draco.solve(program, options) ?? {};
    postMessage(res);
}

onmessage = function (event) {
    // switch (event.data.type) {
    //     case "solve":
    //         if (!inited) {
    //             queue.push(event);
    //         }
    //         else {
    //             solve(event);
    //         }
    //         break;
    // }
    if (!inited) {
        queue.push(event);
    }
    else {
        solve(event);
    }
};