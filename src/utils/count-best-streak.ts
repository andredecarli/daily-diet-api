interface Meal {
  timestamp: string
  on_diet: boolean
}

export function bestStreak(data: Array<Meal>) {
  const dataWithDate = data.map((meal) => [
    new Date(meal.timestamp),
    meal.on_diet,
  ])

  dataWithDate.sort((a, b) => {
    if (a[0] < b[0]) return -1
    else if (a[0] > b[0]) return 1
    return 0
  })

  let countStreak = 0

  for (const meal of dataWithDate) {
    if (meal[1]) {
      countStreak++
    } else {
      countStreak = 0
    }
  }

  return countStreak
}
