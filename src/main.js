import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify"; // Asegúrate de que esta ruta sea correcta
import { loadFonts } from "./plugins/webfontloader";
import { createRouter, createWebHistory } from "vue-router";
import CarritoApp from "./components/CarritoApp.vue";
import EnvioApp from "./components/EnvioApp.vue";
import ConfirmacionApp from "./components/ConfirmacionApp.vue";

import RegistrarApp from "./components/RegistrarApp.vue";
import LoginApp from "./components/LoginApp.vue";
import ProductosView from "./components/Productos.vue";
loadFonts();

const routes = [
  { path: "/", component: LoginApp },
  { path: "/RegistrarApp", component: RegistrarApp },
  { path: "/Productos", component: ProductosView },
  { path: "/Carrito", component: CarritoApp },
  { path: "/EnvioApp", component: EnvioApp },
  { path: "/ConfirmacionApp", component: ConfirmacionApp },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App).use(vuetify).use(router).mount("#app");
