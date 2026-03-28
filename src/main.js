import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { locale } from './lib/i18n.svelte.js';

document.documentElement.lang = locale.value;

const app = mount(App, {
  target: document.getElementById('app'),
});

export default app;
