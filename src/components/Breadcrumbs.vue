<template>
  <div style="margin-bottom: 20px; font-size: 12px;">
    <router-link to="/">Home</router-link>
    <span v-if="$route.name === 'Post'"> > {{ $route.params.id }}</span>
    <span v-if="$route.name === 'Admin'"> > Admin</span>
  </div>
</template>

<script>
export default {
  name: 'Breadcrumbs'
}
</script>
