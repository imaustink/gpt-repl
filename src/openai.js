const { Readable } = require('node:stream')
const { Configuration, OpenAIApi } = require('openai')

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)

const basePrompt = [
  'I am going to present you with a problem or ask you to write a program to solve a specific problem.',
  'You will respond only with valid javascript code. No explanations, no comments. Only code.',
  'Your responses will be feed to the Node.js runtime for execution.',
  'Any time specific logic is requested, it should be encapsulated in a function.'
]

async function getSolutionStream (problem) {
  const prompt = [
    ...basePrompt,
    problem
  ].join('/n')

  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    temperature: 0,
    max_tokens: 1024,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    stream: true
  }, { responseType: 'stream' })

  return new SolutionStream(response.data)
}

class SolutionStream extends Readable {
  constructor (stream) {
    super()
    this.stream = stream
    this.start()
  }

  stream = null
  static DONE_TOKEN = '[DONE]'
  static DATA_PREFIX = 'data: '

  createDataHandler (callback) {
    return (chunk) => {
      return chunk.toString('utf8')
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => line.replace(SolutionStream.DATA_PREFIX, ''))
        .forEach(callback)
    }
  }

  lineParser (line) {
    if (line.startsWith(SolutionStream.DONE_TOKEN)) {
      this.emit('done')
    } else {
      const result = JSON.parse(line)
      this.emit('text', result.choices[0].text)
    }
  }

  onError (error) {
    this.emit('error', error)
    this.stream.removeAllListeners()
  }

  onEnd () {
    this.stream.removeAllListeners()
  }

  start () {
    const onData = this.createDataHandler(line => this.lineParser(line))
    this.stream.on('data', onData)
    this.stream.once('end', () => this.onEnd())
    this.stream.once('error', error => this.onError(error))
  }
}

module.exports = {
  getSolutionStream,
  SolutionStream,
  basePrompt,
  openai
}
