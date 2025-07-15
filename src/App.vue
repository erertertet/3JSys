<template>
  <div class="floating-box">
    <input v-model="text" placeholder="Type a word" />
    <div v-if="showingModal" class="modal-overlay" @click.self="showingModal = false">
      <div class="modal">
        <h2>3D Text Clicked</h2>
        <p>You clicked: <strong>{{ text }}</strong></p>
        <button @click="showingModal = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const text = ref('Hello');
const showingModal = ref(false);

// Listen to click event from Three.js
window.addEventListener('three-clicked', () => {
  showingModal.value = true;
});

watch(text, (newText) => {
  window.update3DText?.(newText);
});
</script>

<style>
.floating-box {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 8px;
}
input {
  font-size: 1.1em;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 300px;
}
</style>
