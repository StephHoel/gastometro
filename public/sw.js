/* eslint-disable no-restricted-globals */

try {
  importScripts('./sw-version.js')
} catch (_error) {
  // Fallback para ambientes sem arquivo de versao gerado
}

const APP_NAME = 'gastometro'
const APP_VERSION = typeof self.__APP_VERSION__ === 'string' ? self.__APP_VERSION__ : 'dev'
const CACHE_PREFIX = `${APP_NAME}-cache-v`
const CACHE_NAME = `${CACHE_PREFIX}${APP_VERSION}`

function getBasePath() {
  const scopeUrl = new URL(self.registration.scope)
  const scopePathname = scopeUrl.pathname

  if (scopePathname === '/') return ''
  return scopePathname.endsWith('/')
    ? scopePathname.slice(0, -1)
    : scopePathname
}

function withBasePath(pathname) {
  const basePath = getBasePath()

  if (!basePath) return pathname
  if (pathname === '/') return `${basePath}/`
  return `${basePath}${pathname}`
}

function getAppShellUrls() {
  return [
    withBasePath('/'),
    withBasePath('/index.html'),
    withBasePath('/404.html'),
  ]
}

function isStaticAssetRequest(request, url) {
  if (request.method !== 'GET') return false
  if (url.origin !== self.location.origin) return false

  const destination = request.destination
  if (destination === 'script' || destination === 'style' || destination === 'image' || destination === 'font') {
    return true
  }

  return /\.(js|css|png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|map|json)$/.test(url.pathname)
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) return cachedResponse

  try {
    const response = await fetch(request)

    if (response.ok) {
      await cache.put(request, response.clone())
    }

    return response
  } catch (_error) {
    return new Response('Offline resource not available', {
      status: 404,
      statusText: 'Not Found',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    })
  }
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAME)

  try {
    const response = await fetch(request)

    if (response.ok) {
      await cache.put(request, response.clone())
    }

    return response
  } catch (_error) {
    const cachedNavigation = await cache.match(request)
    if (cachedNavigation) return cachedNavigation

    const shellUrls = getAppShellUrls()
    for (const shellUrl of shellUrls) {
      const shellResponse = await cache.match(shellUrl)
      if (shellResponse) return shellResponse
    }

    return new Response('Offline page not available', {
      status: 404,
      statusText: 'Not Found',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    })
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    const shellUrls = getAppShellUrls()

    // Cache cada URL individualmente sem falhar o install inteiro
    await Promise.allSettled(
      shellUrls.map(async (url) => {
        try {
          const response = await fetch(url)
          if (response.ok) {
            await cache.put(url, response.clone())
          }
        } catch (_error) {
          // URL indisponível; continua sem falhar o install
        }
      })
    )

    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheKeys = await caches.keys()

    await Promise.all(
      cacheKeys
        .filter((cacheKey) => cacheKey.startsWith(CACHE_PREFIX) && cacheKey !== CACHE_NAME)
        .map((cacheKey) => caches.delete(cacheKey))
    )

    await self.clients.claim()
  })())
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const requestUrl = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request))
    return
  }

  if (!isStaticAssetRequest(request, requestUrl)) return

  event.respondWith(cacheFirst(request))
})
