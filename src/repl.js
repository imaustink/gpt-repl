const os = require('node:os')
const repl = require('node:repl')
const { getSolutionStream } = require('./openai')

const GPT_COMMAND = 'gpt'

async function gpt (input, problem) {
  const solutionStream = await getSolutionStream(problem)
  // TODO try piping to REPL
  await new Promise((resolve) => {
    function handleText (text) {
      input.write(text)
    }
    function handleDone () {
      input.write(os.EOL)
      solutionStream.off('text', handleText)
      resolve()
    }
    solutionStream.on('text', handleText)
    solutionStream.once('done', handleDone)
  })
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
