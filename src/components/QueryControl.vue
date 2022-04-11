<template>
    <n-space vertical style="padding:12px 24px;" justify="space-between" class>
        <div class="flex flex-col">
            <div class="flex items-center">
                <div class="panel-subtitle">DATA CONTROLLER</div>
                <n-button @click="resetQuery()" size="tiny" color="#c4c4c488" text-color="black">
                    <n-icon>
                        <ArrowReset20Filled />
                    </n-icon>
                </n-button>
            </div>
            <hr class="border-0 w-1/1 mt-2 mb-2" />
            <n-space vertical ref="panel">
                <div v-if="controlStore.currentViewId == null" class="mask bg-white opacity-100">
                    <!-- <n-empty description="Add or select a chart to edit">

                    </n-empty>-->
                </div>

                <div class="flex flex-col">
                    <div class="font-semibold">Chart Type</div>
                    <n-select
                        class="mt-1"
                        :options="typeOption"
                        :value="queryStore.chart_type"
                        @update:value="updateChartType"
                        placeholder="Select..."
                        clearable
                    ></n-select>
                </div>
                <div class="flex flex-col">
                    <div class="font-semibold">X Encoding</div>
                    <encoding-embed-ctrl
                        class="mt-1"
                        :encoding="queryStore.x_encoding"
                        :aggregate="queryStore.x_aggregate"
                        :filter="x_filter"
                        @update:encoding="updateEncoding('x_encoding', $event)"
                        @update:filter="updateFilter('x_filter', queryStore.x_encoding, $event)"
                        @update:aggregate="updateAggregate('x_aggregate', $event)"
                        :columns="datasetStore.columns"
                    ></encoding-embed-ctrl>
                </div>
                <div class="flex flex-col">
                    <div class="font-semibold">Y Encoding</div>
                    <encoding-embed-ctrl
                        class="mt-1"
                        :encoding="queryStore.y_encoding"
                        :aggregate="queryStore.y_aggregate"
                        :filter="y_filter"
                        @update:encoding="updateEncoding('y_encoding', $event)"
                        @update:filter="updateFilter('y_filter', queryStore.y_encoding, $event)"
                        @update:aggregate="updateAggregate('y_aggregate', $event)"
                        :columns="datasetStore.columns"
                    ></encoding-embed-ctrl>
                </div>

                <div class="flex flex-col">
                    <div class="font-semibold">Color Encoding</div>
                    <encoding-embed-ctrl
                        class="mt-1"
                        :encoding="queryStore.category_encoding"
                        :aggregate="queryStore.category_aggregate"
                        :filter="category_filter"
                        @update:encoding="updateEncoding('category_encoding', $event)"
                        @update:filter="updateFilter('category_filter', queryStore.category_encoding, $event)"
                        @update:aggregate="updateAggregate('category_aggregate', $event)"
                        :columns="datasetStore.columns"
                    ></encoding-embed-ctrl>
                </div>

                <!-- <n-button type="error" size="small" style="width:100%" @click="resetQuery()">Clear</n-button> -->
            </n-space>
        </div>
        <!-- <n-divider></n-divider> -->
        <div class="flex flex-col">
            <div class="mt-5 flex items-center">
                <!-- <div class="panel-subtitle">PREFERENCE</div> -->
                <div class="panel-subtitle flex">
                    <div
                        :class="{ 'text-gray-400': !showTask }"
                        class="transition-colors duration-200 cursor-pointer"
                        @click="showTask = true"
                    >TASK</div>
                    <div class="mx-2"></div>
                    <div
                        class="transition-colors duration-200 cursor-pointer"
                        :class="{ 'text-gray-400': showTask }"
                        @click="showTask = false"
                    >COLUMNS</div>
                </div>

                <n-popover trigger="click" placement="right-start">
                    <template #trigger>
                        <n-button size="tiny" color="#c4c4c488" text-color="black">
                            <n-icon>
                                <Settings20Filled />
                            </n-icon>
                        </n-button>
                    </template>
                    <div class="flex flex-col">
                        <div class="font-bold border-b">Settings</div>
                        <div class="flex my-2">
                            <div class="flex-1 pr-2">Task-aware</div>
                            <n-switch size="small" v-model:value="controlStore.taskOn" />
                        </div>
                        <div class="flex my-2">
                            <div class="flex-1 pr-2">Column Interest</div>
                            <n-switch size="small" v-model:value="controlStore.poiOn" />
                        </div>
                        <div class="flex my-2">
                            <div class="flex-1 pr-2">Suggestion</div>
                            <n-switch size="small" v-model:value="controlStore.suggestionOn" />
                        </div>
                        <n-button class="w-1/1 my-2" size="tiny" @click="reset">Reset Model</n-button>
                    </div>
                </n-popover>
            </div>
            <hr class="border-0 w-1/1 mt-2 mb-2" />
            <transition name="slide-right">
                <div v-show="showTask">
                    <div v-if="controlStore.taskOn">
                        <div class="font-semibold mb-1">Task Types</div>
                        <task-legend-vue class="mb-1" />
                        <task-predict-vue></task-predict-vue>
                        <!-- <div class="flex mb-1">
                    <div class="font-semibold flex-1">Active Tasks</div>
                    <n-button size="tiny" color="#c4c4c488" text-color="black">
                        <n-icon>
                            <Add20Filled/>
                        </n-icon>
                    </n-button>
                        </div>-->
                        <task-tag-vue></task-tag-vue>
                    </div>
                    <n-empty v-else description="Task Aware disabled"></n-empty>
                </div>
            </transition>

            <div v-show="!showTask">
                <p-o-i v-show="controlStore.poiOn == true" />
                <n-empty v-show="controlStore.poiOn == null" description="No Significant Interest">
                    <div class="text-center">
                        <div>No Significant Interest</div>
                        <n-button
                            class="mt-1"
                            size="tiny"
                            @click="controlStore.poiOn = true"
                        >Open Anyway</n-button>
                    </div>
                </n-empty>
                <n-empty
                    v-show="controlStore.poiOn == false"
                    description="Column Interest Disabled"
                ></n-empty>
            </div>
            <!-- <div v-else>
                <p-o-i></p-o-i>
            </div>-->
            <!-- <n-tabs>
                <n-tab-pane name="Task">
                    <div class="mb-1 font-semibold">TYPE</div>
                    <task-legend-vue class="mb-1" />
                    <task-predict-vue></task-predict-vue>
                    <task-tag-vue></task-tag-vue>
                </n-tab-pane>
                <n-tab-pane name="Columns"></n-tab-pane>
            </n-tabs>-->
        </div>
    </n-space>
</template>

<script setup>
import { NSelect, NSpace, NButton, NTabs, NSwitch, NEmpty, NIcon, NPopover } from 'naive-ui';
import { computed, watch, getCurrentInstance } from 'vue-demi';

import { DatasetStore } from '../store/DatasetStore';
import { QueryStore } from '../store/QueryStore';

import { COUNT } from '../query';

import EncodingEmbedCtrl from "./EncodingEmbedCtrl.vue";
import { ref } from "vue";

import _ from "lodash";

import TaskPredictVue from './Task/TaskPredict.vue';
import TaskTagVue from "./Task/TaskTag.vue";
import POI from "./POI.vue";
import TaskLegendVue from './Task/TaskLegend.vue';
import { ControlStore } from '../store/ControlStore';
import { CollectionStore } from '../store/CollectionStore';
import { POIStore } from "../store/POIStore";
import { TaskStore } from "../store/TaskStore";

import { Settings20Filled, ArrowReset20Filled, Settings20Regular, Add20Filled } from "@vicons/fluent"
// import axios from 'axios';
import http from "@/utils/http";
import { useElementBounding } from '@vueuse/core'


const datasetStore = DatasetStore();
const queryStore = QueryStore();
const controlStore = ControlStore();
const collectionStore = CollectionStore();
const poiStore = POIStore();
const taskStore = TaskStore();

const { proxy } = getCurrentInstance();


const panel = ref(null);
const { width, height, top, right } = useElementBounding(panel);
const maskWidth = computed(() => `${width.value}px`);
const maskHeight = computed(() => `${height.value}px`);
const maskTop = computed(() => `${top.value}px`);
const maskRight = computed(() => `${right.value}px`);

const columnOptions = computed(() => {
    return datasetStore.columns.map(c => ({
        label: c.name,
        value: c.name,
    }));
});
const showTask = ref(true);

const typeOption = [
    // {
    //     label: "自动",
    //     value: null
    // },
    {
        label: "Bar",
        value: "bar"
    },
    {
        label: "Line",
        value: "line"
    },
    {
        label: "Scatter",
        value: "point",
    },
    // {
    //     label: "刻度图",
    //     value: "tick"
    // }
]


const x_filter = computed(() => {
    if (queryStore.x_encoding == COUNT) {
        return null;
    }

    return queryStore.getFilterByColumn(queryStore.x_encoding);
})

const y_filter = computed(() => {
    if (queryStore.x_encoding == COUNT) {
        return null;
    }
    return queryStore.getFilterByColumn(queryStore.y_encoding);
})

const category_filter = computed(() => {
    if (queryStore.x_encoding == COUNT) {
        return null;
    }
    return queryStore.getFilterByColumn(queryStore.category_encoding);
})

function updateEncoding(channel, encoding) {
    const enc = encoding?.encoding ?? 'None';
    let t = _.find(datasetStore.columns, column => column.name === enc)?.type;

    if (enc == "COUNT") {
        t = "quantitative";
    }
    const isDate = ["year", "date", "month", "day"].includes(enc.toLowerCase());
    if (isDate) {
        t = "time"
    }
    proxy.$EventBus.emit(`user:update:${channel}:${t}`, {
        channel,
        encoding: encoding?.encoding
    });
    if (t == "time") {
        t = "ordinal";
    }
    const old = queryStore[channel];

    queryStore.deleteFilterByColumn(old);

    queryStore.editEncoding(channel, encoding?.encoding);
    const i = controlStore.currentViewId;
    const chartIns = collectionStore.collections.find(c => c.id == i);

    const nowFilter = queryStore.filter.map(f => {
        return {
            "filter": {
                field: f.column,
                [f.predicate]: f.filter,
            }
        }
    });

    const newspec = chartIns?.spec;
    newspec.transform = nowFilter;

    // chartIns.changeSpec(newspec);

    console.log(chartIns.spec)
    if (chartIns == null) return;
    let chn = (channel.match(/(.*?)_encoding/) ?? [, "None"])[1];
    if (chn == "category") {
        chn = "color";
    }

    if (enc != "None") {
        const e = enc == "COUNT" ? {
            "aggregate": "count", "field": "*", "type": t, "bin": false,
        } : {
            "field": enc, "type": t, "aggregate": null, "bin": false
        }
        const newspec = _.merge({}, chartIns.spec, {
            encoding: { [chn]: e, "transform": null }
        });

        chartIns.changeSpec({
            ...newspec,

            "transform": nowFilter
        })
    }
    else {
        chartIns.mergeSpec({
            ...chartIns.spec,
            encoding: {
                ...chartIns.spec.encoding,
                [chn]: null
            },
            "transform": nowFilter
        })
    }
    console.log(chartIns.spec)
    if (encoding?.encoding != null)
        poiStore.updateColumn(encoding.encoding);


}

function updateFilter(channel, column, filter) {

    proxy.$EventBus.emit(`user:update:filter:${channel}`, {
        column,
        filter
    });
    queryStore.setFilterByColumn(column, filter);
    const i = controlStore.currentViewId;
    const chartIns = collectionStore.collections.find(c => c.id == i);

    if (chartIns == null) return;

    let chn = (channel.match(/(.*?)_encoding/) ?? [, "None"])[1];
    if (chn == "category") {
        chn = "color";
    }

    const nowFilter = queryStore.filter.map(f => {
        return {
            "filter": {
                field: f.column,
                [f.predicate]: f.filter,
            }
        }
    });
    const newspec = chartIns.spec;
    newspec.transform = nowFilter;
    ///////
    // chartIns.changeSpec(newspec);
    f(chartIns, nowFilter)
    // chartIns.mergeSpec({
    //     transform: nowFilter,
    // })

}

const f = _.debounce((chartIns, nowFilter) => {
    console.log(111)
    chartIns.mergeSpec({
        transform: nowFilter,
    })
}, 400, { "trailing": true })

function updateChartType(chart_type) {
    proxy.$EventBus.emit(`user:update:chart_type:${chart_type ?? 'None'}`, {
        chart_type
    });
    queryStore.chart_type = (chart_type);
    const i = controlStore.currentViewId;
    const chartIns = collectionStore.collections.find(c => c.id == i);
    if (chartIns == null) return;
    // if (chart_type == "bar") {
    //     chartIns.mergeSpec({
    //         mark: chart_type,
    //     })
    // }
    // else {
    //     chartIns.mergeSpec({
    //         mark: chart_type,
    //         encoding: {
    //             x: {
    //                 stack: null,
    //             },
    //             y: {
    //                 stack: null,
    //             },
    //             color: {
    //                 stack: null,
    //             },
    //         }
    //     })
    // }
    // chartIns.mergeSpec({
    //     mark: chart_type,
    //     encoding: {
    //         x: {
    //             stack: null,
    //             scale: {},
    //         },
    //         y: {
    //             scale: {},
    //             stack: null,
    //         },
    //         color: {
    //             scale: {},
    //             stack: null,
    //         },
    //     }
    // })
    chartIns.mergeSpec({
        mark: chart_type,
    })

}

function updateAggregate(channel, aggregate) {
    proxy.$EventBus.emit(`user:update:aggregate:${channel}`, {
        channel,
        aggregate
    });
    let chn = (channel.match(/(.*?)_aggregate/) ?? [, "None"])[1];
    const i = controlStore.currentViewId;
    const chartIns = collectionStore.collections.find(c => c.id == i);

    queryStore[channel] = aggregate;
    if (chn == "None") return;
    if (chn == "category") chn = "color";
    const newagg = aggregate == "bin" ? {
        "aggregate": null,
        "bin": true,
    } : {
        aggregate,
        "bin": false,
    }
    chartIns.mergeSpec({
        encoding: {
            [chn]: newagg
        }
    })


}

function resetQuery() {
    proxy.$EventBus.emit(`user:reset:query`);
    queryStore.$reset();
}

async function reset() {
    await http.get("/api/reset");
    taskStore.$reset();
    poiStore.$reset();
}
</script>

<style scoped>
.panel-subtitle {
    @apply font-bold text-lg flex-1 text-$title-color;
}

.mask {
    position: relative;
    width: 0px;
    height: 0px;
}
.mask::before {
    /* @apply bg-red-400 h-10 w-10; */
    @apply bg-white text-center text-color-[#c2c2c2] content-center
    display: block;
    position: absolute;
    /* top: v-bind(maskTop);
    right:v-bind(maskRight); */
    width: v-bind(maskWidth);
    height: v-bind(maskHeight);
    z-index: 99;
    content: "Add or select a chart to edit";
}

.slide-right-enter-activate,
.slide-right-leave-active {
    @apply transition-all duration-300
}

.slide-right-enter-from,
.slide-right-leave-to{
    @apply 
}

</style>