import { createRouter, createWebHistory } from "vue-router";

const RegistryLayout = () => import("@/pages/registry/RegistryLayout.vue");
const RegistryHome = () => import("@/pages/registry/RegistryHome.vue");
const RegistryBrowse = () => import("@/pages/registry/RegistryBrowse.vue");
const RegistryPublish = () => import("@/pages/registry/RegistryPublish.vue");
const RegistryPkgShow = () => import("@/pages/registry/RegistryPkgShow.vue");
const NamespacePage = () => import("@/pages/registry/NamespacePage.vue");

const routes = [
  {
    path: "/",
    component: RegistryLayout,
    children: [
      { path: "", component: RegistryHome },
      { path: "browse", component: RegistryBrowse },
      { path: "publish", component: RegistryPublish },
      { path: "pkg/:namespace/:name", component: RegistryPkgShow },
      { path: "ns/:namespace", component: NamespacePage },
    ],
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
