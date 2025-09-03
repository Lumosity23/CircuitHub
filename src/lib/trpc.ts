import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import { AppRouter } from './trpc-server'
import superjson from 'superjson'

export const trpc = createTRPCReact<AppRouter>()

export const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: '/api/trpc',
      // Add auth headers if needed
      headers: async () => {
        return {}
      },
    }),
  ],
})