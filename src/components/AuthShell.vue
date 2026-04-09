<script setup>
defineProps({
  heroTitle: { type: String, required: true },
  heroLead: { type: String, required: true },
  cardTitle: { type: String, required: true },
  cardLead: { type: String, required: true },
})
</script>

<template>
  <main class="auth-shell">
    <section class="auth-visual">
      <div class="auth-visual__inner">
        <router-link class="auth-logo" to="/">博文</router-link>
        <h1 class="auth-visual__title">{{ heroTitle }}</h1>
        <p class="auth-visual__lead">{{ heroLead }}</p>
      </div>
    </section>

    <section class="auth-panel">
      <div class="auth-card">
        <h2 class="auth-card__title">{{ cardTitle }}</h2>
        <p class="auth-card__lead">{{ cardLead }}</p>
        <slot />
      </div>
    </section>
  </main>
</template>
