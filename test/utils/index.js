import { PassThrough } from 'stream'
import { SolutionStream } from '../../src/openai'

export class StreamSpy extends PassThrough {
  constructor () {
    super()
    this.on('data', (data) => {
      this.chunks.push(data)
    })
  }

  chunks = []

  get content () {
    return Buffer.concat(this.chunks).toString('utf8')
  }
}

export function createMockGptStream (fullText) {
  const data = new PassThrough()
  process.nextTick(() => {
    while (fullText) {
      const chunkSize = getRandomNumber(3)
      const text = fullText.substring(0, chunkSize)
      fullText = fullText.substring(chunkSize)
      data.write(`data: ${JSON.stringify({
        choices: [
          {
            text
          }
        ]
      })}`)
    }
    data.end(`data: ${SolutionStream.DONE_TOKEN}`)
  })
  return data
}

export function getRandomNumber (max) {
  return Math.floor(Math.random() * max)
}
