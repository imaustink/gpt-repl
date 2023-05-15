#!/usr/bin/env node
const os = require('node:os')
const repl = require('node:repl')
const { getSolutionStream } = require('../src/openai')

const GPT_COMMAND = 'gpt'

const replServer = repl.start({
  input: process.stdin,
  output: process.stdout
})

replServer.defineCommand(GPT_COMMAND, {
  help: 'Use GPT to generate code directly in the REPL session.',
  action(problem) {
    this.clearBufferedCommand()
    gpt(problem).then(() => this.displayPrompt())
  }
})

async function gpt(problem) {
  const solutionStream = await getSolutionStream(problem)
  await new Promise((resolve) => {
    function handleText(text) {
      replServer.write(text)
    }
    function handleDone() {
      replServer.write(os.EOL)
      solutionStream.off('text', handleText)
      resolve()
    }
    solutionStream.on('text', handleText)
    solutionStream.once('done', handleDone)
  })
}
