<template>
    <div class="rounded-lg bg-$embeded-bg-color flex flex-wrap py-1">
        <div class="flex flex-nowrap items-center mx-2" v-for="task in tasks">
            <n-icon class="mr-1">
                <Circle20Filled :color="task[1].borderColor"/>
            </n-icon>
            <div class="text-xs">{{task[0]}}</div>
        </div>
    </div>
</template>

<script setup>
import { Circle20Filled } from "@vicons/fluent";
import { NIcon } from "naive-ui";
// import {computed} from "vue";
import _ from "lodash";
const color_mapping = {
    "transform": { textColor: "#72b7b2", borderColor: "#72b7b2", color: "#e3f1f0" },
    "correlation": { color: "#dbe4ee", borderColor: "#4c78a8", textColor: "#4c78a8" },
    "trend": { textColor: "#f58518", color: "#fde7d1", borderColor: "#f58518" },
    "compare": { borderColor: "#e45756", textColor: "#e45756", color: "#F8D4D4" },
    "confirm": { color: "#ddecdb", borderColor: "#54a24b", textColor: "#54a24b" },
    "others": { color: "#fcf4d8", borderColor: "#eeca3b", textColor: "#eeca3b" },
}
const tasks=_.toPairs(color_mapping);
</script>