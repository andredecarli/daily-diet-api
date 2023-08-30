import { FastifyInstance } from 'fastify'

export async function mealsRoutes(app: FastifyInstance) {
  // Registrar uma refeição feita
  // Deve estar relacionada a um usuário
  // Campos: Nome, Descrição, Data e Hora, Está dentro ou não da dieta
  app.post('/', async () => {
    return { message: 'TODO: Insert meal' }
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
    return { message: 'TODO: List all meals from user' }
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
