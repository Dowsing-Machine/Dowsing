<template>
    <div ref="chart"></div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

import {newChart} from "./utils";
const props = defineProps({
    spec: Object,
    renderOption: {
        type: Object,
        default: () => ({ actions: false }),
    },
    data: Array,   //{"field":String,"value":Array}
    field: String,
});
let vl = null;
const chart = ref(null);

onMounted(async function () {
    vl = await newChart(chart.value,props.spec,props);
})

watch(() => props.data, () => {
    vl.view.data(props.field, props.data).run();
})

watch(() => props.spec, async function () {
    vl = await newChart(chart.value,props.spec,props);
})

</script>