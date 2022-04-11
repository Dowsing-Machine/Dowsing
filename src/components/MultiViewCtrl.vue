<template>
    <n-menu 
        :options="options" 
        mode="horizontal" 
        @update:value="handleUpdate" 
        :value="null"
        :theme-overrides="styleOverride"
    />
</template>
<script setup>
import { NMenu, NIcon, NSpace, NButton } from 'naive-ui';
import { Add20Filled, ArrowUndo20Filled, ArrowRedo20Filled, Delete20Filled } from "@vicons/fluent";
import { computed, h } from 'vue-demi';
import { ControlStore } from '../store/ControlStore';

import { getCurrentInstance } from 'vue-demi';
import { CollectionStore } from '../store/CollectionStore';


const controlStore = ControlStore();
const collectionStore = CollectionStore();

const { proxy } = getCurrentInstance();

const styleOverride={
    itemTextColor:"#dfe9f7",
    itemIconColor:"#dfe9f7",
    itemIconColorHover:"#FFF",
    itemTextColorHover:"#FFF",
}

const options = computed(() => ([
    {
        label: "Add",
        key: "add",
        icon: () => h(
            NIcon,
            null,
            { default: () => h(Add20Filled) }
        )
    },
    {
        label: "Delete",
        key: "delete",
        icon: () => h(
            NIcon,
            null,
            { default: () => h(Delete20Filled) }
        ),
        disabled: controlStore.currentViewId == null,
    },
    {
        label: "Undo",
        key: "undo",
        icon: () => h(
            NIcon,
            null,
            { default: () => h(ArrowUndo20Filled) }
        )
    },
    {
        label: "Redo",
        key: "redo",
        icon: () => h(
            NIcon,
            null,
            { default: () => h(ArrowRedo20Filled) }
        )
    },
]))


const handleUpdate = (key) => {
    switch (key) {
        case "add":
            // .addView();
            collectionStore.add({});
            break;
        case "undo":
            proxy.$EventBus.emit("user:control:undo")
            collectionStore.undo();
            break;
        case "redo":
            proxy.$EventBus.emit("user:control:redo")
            collectionStore.redo();
            break;
        case "delete":
            collectionStore.delete(controlStore.currentViewId);
            break;
    }
}

</script>