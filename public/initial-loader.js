(() => {
  const loader = document.querySelector('.initial-loader')
  if (!loader) return
  const path = window.location.pathname
  if (path === '/' || /^\/admin(?:\/|$)/.test(path)) {
    loader.classList.add('is-branded')
    if (path === '/') loader.classList.add('is-light')
  } else {
    loader.classList.add('is-skeleton')
    loader.setAttribute('aria-label', 'Chargement de la page')
    loader.replaceChildren(...Array.from({ length: 5 }, () => document.createElement('span')))
  }
})()
