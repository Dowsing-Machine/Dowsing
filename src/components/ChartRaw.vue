<template>
    <div v-if="CollectionItem.isValid(vegalite)" ref="chartDiv" style="overflow:auto;"></div>
    <n-empty
        v-else
        size="large"
        description="You can edit encoding on data controller panel"
        class="h-1/1 justify-center text-center"
    >
        <template #icon>
            <BarChartRound />
        </template>
    </n-empty>
</template>
<script setup>
import { defineProps, onMounted, watch, ref, defineExpose, nextTick } from 'vue-demi';
import { NEmpty } from 'naive-ui';
import embed from 'vega-embed';

import { CollectionItem } from "@/store/CollectionStore";

import { DatasetStore } from '@/store/DatasetStore';
import { NScrollbar } from 'naive-ui';
import { QueryStore } from '../store/QueryStore';
import { defineEmits } from 'vue-demi';
import { BarChartRound } from "@vicons/material";

import _ from "lodash";

const emit = defineEmits(["addview"]);
const datasetStore = DatasetStore();
const queryStore = QueryStore();

const props = defineProps({
    vegalite: Object,
    renderOption: Object,
    replaceColor: {
        type: Boolean,
        default: false,
    },
});

const chartDiv = ref(null);

const view = ref(null)

async function refreshChart() {
    if (view.value) {
        view.value.finalize();
    }

    const encoding = _.cloneDeep(props.vegalite.encoding);

    let v = {
        ...props.vegalite,
        ...props.renderOption,
        data: {
            // name:"data"
            values: datasetStore.dataset
        },
        encoding,
        // "params": [{ "name": "brush", "select": "interval" }]
        // transform:queryStore.filter.filter(f=>f!=null).map(f=>({
        //     filter:{
        //         field:f.column,
        //         [f.predicate]:f.filter
        //     }
        // })),
    }

    if (props.replaceColor && v.encoding) {
        v.params = [{ "name": "brush", "select": "interval" }];
        v.encoding.color = {
            "condition": {
                "param": "brush",
                "aggregate": v.encoding?.color?.aggregate || v.encoding?.color?.condition?.aggregate,
                "field": v.encoding?.color?.field || v.encoding?.color?.condition?.field,
                "type": v.encoding?.color?.type || v.encoding?.color?.condition?.type,
            },
            "value": "#e0e0e055"
        };
    }

    v.$schema = "https://vega.github.io/schema/vega-lite/v5.json";
    await nextTick();

    if (chartDiv.value == null) {
        emit("addview", null);
        return;
    }
    let res = await embed(chartDiv.value, v, { actions: false });
    console.log("refresh", v);
    emit("addview", res.view);

    // res.view.insert("data", datasetStore.dataset).run();


}

onMounted(() => {
    refreshChart();
});

watch(() => props.vegalite, (newVal, oldVal) => {
    // console.log("props changed",newVal,oldVal);
    refreshChart();
}, { deep: false });

// watch(() => props.vegalite, (newVal, oldVal) => {
//     // console.log("props changed",newVal,oldVal);
//     refreshChart();
// }, { deep: true });

function resize() {
    if (view.value) {
        console.log("resize");
        view.value.resize().run();
        // refreshChart();
        // window.dispatchEvent(new Event('resize'))
    }
}

defineExpose({
    resize,
    refreshChart
});

</script>

<style scoped>
::-webkit-scrollbar {
    /* width:0; */
    /* position:absolute; */
}
</style>
