<template>
  <div class="container error-layout">
    <section class="home-juejin__feed error-card">
      <div class="error-content">
        <h1>404</h1>
        <h2>页面不存在</h2>
        <p>该文章或用户可能已删除，或链接有误。</p>
        <div class="btn-group error-actions">
          <router-link class="btn btn--primary" style="margin-right: 8px;" to="/">回到首页</router-link>
          <router-link class="btn btn--ghost" to="/login">登录</router-link>
        </div>
      </div>
      <p class="error-hint">错误代码：NOT_FOUND · 可返回首页或重新搜索关键词。</p>
    </section>
  </div>
</template>
