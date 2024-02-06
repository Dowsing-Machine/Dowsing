<template>
    <n-button text style="font-size: 28px;" @click="showDatasetDialog = true">
        <n-icon color="#b2caec">
            <database24-filled></database24-filled>
        </n-icon>
    </n-button>
    <n-modal
        :show="showDatasetDialog"
        @update-show="showDatasetDialog = $event"
        :mask-closable="datasetReady"
        :auto-focus="false"
    >
        <n-card class="max-w-1000px min-w-300px">
            <div class="text-lg font-bold mb-4">DATASETS</div>
            <n-button-group>
                <n-button 
                    @click="loadDataset('/datasets/weather.json')"
                    :color="datasetStore.name=='weather.json'?'#0051c2':null"
                >
                    Weather
                </n-button>
                <n-button 
                    @click="loadDataset('/datasets/penguins.json')"
                    :color="datasetStore.name=='penguins.json'?'#0051c2':null"
                >Penguins</n-button>
                <n-button 
                    @click="loadDataset('/datasets/cars_copy.json')"
                    :color="datasetStore.name=='cars_copy.json'?'#0051c2':null"
                >Cars</n-button>
                <n-button 
                    @click="loadDataset('/datasets/birdstrikes-lite.json')"
                    :color="datasetStore.name=='birdstrikes-lite.json'?'#0051c2':null"
                >Birdstrikes</n-button>
                <n-button 
                    @click="loadDataset('/datasets/gapminder-lite.json')"
                    :color="datasetStore.name=='gapminder-lite.json'?'#0051c2':null"
                >Gapminder</n-button>
                <n-button 
                    @click="loadDataset('/datasets/movies.json')"
                    :color="datasetStore.name=='movies.json'?'#0051c2':null"
                >Movies</n-button>
            </n-button-group>
            <n-divider class="mx-4" :vertical="true"></n-divider>
            <n-upload abstract @change="handleUpload">
                <n-upload-trigger #="{ handleClick }" abstract>
                    <n-button 
                        @click="handleClick"
                        :color="datasetStore.name=='custom'?'#0051c2':null"
                    >Upload</n-button>
                </n-upload-trigger>
            </n-upload>
            <n-data-table
                :data="datasetStore.dataset"
                :columns="columns"
                class="my-2 max-h-300px overflow-auto"
                virtual-scroll
                :max-height="200"
                size="small"
            >
                <template #empty>
                    <n-empty description="No Data"></n-empty>
                </template>
            </n-data-table>
            <n-button 
                type="primary" 
                @click="showDatasetDialog=false"
                :disabled="!datasetReady"
            >Confirm</n-button>
        </n-card>
    </n-modal>
</template>

<script setup>
import { NButton, NIcon, NModal, NCard, NSpace, NButtonGroup, NH3, NDivider, NInput, useMessage, NDataTable, NEmpty, NUpload, NUploadTrigger } from "naive-ui";
import { Database24Filled } from "@vicons/fluent"
import { ref, getCurrentInstance, computed } from "vue";

import { DatasetStore } from "../store/DatasetStore";
import { ControlStore } from "../store/ControlStore";
import { CollectionStore } from "../store/CollectionStore";
import { TaskStore } from "../store/TaskStore";
import { POIStore } from "../store/POIStore";
import _ from "lodash";
// import {computed} from "vue";
// import axios from "axios";
import http from "@/utils/http";
import { parseFile, getMeta } from "../utils/upload";

const datasetStore = DatasetStore();
const controlStore = ControlStore();
const collectionStore = CollectionStore();
const taskStore = TaskStore();
const poiStore = POIStore();

const datasetReady = computed(() => {
    return datasetStore.dataset.length > 0;
})

const showDatasetDialog = ref(true);
const { proxy } = getCurrentInstance();
const message = useMessage()

async function reset() {
    await http.get("/api/reset");
    taskStore.$reset();
    poiStore.$reset();
}

async function loadDataset(url) {
    proxy.$EventBus.emit(
        `user:dataset:load:${url}`,
        {
            url
        }
    );
    try {
        await datasetStore.loadDataset(url);
        // showDatasetDialog.value = false;
        collectionStore.$reset();
        message.success(`Successfully load dataset ${datasetStore.name}`);
        reset();
    } catch (error) {
        message.error("可能是网络开小差了~");
    }

}

const columns = computed(() => {
    return datasetStore.columns.map(i => ({
        // title:_.truncate(i.name,{
        //     length:5
        // }),
        title: i.name,
        key: i.name,
        sorter: 'default',
        ellipsis: {
            tooltip: true
        },
    }))
})

function handleUpload({file, event}) {
    event.preventDefault();
    datasetStore.loadUploadedDataset(file.file);
}

</script>