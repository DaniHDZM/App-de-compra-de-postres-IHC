import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify"; // Asegúrate de que esta ruta sea correcta
import { loadFonts } from "./plugins/webfontloader";
import { createRouter, createWebHistory } from "vue-router";
import CarritoApp from "./components/CarritoApp.vue";
import EnvioApp from "./components/EnvioApp.vue";
import ConfirmacionApp from "./components/ConfirmacionApp.vue";
import UltimoPedido from "./components/UltimoPedido.vue";

import RegistrarApp from "./components/RegistrarApp.vue";
import LoginApp from "./components/LoginApp.vue";
import Productos from "./components/Productos.vue";
loadFonts();

const routes = [
  { path: "/", component: LoginApp },
  { path: "/RegistrarApp", component: RegistrarApp },
  { path: "/Productos", component: Productos },
  { path: "/Carrito", component: CarritoApp },
  { path: "/EnvioApp", component: EnvioApp },
  { path: "/ConfirmacionApp", component: ConfirmacionApp },
  { path: "/UltimoPedido", component: UltimoPedido}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  // Don't redirect if going to these paths
  if (to.path === '/' || to.path === '/login/callback' || to.path === '/api/auth/login/callback') {
    return next();
  }
  
  const user = localStorage.getItem("user");
  
  if (!user) {
    console.log("No user in localStorage, checking server session...");
    // Before redirecting, check if there's actually a session on the server
    try {
      const response = await fetch('http://localhost:4006/api/auth/check', { 
        credentials: 'include'
      });
      
      console.log("Server auth check result:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Server returned user data:", data);
        localStorage.setItem("user", JSON.stringify(data.user));
        next(); // Allow navigation if authenticated on server
      } else {
        console.log("Not authenticated on server, redirecting to login");
        next("/"); // Redirect to login if not authenticated
      }
    } catch (error) {
      console.error('Error checking auth in guard:', error);
      next("/");
    }
  } else {
    console.log("User found in localStorage, continuing navigation");
    next();
  }
});

createApp(App).use(vuetify).use(router).mount("#app");
