import { appParams } from './app-params'

const { appId, token, functionsVersion, appBaseUrl } = appParams

// Cliente simulado para cuando no hay credenciales base44
const mockClient = {
  entities: new Proxy({}, {
    get: (_, entity) => ({
      list: async () => [],
      create: async (data) => ({ ...data, id: Date.now().toString(), created_date: new Date().toISOString() }),
      update: async (id, data) => ({ id, ...data }),
      delete: async () => {},
      filter: async () => [],
    })
  }),
  auth: {
    me: async () => null,
    logout: async () => {},
  }
}

let base44Client = mockClient

try {
  if (appId && appId !== 'TU_APP_ID_AQUI') {
    const { createClient } = await import('@base44/sdk')
    base44Client = createClient({
      appId,
      token,
      functionsVersion,
      serverUrl: '',
      requiresAuth: false,
      appBaseUrl
    })
  }
} catch (e) {
  console.warn('base44 SDK no disponible, usando modo offline')
}

export const base44 = base44Client
