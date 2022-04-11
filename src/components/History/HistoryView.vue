<template>
    <transition name="scaleY" @after-enter="onEnter" @after-leave="onLeave">
        <div class="h-50" v-show="props.show"  >
        <n-scrollbar   ref="contentRef" :x-scrollable="true">
            <n-space class="h-1/1 py-2 overflow-x-auto overflow-y-hidden" :wrap="false" :ref="el" >
            
                <n-card class="h-44 w-50" v-for="(vl,i) in vegalites" @click="selectHis(i)">
                    <transition name="fade">
                        <chart-raw-vue
                            v-if="chartsShow"
                            :vegalite="vl"
                            :renderOption="{
                                height: 'container',
                                width: 'container',
                                autosize: {
                                    type: 'fit',
                                    contains: 'padding'
                                },
                                resize: true,
                                config:{
                                    legend:{
                                        disable:true
                                    },
                                    axis:{
                                        ticks:false,
                                        labels:false,
                                    },
                                    point:{
                                        filled:true,
                                        size:10,
                                    }

                                }
                            }"
                            :ref="el => { if (el) charts[idx] = el }"
                            class="h-1/1 w-1/1"
                        ></chart-raw-vue>
                    </transition>
                </n-card>
           
            </n-space>
             </n-scrollbar>
        </div>
    </transition>
</template>

<script setup>
import { NCard, NSpace,NScrollbar } from 'naive-ui';
import ChartRawVue from '../ChartRaw.vue';
import { nextTick, ref, watch ,onMounted} from "vue";
import { useElementSize } from '@vueuse/core'
import { CollectionStore, CollectionItem } from '../../store/CollectionStore';
const collectionStore = CollectionStore();
const charts = ref([]);
const chartsShow = ref(false);
const props = defineProps({
    vegalites: Array,
    show: Boolean,
    selectId:Number
});
const el = ref(null);
const contentRef = ref(null);
const { height } = useElementSize(el);
watch(height, () => {
    console.log(height.value);
})
function onEnter() {
    chartsShow.value = true;
    contentRef.value?.scrollTo({ left: 12000, behavior: 'smooth' })
}
function onLeave() {
    chartsShow.value = false;
}

function selectHis(i) {

    collectionStore.collections.find(c => c.id == props.selectId).changeSpec(props.vegalites[i]) ;
    props.show=true;

}
watch(()=>props.vegalites,()=>{
    setTimeout(()=>{
        contentRef.value?.scrollTo({ left: 12000, behavior: 'smooth' })
    },100)
    // contentRef.value?.scrollTo({ left: 12000, behavior: 'smooth' })
})

</script>

<style scoped>
.scaleY-enter-active,
.scaleY-leave-active {
    /* transition: opacity 0.5s ease; */
    @apply transition-all duration-500;
}

.scaleY-enter-from,
.scaleY-leave-to {
    /* opacity: 0; */
    @apply transform h-0;
    /* transform: scaleY(0); */
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.n-scrollbar-content{
    height: 100%;
}

.n-scrollbar-container{
    @apply bg-red-500;
}
</style>