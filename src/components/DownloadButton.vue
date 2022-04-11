<template>
  <n-popconfirm v-model:show="show" :show-icon="false">
    <template #trigger>
      <n-badge :value="errorList.length" type="error">
        <n-spin v-if="sending" size="small" />
        <n-button v-else text style="font-size: 28px;">
          <n-icon>
            <error-circle24-filled v-if="isError" color="#d03050"></error-circle24-filled>
            <arrow-upload16-filled v-else />
          </n-icon>
        </n-button>
      </n-badge>
    </template>
    <n-space vertical>
      <div>发送当前日志</div>
      <n-input type="textarea" placeholder="您可以做些备注" v-model:value="comment"></n-input>
      <div v-if="isError">刚才传输出现了错误，点击按钮可以重新发送~</div>
    </n-space>
    <template #action>
      <n-button size="small" type="warning" v-if="isDev" @click="saveActionList">下载</n-button>
      <n-button size="small" type="error" v-if="isError" @click="onResend">重发日志</n-button>
      <n-button size="small" type="success" @click="saveActionList(false, true)">发送日志</n-button>
    </template>
  </n-popconfirm>
</template>

<script setup>
import { ArrowUpload16Filled, ErrorCircle24Filled } from "@vicons/fluent"
import { NButton, NIcon, NBadge, NModal, NCard, NSpin, NPopconfirm, NInput, NSpace } from "naive-ui";
import { CollectionStore } from "../store/CollectionStore";
import CollectionChartsVue from "./CollectionCharts.vue";
import { QueryStore } from "../store/QueryStore"
import { ControlStore } from "../store/ControlStore";
import { DatasetStore } from "../store/DatasetStore";
import { TaskStore } from "../store/TaskStore";
import { watch, ref, getCurrentInstance, onBeforeUnmount, computed } from "vue";

import _ from "lodash"
import { saveAs } from 'file-saver';



// import axios from "axios";

const collectionStore = CollectionStore();
const queryStore = QueryStore();
const controlStore = ControlStore();
const datasetStore = DatasetStore();
const taskStore = TaskStore();

const { proxy } = getCurrentInstance();

const actionList = []
const actionSepts = []
const errorList = ref([])
const isError = computed(() => errorList.value.length > 0)
const show = ref(false);
const isDev = computed(() => import.meta.env.DEV)



const uploadURL = "https://dowsing-1254359329.cos.ap-chengdu.myqcloud.com";

let outputFilename = 'user_actions.json';

const sending = ref(false);
const comment = ref("");

function setSendingToFalse() {
  sending.value = false;
}

const setFalse = _.debounce(setSendingToFalse, 1000);

async function resendLog() {
  errorList.value.forEach(log => sendLog(log.log, `${log.topic}.recover`, log.time))
  errorList.value = [];
}

async function sendLog(log, topic, time = Date.now()) {
  sending.value = true;
  taskStore.getPredicts(log?.type);

  const uuid = controlStore.uuid;
  const groupId = controlStore.groupId;
  const id = controlStore.Id;
  // const time = Date.now();

  topic = topic || "user_action";

  // axios.post(`${uploadURL}/log/${groupId}.${id}.${uuid}/${topic}.json?append`, log);
  try {
    // await axios.put(`${uploadURL}/log/${groupId}.${id}.${uuid}/${topic}.${time}.json`, log);
    // setTimeout(() => {
    //   setFalse();
    // }, 1000);
  }
  catch (error) {
    console.log(error);
    errorList.value.push({
      topic,
      log,
      time
    });
    setFalse();
  }

  // sending.value = false;

}

// watch(collectionStore.notes, _.debounce(() => {
//   const logObj = {
//     time: new Date().toLocaleString(),
//     type: 'note',
//     content: _.cloneDeep(collectionStore.notes)
//   };
//   actionList.push(logObj);
//   sendLog(logObj, "notes");
//   // console.log(new Date().toLocaleTimeString(), collectionStore.notes)
// }, 1000))

// watch(collectionStore.layouts, _.debounce(() => {
//   const logObj = {
//     time: new Date().toLocaleString(),
//     type: 'layout',
//     content: _.cloneDeep(collectionStore.layouts)
//   }
//   actionList.push(logObj);
//   sendLog(logObj, "layouts");

//   // console.log(new Date().toLocaleTimeString(), collectionStore.notes)
// }, 1000), {
//   deep: true
// })

// watch(collectionStore.collections, _.debounce(() => {
//   const logObj = {
//     time: new Date().toLocaleString(),
//     type: 'collection',
//     content: _.cloneDeep(collectionStore.collections)
//   }
//   actionList.push(logObj);
//   sendLog(logObj, "collections");

// }, 1000), {
//   deep: true
// })

// watch(queryStore, _.debounce(()=> {
//   actionList.push({
//     time: new Date().toLocaleString(),
//     type: 'query',
//     content: _.cloneDeep(queryStore.$state)
//   })
// }, 1000))

let queryTemp = {}

queryStore.$subscribe((mutation, state) => {
  // if (!_.isEqual(state, queryTemp)) {
  //   const logObj = {
  //     time: new Date().toLocaleString(),
  //     type: 'query',
  //     content: _.cloneDeep(state)
  //   }
  //   actionList.push(logObj);
  //   sendLog(logObj, "query");
  // }
  // queryTemp = _.cloneDeep(state)
})


function saveActionList(download = true, send = false) {

  let finalState = {}

  finalState['notes'] = _.cloneDeep(collectionStore.notes)
  finalState['collections'] = _.cloneDeep(collectionStore.collections)
  finalState['layout'] = _.cloneDeep(collectionStore.layouts)
  finalState['state_comment'] = comment.value
  finalState['specIds'] = _.cloneDeep(collectionStore.specIds)

  const logObj = { 'finalState': finalState, 'actionSteps': actionSepts, 'actionList': actionList }

  if (download) {
    saveAs(new Blob([JSON.stringify(logObj)], { type: 'text/plain; charset=utf-8' }), outputFilename);
  }
  if (send) {
    sendLog(logObj, outputFilename + "_user_upload_log");
  }
  proxy.$EventBus.emit(`user:control:upload:${outputFilename}`, {
    finalState
  });
  comment.value = "";
  show.value = false;
  return logObj;
}

function onResend() {
  resendLog();
  show.value = false;
}

proxy.$EventBus.on("*", function (type, e) {
  // console.log(type,e);
  const logObj = {
    time: new Date().toLocaleString(),
    type: type,
    content: e
  }
  actionSepts.push(logObj);
  sendLog(logObj, "action");

  if (_.startsWith(type, "user:dataset:load")) {
    // const filename = _(e.url).trimStart("dataset/").trimEnd(".json");
    // console.log("filename",filename)
    const filename = datasetStore.name;
    const logObj = saveActionList(false);
    sendLog(logObj, `${filename}_final_state`);
    // outputFilename = `${filename}_user_actions.json`;
    outputFilename = filename;
    actionSepts.length = 0;
    actionList.length = 0;
  }
})

</script>

<style scoped>
</style>
