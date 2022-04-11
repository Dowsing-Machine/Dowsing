<template>
    <n-badge :value="collectionStore.collections.length" :max="15">
        <n-button text style="font-size: 28px;" @click="onClick">
            <n-icon>
                <board28-filled />
            </n-icon>
        </n-button>
    </n-badge>
    <n-modal 
        v-model:show="showCollection"
        @after-leave="onClose"
    >
        <n-card style="max-width:90vw;max-height:90vh;overflow:auto">
            <collection-charts-vue @close="showCollection=false"></collection-charts-vue>
        </n-card>
    </n-modal>
</template>

<script setup>
import { Board28Filled } from "@vicons/fluent"
import { NButton, NIcon, NBadge, NModal, NCard } from "naive-ui";
import { CollectionStore } from "../store/CollectionStore";
import CollectionChartsVue from "./CollectionCharts.vue";
import { ref, getCurrentInstance } from "vue";

const showCollection = ref(false)
const collectionStore = CollectionStore();
const { proxy } = getCurrentInstance();

function onClick() {
    showCollection.value = !showCollection.value;
    proxy.$EventBus.emit(`user:control:collectionPanel:${showCollection.value}`);
}


function onClose(){
    proxy.$EventBus.emit(`user:control:collectionPanel:${showCollection.value}`);
}
</script>
