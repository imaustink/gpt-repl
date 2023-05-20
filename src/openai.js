const os = require('node:os')
const { Transform } = require('node:stream')
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

  return response.data.pipe(new SolutionStream())
}

class SolutionStream extends Transform {
  static DONE_TOKEN = '[DONE]'
  static DATA_PREFIX = 'data: '

  constructor () {
    super({
      transform: (...args) => this.transform(...args)
    })
  }

  transform (chunk, encoding, callback) {
    try {
      callback(null, this.parseChunk(chunk))
    } catch (error) {
      callback(error)
    }
  }

  parseChunk (chunk) {
    return chunk.toString('utf8')
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => line.replace(SolutionStream.DATA_PREFIX, ''))
      .reduce(this.reduceLines, '')
  }

  reduceLines (result, line) {
    if (line.startsWith(SolutionStream.DONE_TOKEN)) {
      return result + os.EOL
    } else {
      const payload = JSON.parse(line)
      const { text } = payload.choices[0]
      return result + text
    }
  }
}

module.exports = {
  getSolutionStream,
  SolutionStream,
  basePrompt,
  openai
}
