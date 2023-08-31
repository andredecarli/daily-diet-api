import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { z } from 'zod'

export async function mealsRoutes(app: FastifyInstance) {
  // Registrar uma refeição feita
  // Deve estar relacionada a um usuário
  // Campos: Nome, Descrição, Data e Hora, Está dentro ou não da dieta
  app.post('/', async (request, reply) => {
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

    const { name, description, date, time } = body.data
    const onDiet = body.data.on_diet

    // Validate Date Format
    const dateRegex = /^[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
    if (!dateRegex.test(date)) {
      return reply.status(400).send({
        message: 'Invalid date format. Expected YYYY-MM-DD',
      })
    }
    // Validate Time Format
    const timeRegex = /^(0\d|1\d|2[0-3]):([0-5]\d)$/
    if (!timeRegex.test(time)) {
      return reply.status(400).send({
        message: 'Invalid time format. Expected HH:mm',
      })
    }
    const timestamp = new Date(date + 'T' + time).toString()

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      timestamp,
      on_diet: onDiet,
    })

    return reply.status(201).send()
  })

  // Editar uma refeição, podendo alterar todos os campos acima
  app.put('/:id', async () => {
    return { message: 'TODO: Edit meal' }
  })

  // Apagar uma refeição
  app.delete('/:id', async () => {
    return { message: 'TODO: Delete meal' }
  })

  // Listar todas as refeições do usuário
  app.get('/', async () => {
    const meals = await knex('meals').select()
    return { meals }
  })

  // Listar uma única refeição
  app.get('/:id', async () => {
    return { message: 'TODO: List a single meal from user' }
  })

  // Metricas de um usuario
  // Quantidade total de refeições registradas
  // Quantidade total de refeições dentro da dieta
  // Quantidade total de refeições fora da dieta
  // Melhor sequencia de refeições dentro da dieta
  app.get('/metrics', async () => {
    return { message: 'TODO: Metrics from user' }
  })
}
