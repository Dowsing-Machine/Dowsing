<template>
    <div ref="chart"></div>
    
</template>
<script setup>
import ChartVl from "./Basic/ChartVL.vue";
import { POIStore } from "../store/POIStore";
import { DatasetStore } from "../store/DatasetStore";
import {ControlStore} from "../store/ControlStore";
import { computed, reactive, ref, watchEffect, onMounted, watch } from "vue";

import _, { round } from "lodash";
import { newChart } from "./Basic/utils";
import { jStat } from "jstat";

const poiStore = POIStore();
const datasetStore = DatasetStore();
const controlStore = ControlStore();

const prob=computed(()=>{
    const s = _.sumBy(poiStore.column, i => i.cnt);
    const l = datasetStore.columns.length;
    // if(s<5*l || s<40){
    //     return 1;
    // }
    const obs = _(datasetStore.columns).map(i => ({
        col: i.name,
        cnt: 0
    })).value();
    for (const c of poiStore.column) {
        const col = obs.find(i => i.col == c.col);
        col.cnt = c.cnt;
    }
    const t = _.ceil(s / l);
    const chi = _(obs).map(i => {
        const a = i.cnt;
        return (a - t) * (a - t) / t;
    }).sum();
    return 1-jStat.chisquare.cdf(chi, l - 1);
})

watch(prob,()=>{
    console.log("column poi",prob.value);
    if(controlStore.poiOn==null&&prob.value<0.1){
        controlStore.poiOn=true;
    }
});

let vl = null;
const chart = ref(null);
const spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "debug",
    "data": { "name": "table" },
    "mark": {
        "type": "bar"
    },
    "encoding": {
        "x": { "field": "col" },
        "y": { "field": "cnt", "type": "quantitative" }

    }
}

onMounted(async function () {
    vl = await newChart(chart.value, spec, {renderOption:{ actions: false }});

    vl.view.data("table", poiStore.column).run();
})

watch(() => poiStore.column, async function () {
    console.log(poiStore.column)
    vl = await newChart(chart.value, spec, {renderOption:{ actions: false }});
    vl.view.data("table", poiStore.column).run();
}, { deep: true })

</script>