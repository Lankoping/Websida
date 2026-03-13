import { createFileRoute, redirect } from '@tanstack/react-router'
import { getDataPolicyPathFn } from '../server/functions/policy'

export const Route = createFileRoute('/datapolicy')({
  beforeLoad: async () => {
    const target = await getDataPolicyPathFn()
    throw redirect({ to: target })
  },
})
