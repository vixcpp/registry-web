<template>
  <div class="app app--registry">
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";

onMounted(() => {
  document.documentElement.classList.add("is-registry");
  document.body.classList.add("is-registry");
});

onBeforeUnmount(() => {
  document.documentElement.classList.remove("is-registry");
  document.body.classList.remove("is-registry");
});
</script>

<style scoped>
.app {
  min-height: 100vh;
}

.main {
  min-height: 100vh;
  padding-top: 0;
}
</style>
