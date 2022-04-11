<template>
  <n-button size="tiny" @click="showFilter = !showFilter">Filter</n-button>
  <n-button size="tiny" @click="showAggregation = !showAggregation">Aggregation</n-button>
  <n-card v-if="showFilter" embedded style="position: absolute; z-index: 1">
    <n-space vertical>
      <n-slider v-model:value="value" range :step="1" />
      <n-input-number size="small" v-model:value="value[0]" />
      <n-input-number size="small" v-model:value="value[1]" />
    </n-space>
  </n-card>
  <n-card v-if="showAggregation" embedded style="position: absolute; z-index: 1">
    <n-select v-model:value="aggValue" :options="aggOptions" />
  </n-card>
</template>

<script setup>
import { ref } from 'vue'
import { NButton, NCard, NSlider, NSpace, NInputNumber, NModal, NSelect } from 'naive-ui';
const showFilter = ref(false)
const value = ref([0, 80])
const showAggregation = ref(false)
const aggValue = ref(null)
const aggOptions = ref([
  {label: 'count', value: 'count'},
  {label: 'sum', value: 'sum'},
  {label: 'min', value: 'min'},
  {label: 'max', value: 'max'},
  {label: 'mean', value: 'mean'},
  {label: 'median', value: 'median'},
  {label: '无', value: null}]
)
</script>

<style scoped>

</style>
