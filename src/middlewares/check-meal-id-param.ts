import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function checkMealIdParam(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getMealParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const params = getMealParamsSchema.safeParse(request.params)

  if (!params.success) {
    return reply.status(400).send({
      message: 'Invalid Meal ID. Expected a UUID',
    })
  }

  return params.data
}
