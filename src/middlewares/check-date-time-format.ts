import { FastifyReply } from 'fastify'
import { validateDateFormat, validateTimeFormat } from '../utils/format'

export async function validateDateTimeFormat(
  date: string,
  time: string,
  reply: FastifyReply,
) {
  // Validate Date Format
  if (!validateDateFormat(date)) {
    return reply.status(400).send({
      message: 'Invalid date format. Expected YYYY-MM-DD',
    })
  }
  // Validate Time Format
  if (!validateTimeFormat(time)) {
    return reply.status(400).send({
      message: 'Invalid time format. Expected HH:mm',
    })
  }
  const timestamp = new Date(date + 'T' + time).toString()
  if (timestamp.toString() === 'Invalid Date') {
    return reply.status(400).send({
      message: 'Invalid date',
    })
  }

  return timestamp
}
