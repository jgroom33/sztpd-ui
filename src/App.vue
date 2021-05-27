<template>
  <div id="app">
    <Toast />
    <topnavbar />
    <router-view />
  </div>
</template>

<script>
import topnavbar from "@/components/Topnavbar.vue";

export default {
  name: "App",
  components: {
    topnavbar,
  },
  beforeCreate() {
    import("primevue/resources/themes/bootstrap4-light-blue/theme.css");
  },
  created() {},
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}
</style>
