<template>
    <chart-vl :spec="spec" :data="predicts" field="table"></chart-vl>
</template>

<script setup>
import ChartVl from "../Basic/ChartVL.vue";
import { TaskStore } from "../../store/TaskStore";
import { computed } from "vue";

import _ from "lodash";

const taskStore = TaskStore();


const spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "debug",
    "data": { "name": "table" },
    "mark": {
        "type": "line",
        "point": true
    },
    "encoding": {
        "x": { "field": "i" },
        "y": { "field": "score", "type": "quantitative" },
        "color": {
            "field": "type", "type": "nominal", "legend": {
                "values": ['数据转换', '关联', '关联（趋势）', '对比', '确认值', '聚类/异常'],
                "orient":"top",
                columns:3,
                disable:true
            }
        }
    },
}

const predicts = computed(() => {
    return _(taskStore.predicts).map((p, idx) => _.toPairs(p).map(i => ({
        i: idx,
        type: i[0],
        score: i[1],
    }))).slice(-10).flatten().value();
});
</script>