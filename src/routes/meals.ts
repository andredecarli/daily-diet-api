import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { bestStreak } from '../utils/count-best-streak'
import { checkMealBodySchema } from '../middlewares/check-meal-body-schema'
import { validateDateTimeFormat } from '../middlewares/check-date-time-format'
import { checkMealIdParam } from '../middlewares/check-meal-id-param'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  // Registrar uma refeição feita
  // Deve estar relacionada a um usuário
  // Campos: Nome, Descrição, Data e Hora, Está dentro ou não da dieta
  app.post('/', async (request, reply) => {
    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    const body = await checkMealBodySchema(request, reply)

    const { name, description, date, time } = body
    const onDiet = body.on_diet

    const timestamp = await validateDateTimeFormat(date, time, reply)

    await knex('meals').insert({
      id: randomUUID(),
      session_id: sessionId,
      name,
      description,
      timestamp,
      on_diet: onDiet,
    })

    return reply.status(201).send()
  })

  // Editar uma refeição, podendo alterar todos os campos acima
  app.put(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const { id } = await checkMealIdParam(request, reply)

      const body = await checkMealBodySchema(request, reply)

      const { name, description, date, time } = body
      const onDiet = body.on_diet

      const timestamp = await validateDateTimeFormat(date, time, reply)

      await knex('meals')
        .where({
          id,
          session_id: sessionId,
        })
        .update({
          name,
          description,
          timestamp,
          on_diet: onDiet,
        })

      return reply.status(204).send()
    },
  )

  // Apagar uma refeição
  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const { id } = await checkMealIdParam(request, reply)

      await knex('meals')
        .where({
          id,
          session_id: sessionId,
        })
        .delete()
      return reply.status(204).send()
    },
  )

  // Listar todas as refeições do usuário
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies
    const meals = await knex('meals').where('session_id', sessionId).select()
    return { meals }
  })

  // Listar uma única refeição
  app.get(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies
      const { id } = await checkMealIdParam(request, reply)

      const meal = await knex('meals')
        .where({
          id,
          session_id: sessionId,
        })
        .first()
      return { meal }
    },
  )

  // Metricas de um usuario
  // Quantidade total de refeições registradas
  // Quantidade total de refeições dentro da dieta
  // Quantidade total de refeições fora da dieta
  // Melhor sequencia de refeições dentro da dieta
  app.get(
    '/metrics',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies

      const meals = await knex('meals')
        .where('session_id', sessionId)
        .select('timestamp', 'on_diet')
      const mealsOnDiet = await knex('meals')
        .where({
          session_id: sessionId,
          on_diet: true,
        })
        .count('*', { as: 'count' })
        .first()
      const mealsOffDiet = await knex('meals')
        .where({
          session_id: sessionId,
          on_diet: false,
        })
        .count('*', { as: 'count' })
        .first()
      const bestOnDietStreak = bestStreak(meals)

      const metrics = {
        totalMeals: meals.length,
        mealsOnDiet: mealsOnDiet?.count,
        mealsOffDiet: mealsOffDiet?.count,
        bestOnDietStreak,
      }

      return { metrics }
    },
  )
}
