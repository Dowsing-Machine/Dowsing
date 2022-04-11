<template>

<n-upload
    @change="handleChange"
    :show-file-list="false"
>
<n-button text style="font-size: 28px;">
    <n-icon>
        <Save16Filled></Save16Filled>
    </n-icon>
</n-button>
</n-upload>

</template>

<script setup>
import { NUpload,NButton,NIcon } from 'naive-ui';
import {Save16Filled} from "@vicons/fluent"
import {CollectionStore} from "@/store/CollectionStore";

const collectionStore = CollectionStore();

function handleChange(e) {
    // console.log(e);
    const fr=new FileReader();
    fr.onload=res=>{
        collectionStore.load(JSON.parse(res.target.result).finalState);
    };
    fr.readAsText(e.file.file);
}

</script>