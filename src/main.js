import { createApp } from 'vue'
import App from './app/app.vue'
import router from './router/index.js'

const app = createApp(App)
app.use(router)
app.mount('#app')