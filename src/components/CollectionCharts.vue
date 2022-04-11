<template>
    <n-scrollbar ref="scroll">
        <grid-layout
            :layout="SpecWithChart"
            :col-num="12"
            :row-height="150"
            :is-draggable="true"
            @layout-ready="onReady"
            @update:layout="onLayoutChange"
            :verticalCompact="false"
        >
            <grid-item
                v-for="(layout, idx) in SpecWithChart"
                :key="layout.i"
                :x="layout.x"
                :y="layout.y"
                :w="layout.w"
                :h="layout.h"
                :i="layout.i"
                drag-ignore-from=".dont_move"
                @resized="resizedEvent"
                @click.stop="onClickItem(layout)"
            >
                <n-card
                    style="height: 100%;width: 100%;"
                    :class="{ '!outline-$primary-color !outline-3': controlStore.currentViewId == layout.i }"
                    class="outline-none transition-all duration-300 border-3"
                >
                    <template #header>Chart#{{ layout.i }}</template>
                    <chart-raw
                        class="dont_move"
                        @addview="addviews($event, layout.i)"
                        :vegalite="layout.spec.spec"
                        :render-option="{
                            width: 'container', height: 'container',
                            autosize: {
                                type: 'fit',
                                contains: 'padding'
                            },
                            resize: true
                        }"
                        v-if="chart_enabled"
                        :ref="el => { if (el) charts[idx] = el }"
                        style="width:100%;height:100%"
                        :replaceColor="true"
                    ></chart-raw>
                </n-card>
            </grid-item>
        </grid-layout>
    </n-scrollbar>
</template>

<script setup>
import { NSpace, NCard, NScrollbar, NButton, NIcon, NPopover, NInput } from 'naive-ui';
import ChartRaw from './ChartRaw.vue';
import { CollectionStore } from '../store/CollectionStore';
import { ControlStore } from "../store/ControlStore";
import { computed, toRaw, ref, getCurrentInstance, nextTick, defineEmits } from "vue-demi";
import { onBeforeUpdate } from "vue";
import _ from "lodash";


import { QueryStore, spec2query } from '../store/QueryStore';


const collectionStore = CollectionStore();
const queryStore = QueryStore();
const controlStore = ControlStore();
const { proxy } = getCurrentInstance();

const emits = defineEmits(["close"]);

const chart_enabled = ref(true);

const scroll=ref(null);

function onClickItem(layout) {
    controlStore.currentViewId = layout.i;
    queryStore.$patch(spec2query(layout.spec.spec));
}

const SpecWithChart = computed(() => {
    let res = collectionStore.collections.map(collection => {
        // const strSpec = JSON.stringify(collection)
        // const id = collectionStore.specIds[strSpec];
        const id = collection.id;
        if (collectionStore.exists[id] == 1)
            return {
                spec: collection,
                // note: collectionStore.notes[strSpec],
                ...collectionStore.layouts.find(i => i.i === id),
            }
    })
    let res2 = [];
    for (let i = 0; i < res.length; i++) {
        if (res[i])
            res2.push(res[i])
    }
    // console.log(res2)
    return res2;
})

const charts = ref([]);

// const views = ref([]);
const views = ref({});

function onBrush(nowi) {
    console.log(111)
    let data = views.value[nowi].getState().data;
    for (let key in views.value) {
        // for(let key=0;key<views.value.length;key++){
        if(views.value[key]==null)continue;
        if (key != nowi) {
            views.value[key].setState({
                data: data,
                signals: views.value[key].getState().signals
            })
        }
    }
    console.log(views.value)
}
function clear(now) {

    for (let i = 0; i < viewscnt.value; i++) {
        if (i != now) {
            try {
                console.log(views.value[0]);
                let d = views.value[i].getState().data;
                let s = views.value[i].getState().signals;
                // s.brush={};
                // s.brush_tuple=null;
                s.brush_x = [];
                s.brush_y = [];
                views.value[i].setState({
                    data: d,
                    signals: s
                })
            }
            catch (err) {
                console.error('request error', err);
            }
        }
    }
}
async function addviews(v, i) {

    views.value[i] = v;
    // views.value.push(v)
    console.log(views.value);
    try {
        v.addSignalListener("brush",
            _.debounce(() => {
                onBrush(i);
            }, 500)
        )
    }
    catch(err){
        ;
    }
    // v.addEventListener("mouseup", () => {
    //   // if(checkfirst()==0)
    //   clear(viewscnt.value);
    // })
    // const b=useElementBounding(charts.value[i])
    // await nextTick();
    // console.log("addview",b.height.value,useElementBounding(charts.value[i]));
    // scroll.value?.scrollTo(0, b.height.value);
    scroll.value?.scrollTo({top:9999, behavior:"smooth"});
}


onBeforeUpdate(function () {
    charts.value = [];
})

function onResize(idx, event) {
    const { newH, newW, i } = event;
    const layout = collectionStore.layouts.findIndex(item => item.i === i);
    proxy.$EventBus.emit(`user:layout:resize:${idx}`, {
        block_val: event
    })
    if (layout >= 0) {
        collectionStore.layouts[layout].h = newH;
        collectionStore.layouts[layout].w = newW;
        // layout.h = newH;
        // layout.w = newW;
    }
    // updateLayout();
    // charts.value[idx].resize();
}

function onIdxResized(idx) {
    return (i, newH, newW) => {
        onResize(idx, { newH, newW, i })
    }
}


async function resizedEvent(i, newH, newW, newHPx, newWPx) {
    onResize(i, {
        newH,
        newW,
        i
    })
    chart_enabled.value = false;
    await nextTick();
    chart_enabled.value = true;
}

function onReady() {
    for (let chart of charts.value) {
        chart.refreshChart();
    }
}

function updateLayout(value) {
    console.log(value)
    proxy.$EventBus.emit("user:layout:update", {
        layout: value.map(i => ({
            i: i.i,
            x: i.x,
            y: i.y,
            w: i.w,
            h: i.h
        }))
    });
    collectionStore.layouts = value.map(i => ({
        i: i.i,
        x: i.x,
        y: i.y,
        w: i.w,
        h: i.h
    }));
}

const onLayoutChange = _.debounce(updateLayout, 500);

// const noteValue = computed(() => {
//   if(collectionStore.notes[JSON.stringify(props.vegalite)] != null){
//     return collectionStore.notes[JSON.stringify(props.vegalite)]
//   }
//   else{
//     return ''
//   }
// })

function addNote(spec, noteValue) {
    proxy.$EventBus.emit(`user:note:add`, {
        target: JSON.stringify({ ...spec, 'data': null }),
        note: noteValue,
    });
    const strSpec = JSON.stringify(spec);
    collectionStore.addNote(strSpec, noteValue);
}

function removeCollection(spec) {
    collectionStore.remove(spec);
}

function onToggle(spec) {
    proxy.$EventBus.emit("user:control:note:toggle", {
        target: spec,
        insideCollection: true
    });
}

function specify(spec) {
    proxy.$EventBus.emit("user:specify:collection", {
        vegalite: spec,
        from: "collection"
    })
    queryStore.$patch(spec2query(spec));
    emits("close");
}
</script>

<style>
.vue-grid-item.vue-grid-placeholder {
    background: var(--light-primary-color) !important;
}
</style>