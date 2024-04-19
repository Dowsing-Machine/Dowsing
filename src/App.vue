<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { NMessageProvider, NConfigProvider, NThemeEditor } from 'naive-ui';
import { zhCN, dateZhCN } from 'naive-ui';
import { reactive } from "vue"
import EditboardVue from './views/Editboard.vue';


// @type import('naive-ui').GlobalThemeOverrides
const themeOverrides = reactive({
  common: {
    primaryColor: "#0051c2",
    primaryColorHover: "#006aff",
    primaryColorPressed: "#004ab3",
    primaryColorSuppl: "#3a70bb"
  }
});

</script>

<template>
  <n-config-provider :locale="zhCN" :dateLocale="dateZhCN" :theme-overrides="themeOverrides">
    <n-message-provider>
      <div class="app">
        <!-- <router-view></router-view> -->
        <editboard-vue></editboard-vue>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
.app {
  --primary-color: v-bind("themeOverrides.common.primaryColor");
  --embeded-bg-color: #f5f5f5;
  /* --title-color: var(--primary-color); */
  --title-color: black;
  --light-primary-color: #6696da;
}
</style>
