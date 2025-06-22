<template>
  <div id="app" :class="{ 'dark-theme': isDarkTheme }">
    <nav class="app-nav">
      <div class="nav-brand">
        <h1>AI Surah App</h1>
      </div>
      <div class="nav-actions">
        <button @click="toggleTheme" class="theme-toggle">
          {{ isDarkTheme ? '☀️' : '🌙' }}
        </button>
      </div>
    </nav>
    <main class="app-main">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isDarkTheme: false
    }
  },
  mounted() {
    const savedTheme = localStorage.getItem('theme')
    this.isDarkTheme = savedTheme === 'dark'
    this.applyTheme()
  },
  methods: {
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme
      this.applyTheme()
    },
    applyTheme() {
      document.body.classList.toggle('dark', this.isDarkTheme)
      localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light')
    }
  }
}
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-nav {
  background-color: var(--nav-bg, #2c3e50);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.5rem;
}

.nav-actions {
  display: flex;
  gap: 1rem;
}

.theme-toggle {
  background: none;
  border: 2px solid white;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background-color: white;
  color: var(--nav-bg, #2c3e50);
}

.app-main {
  flex: 1;
  padding: 2rem;
  background-color: var(--bg-color, #f5f5f5);
  overflow-y: auto;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}
</style>