import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function checkMealBodySchema(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createMealBodySchema = z.object({
    name: z.string(),
    description: z.string(),
    date: z.string(),
    time: z.string(),
    on_diet: z.boolean(),
  })

  const body = createMealBodySchema.safeParse(request.body)

  if (!body.success) {
    return reply.status(400).send({
      message:
        'Invalid data sent. Expected name:string, description:string, date:string, time:string, on_diet:boolean',
    })
  }

  return body.data
}
