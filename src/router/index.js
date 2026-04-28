import { createRouter, createWebHistory } from "vue-router";

import RegistryLayout from "@/pages/registry/RegistryLayout.vue";
import RegistryHome from "@/pages/registry/RegistryHome.vue";
import RegistryBrowse from "@/pages/registry/RegistryBrowse.vue";
import RegistryDocs from "@/pages/registry/RegistryDocs.vue";
import RegistryPublish from "@/pages/registry/RegistryPublish.vue";
import RegistryPkgShow from "@/pages/registry/RegistryPkgShow.vue";
import NamespacePage from "@/pages/registry/NamespacePage.vue";

const routes = [
  {
    path: "/",
    component: RegistryLayout,
    children: [
      { path: "", component: RegistryHome },
      { path: "browse", component: RegistryBrowse },
      { path: "docs", component: RegistryDocs },
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
