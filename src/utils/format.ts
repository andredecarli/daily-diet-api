export function validateDateFormat(date: string) {
  const dateRegex = /^[12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
  return dateRegex.test(date)
}

export function validateTimeFormat(time: string) {
  const timeRegex = /^(0\d|1\d|2[0-3]):([0-5]\d)$/
  return timeRegex.test(time)
}
