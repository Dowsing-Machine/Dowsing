<template>
    <n-layout
        class="h-screen max-h-screen"
        :content-style="{ display: 'flex', flexDirection: 'column' }"
    >
        <n-layout-header class="p-2 px-5 items-center bg-$primary-color">
            <n-space justify="space-between">
                <div style="font-size: 1.5em" class="text-light-50 text-shadow-lg font-bold">DOWSING</div>
                <div style="align-self: center;" class="h-1/1">
                    <n-space>
                        <!-- <download-button></download-button> -->

                        <dataset-select-vue></dataset-select-vue>
                        <!-- <collection-button></collection-button> -->
                        <!-- <log-upload-vue v-if="isDev"></log-upload-vue> -->
                    </n-space>
                </div>
            </n-space>
        </n-layout-header>
        <n-layout-content class="flex-1 overflow-hidden">
            <n-layout has-sider class="h-1/1">
                <n-layout-sider
                    bordered
                    width="300"
                    :class="{ 'shadow-left': recommendClosed }"
                    :native-scrollbar="false"
                >
                    <!-- <single-chart-edit></single-chart-edit> -->
                    <query-control-vue></query-control-vue>
                </n-layout-sider>
                <n-layout-content class="h-1/1">
                    <n-layout has-sider class="h-1/1">
                        <!-- <n-layout-header bordered>
                            <multi-view-ctrl></multi-view-ctrl>
                        </n-layout-header>-->
                        <n-layout-sider
                            @click="onClick"
                            bordered
                            width="300"
                            collapse-mode="transform"
                            :collapsed-width="0"
                            show-trigger="bar"
                            content-style="height:100%"
                            :native-scrollbar="true"
                            :default-collapsed="true"
                            v-model:collapsed="recommendClosed"
                            class="shadow-left"
                        >
                            <div class="flex flex-col px-3 pt-3 h-1/1">
                                <div class="font-bold text-lg pb-4 text-$title-color">SUGGESTIONS</div>
                                <!-- <hr class="border-0 w-1/1 mb-2 flex-1 shadow-lg transition-all duration-500" :class="{'shadow !border !border-1':!suggestHeadVisable}"/> -->

                                    <recommend-grid-vue 
                                    v-if="controlStore.suggestionOn"
                                    @update:head-visable="onHeadVisableChange" />

                                <n-empty v-else description="Suggestion disabled"></n-empty>
                            </div>
                        </n-layout-sider>
                        <n-layout-content
                            :content-style="{ display: 'flex', flexDirection: 'column' }"
                        >
                            <n-layout-header @click="onClick" class="bg-$light-primary-color">
                                <div class="flex items-center w-1/1 h-48px">
                                    <!-- <div class="flex-1 text-lg px-24px font-bold text-$title-color">CANVAS</div> -->
                                    <multi-view-ctrl></multi-view-ctrl>
                                </div>
                                <hr class="border-0 mx-24px" />
                            </n-layout-header>
                            <!-- <explore-panel-vue class="flex-1 h-1/1 overflow-auto"></explore-panel-vue> -->

                            <!-- <multi-view></multi-view> -->
                            <!-- <n-scrollbar
                                class="h-1/1 flex-1 bg-$embeded-bg-color "
                            > -->
                                <collection-charts-vue
                                    @click="onClick"
                                    class="h-1/1 flex-1 px-4 py-2 bg-$embeded-bg-color"
                                ></collection-charts-vue>
                            <!-- </n-scrollbar> -->

                            <div class="p-1 border-t shadow-up">
                                <n-button
                                    secondary
                                    size="tiny"
                                    class="w-1/1"
                                    @click.stop="showPast = !showPast"
                                    :disabled="controlStore.currentViewId == null"
                                >{{ !pastPanelOpen ? 'HISTORY ▲' : 'HISTORY ▼' }}</n-button>
                                <history-view-vue
                                    :vegalites="chartHistories"
                                    :show="pastPanelOpen"
                                    :selectId="controlStore.currentViewId"
                                />
                                <!-- <transition name="fade">
                                    <div class="h-50" v-show="pastPanelOpen">
                                        <history-view-vue
                                            :vegalites="chartHistories"
                                            :show="pastPanelOpen"
                                        />
                                    </div>
                                </transition>-->
                                <!-- <n-collapse-transition class="h-50" :show="pastPanelOpen" appear></n-collapse-transition> -->
                            </div>
                        </n-layout-content>
                    </n-layout>
                </n-layout-content>
            </n-layout>
        </n-layout-content>
    </n-layout>
</template>

<script setup>
import { NLayout, NLayoutHeader, NScrollbar, NLayoutSider, NLayoutContent, NSpace, NButton, NEmpty } from 'naive-ui';
// import DebugViewVue from '../components/DebugView.vue';
// import DataControl from "@/components/DataControl.vue";
// import SingleChartEdit from "@/components/SingleChartEdit.vue";
import QueryControlVue from '../components/QueryControl.vue';
// import MultiView from '../components/MultiView.vue';
import MultiViewCtrl from '../components/MultiViewCtrl.vue';
import DatasetSelectVue from '../components/DatasetSelect.vue';
// import Mention from '../components/Mention.vue'


import { ControlStore } from '../store/ControlStore';
// import ExplorePanelVue from '@/components/ExplorePanel.vue';

// import CollectionButton from '@/components/CollectionButton.vue';
import DownloadButton from "@/components/DownloadButton.vue";

// import logUploadVue from '../components/logUpload.vue';

import { computed, ref } from 'vue-demi';
import RecommendGridVue from '../components/Recommendation/RecommendGrid.vue';
import CollectionChartsVue from '../components/CollectionCharts.vue';

import { QueryStore, spec2query } from '../store/QueryStore';

import HistoryViewVue from '../components/History/HistoryView.vue';
import { CollectionStore, CollectionItem } from '../store/CollectionStore';

// import { useFps, useMemory } from "@vueuse/core";

const suggestHeadVisable = ref(true);
function onHeadVisableChange(val) {
    console.log("visable", val)
    suggestHeadVisable.value = val;
}

const showPast = ref(true);
const pastPanelOpen = computed(() => {
    console.log(controlStore.currentViewId)
    return (showPast.value == true) && (controlStore.currentViewId != null);
})


const controlStore = ControlStore();
const collectionStore = CollectionStore();
const queryStore = QueryStore();
const currentChart = computed(() => {
    return collectionStore.collections.find(c => c.id == controlStore.currentViewId);
});
const chartHistories = computed(() => {
    const res = [...(currentChart.value?.history ?? []), currentChart.value?.spec].filter(c => CollectionItem.isValid(c));
    // console.log(currentChart.value?.history,currentChart.value?.spec,res);
    return res;
});
const style = {
    header: {
        height: "64px",
        padding_y: "12px",
        padding_x: "24px",
    },
    footer: {
        height: "28px",
        padding_x: "24px",
        padding_y: "2px"
    },
};

const recommendClosed = ref(true);

function onClick() {
    controlStore.currentViewId = null;
    queryStore.$patch(spec2query({}));
}
</script>

<style scoped>
.main-header {
    height: v-bind("style.header.height");
    padding: v-bind("style.header.padding_y") v-bind("style.header.padding_x");
}

.main-footer {
    height: v-bind("style.footer.height");
    padding: v-bind("style.footer.padding_y") v-bind("style.footer.padding_x");
}

.main-middle {
    height: calc(
        100vh - v-bind("style.header.height") - v-bind("style.footer.height")
    );
}

.shadow-left {
    @apply shadow;
    --tw-shadow: 10px 0 15px -3px rgb(0 0 0/0.1), 4px 0 6px -4px rgb(0 0 0/0.1);
}

.shadow-up {
    @apply shadow;
    --tw-shadow: 0 10px 15px -3px rgb(0 0 0/0.1), 0 -4px 6px -4px rgb(0 0 0/0.1);
}
</style>
