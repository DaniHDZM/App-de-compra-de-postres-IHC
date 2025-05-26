// main.js
import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import { createRouter, createWebHistory } from "vue-router";
import CarritoApp from "./components/CarritoApp.vue";
import EnvioApp from "./components/EnvioApp.vue";
import ConfirmacionApp from "./components/ConfirmacionApp.vue";
import UltimoPedido from "./components/UltimoPedido.vue";
import RegistrarApp from "./components/RegistrarApp.vue";
import LoginApp from "./components/LoginApp.vue";
import ProductosView from "./components/Productos.vue";
import AdminView from "./components/AdminView.vue";
import { supabase } from "./supabase";
loadFonts();

const routes = [
  { path: "/", component: LoginApp },
  { path: "/RegistrarApp", component: RegistrarApp },
  { path: "/Productos", component: ProductosView },
  { path: "/Carrito", component: CarritoApp },
  { path: "/EnvioApp", component: EnvioApp },
  { path: "/ConfirmacionApp", component: ConfirmacionApp },
  { path: "/UltimoPedido", component: UltimoPedido},
  { path: "/Admin", component: AdminView, meta: { requiresAuth: true, requiresAdmin: true }}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (to.meta.requiresAdmin && !user) {
    next('/RegistrarApp');
  } else if (to.meta.requiresAdmin && user) {
    // MODIFICACIÓN CRÍTICA AQUÍ: Cambia 'id' por 'user_id'
    const { data, error } = await supabase
      .from('usuarios')
      .select('role')
      .eq('user_id', user.id) // <--- CAMBIADO DE 'id' A 'user_id'
      .single();

    if (error || !data || data.role !== 'admin') {
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});

createApp(App).use(vuetify).use(router).mount("#app");