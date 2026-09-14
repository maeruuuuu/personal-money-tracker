export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return

  const { data } = await useFetch('/api/auth/me')
  if (!data.value?.loggedIn) {
    return navigateTo('/login')
  }
})
