import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.blue.light.css';
import './assets/main.css';

const app = createApp(App);

app.use(router);

app.mount('#app');
