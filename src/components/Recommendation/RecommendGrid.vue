<template>
    <n-scrollbar ref="scroll">
        <n-space vertical>
            <n-card v-for="vl, i in vls" class="h-50 w-1/1" :title="`Suggestion#${i}`">
                <chart-raw-vue
                    :vegalite="vl"
                    :render-option="{
                        height: 'container',
                        width: 'container',
                        autosize: {
                            type: 'fit',
                            contains: 'padding'
                        },
                        resize: true,
                        config: {
                            legend: {
                    
                                titleLimit: 50,
                                labelLimit: 30,
                                symbolLimit: 5
                            },
                            axis: {
                                ticks: true,
                                labelOverlap: true
                            }
                        }
                    }"
                    class="h-1/1 w-1/1"
                    :replaceColor="false"
                ></chart-raw-vue>
                <template #header-extra>
                    <n-button text class="header_button" @click="addCollection(vl)">
                        <n-icon>
                            <!-- <comment-note24-regular /> -->
                            <add20-filled></add20-filled>
                        </n-icon>
                    </n-button>
                </template>
            </n-card>
        </n-space>
    </n-scrollbar>
</template>
<script setup>
import ChartVLVue from '../Basic/ChartVL.vue';
import ChartRawVue from "../ChartRaw.vue"
import { NCard, NButton, NIcon, NScrollbar } from 'naive-ui';
import _ from "lodash";
import { onMounted } from "vue";
import { DatasetStore } from '../../store/DatasetStore';
import { CollectionStore } from '../../store/CollectionStore';
import { TaskStore } from '../../store/TaskStore';

import Draco from "draco-vis";
import * as DracoCore from "draco-vis";
import { computed, ref, watch, getCurrentInstance } from 'vue';
import { Add20Filled } from "@vicons/fluent";

import { ControlStore } from '../../store/ControlStore';
import { POIStore } from "../../store/POIStore";

import { NSpace } from 'naive-ui';


import DracoWorker from "../../utils/dracoWorker?worker";
import weights_learned from "./weights_learned.json";

// import { useIntersectionObserver } from '@vueuse/core'

// const emits = defineEmits(["update:headVisable"]);
// const head = ref(null);
// useIntersectionObserver(
//     head,
//     ([{ isIntersecting }]) => {
//         // isVisible.value = isIntersecting
//         emits("update:headVisable", isIntersecting);
//     },
// )
const draco = new Draco();
const datasetStore = DatasetStore();
const taskStore = TaskStore();
const collectionStore = CollectionStore();
const poiStore = POIStore();
const controlStore = ControlStore();


const scroll = ref(null);
const { proxy } = getCurrentInstance();


const dracoWorker = new DracoWorker();
dracoWorker.onmessage = function (e) {
    console.log("dracoWorker", e.data);
    res.value = e.data;
}

const hard_programs = [
    ":- not mark(point); not mark(bar); not mark(line).",
    // "task(summary) :- utask(transform).",
    ":- not channel(_,x); not channel(_,y); not channel(_,color).",
    // ":- channel(_,shape).",
    ":- channel(_,size).",
    ":- channel(_,shape).",
    ":- channel(_,detail).",
    ":- channel(_,text).",
    ":- channel(_,row).",
    ":- channel(_,column).",
    // "encoding(e0).",
    // ":- not field(e0,_).",
    // "encoding(e1).",
    // ":- not field(e1,_).",
    ":- not {encoding(_)}>=2.",
    // ":- channel(E,x;y), not {field(_,_)}>=2.",

    // "encoding(e2).",
    // ":- field(e2,_).",
    // `data("${datasetStore.name}").`,
    ":- {aggregate(_, _)}>=2.",
    ":- utask(trend), not channel(_,y).",
    ":- utask(trend), bin(_,_).",
    // ":- utask(trend), not channel(_,y).",
    // ":- utask(trend), channel(E,y), not aggregate(E, mean).",
    // ":- utask(trend), channel(E,x), aggregate(E, _).",
    // ":- aggregate(_,count).",
    // ":- utask(trend), x_y_cardinality().",
    ":- utask(transform), not aggregate(_, mean); not aggregate(_, count).",
    // ":- not utask(transform), aggregate(E, mean).",
    ":-  aggregate(_,_), not aggregate(_,count); not aggregate(_,mean).",
    ':- field(_,"date").',
    ":- utask(trend), channel(E,x), zero(E)."

]

const task_asps = [
    "soft(confirm_mark):- utask(confirm), not mark(line).",
    "soft(correlation_mark):- utask(correlation), mark(point).",
    "soft(trend_mark1):- utask(trend), mark(bar).",
    "soft(trend_mark2):- utask(trend), mark(line).",

    // "task(summary) :- utask(transform).",
    // "soft(compare_color):- utask(transform), encoding(E), channel(E,color).",

    'soft(trend_aggregate_x):- utask(trend), encoding(E), channel(E,x),not aggregate(E,_).',
    'soft(trend_x_temporal):- utask(trend), encoding(E), field(E,F), fieldtype(F,datetime), channel(E,x).',
    'soft(correlation_x_quantitative):- utask(correlation), encoding(E), field(E,F), field_type(F,number), channel(E,x).',
    "soft(transform_aggregate_y):- utask(transform), encoding(E), channel(E,y), aggregate(E,_).",
    "soft(trend_aggregrate):- utask(trend), encoding(E), channel(E,y), aggregate(E,_).",
    // "soft(encoding_num):- {encoding(_)}>2.",
    "soft(compare_encoding_num):- utask(compare), {encoding(_)}>2.",
    // "soft(allTask_count):- aggregate(_,count).",
    // "soft(transform_aggregate_count):- utask(transform), encoding(E), aggregate(E,count).",
    "soft(transform_aggregate_mean):- utask(transform), aggregate(_,mean).",
    "soft(compare_field_num):- utask(compare), {field(_,_)}>2.",
    "soft(transform_field_num):- utask(transform), {field(_,_)}>=2.",
    "soft(compare_mark):- utask(compare), mark(point).",
    "soft(allTask_bar):- mark(bar), aggregate(_,_).",
]

const task_weights = {
    // 'confirm_mark': 490,
    // 'correlation_mark': 120,
    // 'trend_mark': 463,
    // 'transform_aggregate_y': 874,
    // // 'transform_aggregate_color': 512,
    // 'trend_aggregate_x': 0,
    // 'trend_x_temporal': 747,
    // 'correlation_x_quantitative': 902
    'correlation_type': -100,
    'confirm_mark': -297,
    'correlation_mark': -110,
    'trend_mark1': -223,
    'trend_mark2': -300,

    'transform_aggregate_y': 0,
    // 'transform_aggregate_count': 100,
    'transform_aggregate_mean': -1,
    // 'transform_aggregate_color': 512,
    'trend_aggregate_x': -98,
    'trend_x_temporal': -265,
    'correlation_x_quantitative': -331,
    "trend_aggregrate": -100,
    "compare_encoding_num": -100,

    // "allTask_count": 80000,
    'transform_field_num': -20,
    "compare_mark": 10,
    "compare_field_num": -10,
    "allTask_bar": -10,
}
const task_map = {
    "数据转换": "transform",
    "确认值": "confirm",
    "关联": "correlation",
    "关联（趋势）": "trend",
    "对比": "compare",
    "聚类/异常": "other",
}

const re_task_names = new RegExp(`(${Object.values(task_map).join('|')})`);

const soft = _.clone(draco.soft);
let inited = false;

draco.init().then(() => {
    //   initeded.value = true;
    //   for (const asp of task_asps) {
    //     const name = asp.match(/soft\((.*?)\)/)[1];
    //     const weight = task_weights[name];
    //     draco.soft.push({
    //       name, weight, asp, description: "test", type: "soft"
    //     });
    inited = true;
    //   }
});

const res = ref({});

function calAvg(columns) {
    const s = _.sumBy(columns, i => i.cnt);
    return columns.map(i => ({
        ...i,
        cnt: i.cnt / s
    }));
}

function refreshRecommend() {
    const dataSchema = DracoCore.data2schema(datasetStore.dataset);
    for (const col in dataSchema.stats) {
        const isDate = ["year", "date", "month", "day"].includes(col.toLowerCase());
        if (isDate) {
            dataSchema.stats[col].type = 'datetime';
        }
    }
    const dataASP = DracoCore.schema2asp(dataSchema);
    console.log(dataASP);
    const tasks = taskStore.activate_task.filter(item => item.customScore > 0.5);

    let taskFASPs = tasks.map(i => `utask(${task_map[i.type]}).`);
    let task_weights_available = [];
    if (tasks.length > 0) {
        const re = new RegExp(_.concat(tasks.map(i => task_map[i.type]), "allTask").join('|'));
        // console.log(re);
        // const re = new RegExp(tasks.map(i => i.type).join('|'));
        task_weights_available = task_asps.filter(i => re.test(i)).map(i => {
            const name = i.match(/soft\((.*?)\)/)[1];
            const short_name = (name.match(re_task_names) ?? [, "allTask"])[1];
            const task = tasks.find(j => task_map[j.type] == short_name);
            if (task == null) {
                console.error(`task ${short_name} not found`, name, i, tasks);
            }
            const weight = Math.round(task_weights[name] * (task?.score ?? 1));
            return {
                name, weight, asp: i, description: "test", type: "soft"
            };
        });
    }

    const columns = calAvg(poiStore.column);
    let poiWeights = columns.map(c => ({
        name: c.col.toLowerCase(),
        weight: _.round(c.cnt * -100),
        asp: `soft(${c.col.toLowerCase()}):-field(_,"${c.col}").`,
        description: "test", type: "soft"
    }))
    if (controlStore.poiOn != true) {
        poiWeights = [];
    }
    const softW = [
        // ...soft.map(i => ({
        //     ...i,
        //     weight: weights_learned[i.name]
        // })),
        ...soft.map(i => {
            if (i.name == "aggregate_count" || i.name == "aggregate_mean") {
                return {
                    ...i,
                    weight: 0
                }
            }
            else {
                return i
            }
        }),
        // ...soft,
        ...task_weights_available,
        ...poiWeights
    ];
    console.log("softW", softW, dataASP);
    const weight_assign = task_weights_available.map(i => `soft_weight(${i.name},${i.weight}).`)
    draco.soft = softW;
    if (!controlStore.taskOn) {
        taskFASPs = [];
    }
    const program = [
        ...dataASP,
        ...taskFASPs,
        ...weight_assign,
        ...hard_programs,
    ].join("\n");
    console.log("program", program);
    // res.value = draco.solve(program, { models: 10 }) ?? {};
    dracoWorker.postMessage({
        program,
        typs: "solve",
        softW,
    });
}

watch(() => taskStore.activate_task.filter(item => item.customScore > 0.5), (newVal, oldVal) => {
    // console.log(newVal, oldVal);
    let equal = true;
    if (newVal.length != oldVal.length) {
        equal = false;
    }
    else {
        for (const i in newVal) {
            const v1 = newVal[i];
            const v2 = oldVal[i];
            if (v2 == null) {
                equal = false;
                break;
            }
            if ((v1.type === v2.type) && (Math.round(v1.score, 3) == Math.round(v2.score, 3))) {
                continue;
            }
        }
    }

    if (equal) return;
    if (!inited) return;
    const tsL = taskStore.predicts.length;
    if (tsL == 0) return;
    // console.log('predicts changed');
    refreshRecommend();
})

watch(
    [() => controlStore.taskOn, () => controlStore.poiOn, () => datasetStore.dataset],
    refreshRecommend
);

function translateEncoding(channels, encoding) {
    for (const channel of channels) {

        if (encoding[channel] == null) {
            continue;
        }
        console.log(channel, encoding[channel]);
        if (encoding[channel].type == "temporal") {
            encoding[channel].type = "ordinal";
        }
        else if (encoding[channel].type == "ordinal") {
            encoding[channel].type = "nominal";
        }

    }
    return encoding;
}

const vls = computed(() => {
    if (res.value == null) return [];
    const s = new Set();
    const vls = [];
    for (const vl of res.value?.specs ?? []) {
        const x_enc = vl.encoding?.x?.field;
        const y_enc = vl.encoding?.y?.field;
        const c_enc = vl.encoding?.color?.field;
        const x_agg = vl.encoding?.x?.aggregate;
        const y_agg = vl.encoding?.y?.aggregate;
        const c_agg = vl.encoding?.color?.aggregate;
        const x_bin = vl.encoding?.x?.bin;
        const y_bin = vl.encoding?.y?.bin;
        const c_bin = vl.encoding?.color?.bin;
        const m = vl.marl;
        const key = [x_enc, y_enc, c_enc, x_agg, y_agg, c_agg, x_bin, y_bin, c_bin, m].join("|");
        console.log(key)
        if (s.has(key)) {
            continue;
        }
        else {
            s.add(key);
            vls.push(vl);
        }
    }
    return (vls).map(i => ({
        ...i,
        data: {
            values: datasetStore.dataset,
        },
        encoding: translateEncoding(["x", "y", "color"], i.encoding),
    }))
})

watch(vls,()=>{
    scroll.value?.scrollTo({top:0, behavior: 'smooth'})
})

function addCollection(spec) {

    if (spec.encoding?.x?.field != null) poiStore.updateColumn(spec.encoding.x.field);
    if (spec.encoding?.y?.field != null) poiStore.updateColumn(spec.encoding.y.field);
    if (spec.encoding?.color?.field != null) poiStore.updateColumn(spec.encoding.color.field);

    proxy.$EventBus.emit(`user:collection:add`, {
        vegalite: spec,
    });
    collectionStore.add(spec);
}

onMounted(refreshRecommend);
</script>