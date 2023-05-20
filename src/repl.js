const repl = require('node:repl')
const { getSolutionStream } = require('./openai')

const GPT_COMMAND = 'gpt'

async function gpt (input, problem) {
  const solutionStream = await getSolutionStream(problem)
  solutionStream.pipe(input)
}

function createReplServer (input = process.stdin, output = process.stdout) {
  const replServer = repl.start({ input, output })

  replServer.defineCommand(GPT_COMMAND, {
    help: 'Use GPT to generate code directly in the REPL session.',
    action (problem) {
      this.clearBufferedCommand()
      gpt(input, problem).then(() => this.displayPrompt())
    }
  })

  return replServer
}

module.exports = {
  createReplServer,
  GPT_COMMAND
}
