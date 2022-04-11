import { createApp } from 'vue'


import { createPinia } from 'pinia'
import { Undo } from '@/store/plugins/undo'
import { StateRecord } from '@/store/plugins/stateRecord'      
import App from './App.vue'

import VueGridLayout from 'vue-grid-layout'
import mitt from 'mitt'

import actionService from './utils/actionService'

import persistedstate from 'pinia-persistedstate'

import 'virtual:windi-base.css'
import 'virtual:windi-components.css'
import 'virtual:windi-utilities.css'
import 'virtual:windi-devtools'


const app=createApp(App);
// app.use(router);
const pinia = createPinia();
pinia.use(Undo);
// pinia.use(StateRecord);

// pinia.use(persistedstate({
//     key:"client",
//     paths:["CollectionStore","DatasetStore","QueryStore","control"]
// }))

app.use(pinia);
app.use(VueGridLayout);


app.config.globalProperties.$EventBus = new mitt();
app.config.performance=true;

app.use(actionService);

app.mount('#app');
