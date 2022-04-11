import { defineStore } from "pinia";
// import axios from "axios";
import http from "@/utils/http";
import _ from "lodash";

const DEFAULT_TASKS = ["数据转换", "关联", "关联（趋势）", "对比", "确认值", "聚类/异常"];
const action2num = {
    'user:update:x_encoding:time': 0,
    'user:update:y_encoding:quantitative': 1,
    'user:update:category_encoding:nominal': 2,
    'user:update:filter:category_filter': 3,
    'user:update:chart_type:point': 4,
    'user:update:chart_type:line': 5,
    'user:update:x_encoding:nominal': 6,
    'user:update:chart_type:bar': 7,
    'user:update:aggregate:y_aggregate': 8,
    'user:update:filter:x_filter': 9,
    'user:update:x_encoding:quantitative': 10,
    'user:update:chart_type:tick': 11,
    'user:specify:alternative encoding': 12,
    'user:specify:same': 13,
    'user:update:y_encoding:nominal': 14,
    'user:specify:summary': 15,
    'user:update:y_encoding:time': 16,
    'user:update:category_encoding:quantitative': 17,
    'user:update:category_encoding:time': 18,
    'user:update:category_encoding:None': 19,
    'user:update:filter:y_filter': 20,
    'user:update:y_encoding:None': 21,
    'user:update:chart_type:None': 22,
    'user:update:aggregate:x_aggregate': 23,
    'user:specify:collection': 24,
    'user:specify:collection': 24,
    'user:reset:query': 25,
    'user:control:undo': 26,
    'user:update:aggregate:category_aggregate': 27,
    'user:update:x_encoding:None': 28,
    'user:specify:add field': 29
}
const B = 2 ** 11;


function calPredicts(p, b, h, opts = {}) {
    // p: current model output, Object[task]=Array, valur=[0,1]
    // b: custom setting for tasks, Object[task]=[-inf,+inf]
    // h: history state, Object[task]=[-inf, +inf]
    // a: alpha to control prefer history or current output, [0-1]
    // output: h(t)=b*(h(t-1)*a+p(t)*(1-a))
    const {
        a = 0.5,
            mode = "history",
            agg_func = x => Math.max(...x),
            clamp = false
    } = opts
    const ht = {}
        // console.log(h)
    for (const task in p) {
        // if (mode == "bypass") {
        //     ht[task]=_.clamp(h[task],0,1);
        // }
        // else{
        //     ht[task] = b[task] * ((h[task]) * a + agg_func(p[task]) * (1 - a));
        //     if (mode == "predict") {
        //         ht[task] = _.clamp(ht[task], 0, 1);
        //     }
        // }
        // ht[task] = b[task] * ((h[task]) * a + agg_func(p[task]) * (1 - a));
        ht[task] = ((h[task]) * a + agg_func(p[task]) * (1 - a));

        if (clamp) {
            ht[task] = _.clamp(ht[task], 0, 1);
        }


    }
    // h=ht;

    return ht;
}

function punishTask(b, h, t, punish = 0) {
    b[t] = punish;
}

function addTask(b, task) {
    b[task] *= 1.1;
}

function initHistory(tasks = DEFAULT_TASKS, value = 0) {
    const res = {};
    for (const t of tasks) {
        res[t] = value;
    }
    return res;
}

function initCustom(tasks = DEFAULT_TASKS, value = 1) {
    const res = {};
    for (const t of tasks) {
        res[t] = value;
    }
    return res;
}

function getChart(chartId, weightW) {
    return weightW[chartId];
}

export const TaskStore = defineStore({
    id: "TaskStore",
    state: () => {
        const history = initHistory();
        const customs = initCustom();
        return {
            history,
            customs,
            predicts: [initHistory()],
            alpha: 0.5,
            // i:0
        };
    },
    getters: {
        // current_output:(state)=>{
        //     return state.predicts.slice(-(DEFAULT_TASKS.length));
        // },
        activate_task: (state) => {
            if (state.predicts.length === 0) return [];
            const pre = state.predicts.slice(-1)[0];

            return _.toPairs(pre).map(item => {
                const [type, score] = item;
                return {
                    type,
                    // score: score * state.customs[type]
                    score,
                    customScore: state.customs[type]

                };
            }).filter(item => item.score > 0.5);

        }
    },
    actions: {
        async getPredicts(topic) {
            if (action2num[topic] == null) {
                // this.predicts=this.predicts.concat(
                //     calPredicts(
                //         this.history,
                //         initCustom(),
                //         this.history,
                //         { agg_func: x => x, clamp: true }
                //     )
                // );

                this.predicts.push(
                    this.predicts.slice(-1)[0]
                )
                return;
            }
            let res = await http.get("/api/action", {
                params: {
                    topic
                }
            })

            const modelOut = {};

            for (const item of res.data.value) {
                modelOut[item.type] = item.score

                // newHis[item.type]=calPredicts(item.score,initCustom(),this.history);
                // newPre[item.type] = Math.min(Math.max(calPredicts(item.score, initCustom(), this.history),0),1);

            }
            // console.log(modelOut)
            // const newI=this.i+1;
            const newHis = calPredicts(modelOut, this.customs, this.history);
            const newPre = calPredicts(
                modelOut,
                initCustom(),
                this.history, { clamp: true }
            );
            const newPredicts = this.predicts.concat(newPre);
            this.$patch({
                    history: newHis,
                    predicts: newPredicts
                })
                // this.predicts=newPredicts;

        },
        punishTask(t) {
            this.history[t] = -B;
            let newPre = calPredicts(
                this.history,
                this.customs,
                this.history, { agg_func: x => x, clamp: true }
            );
            this.predicts.push(newPre);
        },
        addTask(t) {
            this.history[t] = B;
            let newPre = calPredicts(
                this.history,
                this.customs,
                this.history, { agg_func: x => x, clamp: true }
            );
            this.predicts.push(newPre);
        }

    },

});