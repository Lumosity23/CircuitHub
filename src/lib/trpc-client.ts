import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import superjson from 'superjson'
import type { AppRouter } from './routers'

// Create the tRPC React hooks
export const trpc = createTRPCReact<AppRouter>()

// Infer types
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

// Create tRPC client
export const trpcClient = trpc.createClient({
  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === 'development' ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: '/api/trpc',
      transformer: superjson,
    }),
  ],
})