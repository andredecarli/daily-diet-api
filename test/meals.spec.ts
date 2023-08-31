import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'
import { app } from '../src/app'
import { execSync } from 'child_process'
import request from 'supertest'

describe('Meal routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:latest')
  })

  afterEach(() => {
    execSync('npm run knex migrate:rollback --all')
  })

  it('should be able to create a new meal', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        name: 'New Diet Meal',
        description: 'Meal description',
        date: '2020-01-01',
        time: '00:00',
        on_diet: true,
      })
      .expect(201)
  })

  it('should be able to list all meals', async () => {
    const createMealResponse = await request(app.server).post('/meals').send({
      name: 'New Diet Meal',
      description: 'Meal description',
      date: '2020-01-01',
      time: '00:00',
      on_diet: true,
    })

    const cookies = createMealResponse.get('Set-Cookie')

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'New Diet Meal',
        description: 'Meal description',
        timestamp: new Date('2020-01-01T00:00').toString(),
        on_diet: 1,
      }),
    ])
  })

  it('should be able to get a specific meal', async () => {
    const createMealResponse = await request(app.server)
      .post('/meals')
      .send({
        name: 'New Diet Meal',
        description: 'Meal description',
        date: '2020-01-01',
        time: '00:00',
        on_diet: true,
      })
      .expect(201)

    const cookies = createMealResponse.get('Set-Cookie')

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        id: mealId,
        name: 'New Diet Meal',
        description: 'Meal description',
        timestamp: new Date('2020-01-01T00:00').toString(),
        on_diet: 1,
      }),
    )
  })

  it('should be able to edit a meal', async () => {
    const createMealResponse = await request(app.server)
      .post('/meals')
      .send({
        name: 'New Diet Meal',
        description: 'Meal description',
        date: '2020-01-01',
        time: '00:00',
        on_diet: true,
      })
      .expect(201)

    const cookies = createMealResponse.get('Set-Cookie')

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Edited Meal',
        description: 'Edited description',
        date: '2021-01-01',
        time: '10:00',
        on_diet: false,
      })
      .expect(204)

    const editedMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(editedMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Edited Meal',
        description: 'Edited description',
        timestamp: new Date('2021-01-01T10:00').toString(),
        on_diet: 0,
      }),
    )
  })

  it('should be able to delete a meal', async () => {
    const createMealResponse = await request(app.server)
      .post('/meals')
      .send({
        name: 'New meal 1',
        description: 'New description 1',
        date: '2022-01-01',
        time: '11:00',
        on_diet: true,
      })
      .expect(201)

    const cookies = createMealResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'New meal 2',
        description: 'New description 2',
        date: '2022-01-02',
        time: '11:00',
        on_diet: false,
      })
      .expect(201)

    let listAllMeals = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listAllMeals.body.meals.length).toEqual(2)

    const mealId = listAllMeals.body.meals[1].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204)

    listAllMeals = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listAllMeals.body.meals.length).toEqual(1)

    expect(listAllMeals.body.meals).toEqual([
      expect.objectContaining({
        name: 'New meal 1',
        description: 'New description 1',
        timestamp: new Date('2022-01-01T11:00').toString(),
        on_diet: 1,
      }),
    ])
  })

  it('should be able to get the metrics', async () => {
    const createMealResponse = await request(app.server)
      .post('/meals')
      .send({
        name: 'New meal 1',
        description: 'New description 1',
        date: '2022-01-01',
        time: '11:00',
        on_diet: true,
      })
      .expect(201)

    const cookies = createMealResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'New meal 2',
        description: 'New description 2',
        date: '2022-01-01',
        time: '12:00',
        on_diet: true,
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'New meal 3',
        description: 'New description 3',
        date: '2022-01-01',
        time: '13:00',
        on_diet: false,
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'New meal 4',
        description: 'New description 4',
        date: '2022-01-01',
        time: '14:00',
        on_diet: true,
      })
      .expect(201)

    const getMetricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies)
      .expect(200)

    const metrics = getMetricsResponse.body.metrics

    expect(metrics).toEqual({
      totalMeals: 4,
      mealsOnDiet: 3,
      mealsOffDiet: 1,
      bestOnDietStreak: 2,
    })
  })
})
