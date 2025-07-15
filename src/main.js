import { createApp } from 'vue';
import App from './App.vue';
import initScene from './scene';

initScene(); // initialize 3D scene
createApp(App).mount('#app');
