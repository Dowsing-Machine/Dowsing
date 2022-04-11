<template>
    <n-select :placeholder="label" :options="columns" clearable @update:value="handleUpdateValue" :value="value"></n-select>
</template>

<script setup>
import { computed, defineProps } from 'vue-demi';

import { NSelect } from 'naive-ui';

defineProps({
    label:String,
    columns:Array,
    value:String,
});

const emit=defineEmits({
    "update":null,
});

function handleUpdateValue(value){
    emit('update',value);
}
</script>