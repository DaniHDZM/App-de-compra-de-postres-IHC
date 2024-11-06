import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify' // Asegúrate de que esta ruta sea correcta
import { loadFonts } from './plugins/webfontloader'
import { createRouter, createWebHistory } from 'vue-router'

import RegistrarApp from './components/RegistrarApp.vue'
import LoginApp from './components/LoginApp.vue'
loadFonts()

const routes = [
    { path: '/', component: LoginApp },
    { path: '/RegistarApp', component: RegistrarApp}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

createApp(App)
    .use(vuetify)
    .use(router)
    .mount('#app')
