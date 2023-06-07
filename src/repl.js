import repl from 'node:repl'
import { getSolutionStream } from './openai.js'

const [/* binPath */, /* mainPath */, ...args] = process.argv

export const GPT_COMMAND = 'gpt'

export async function gpt (replServer, problem) {
  const solutionStream = await getSolutionStream(problem)
  await new Promise(resolve => {
    function handleData (data) {
      replServer.write(data.toString('utf8'))
    }
    solutionStream.on('data', handleData)
    solutionStream.once('end', () => {
      solutionStream.off('data', handleData)
      resolve()
    })
  })
}

export function createReplServer (input = process.stdin, output = process.stdout) {
  const replServer = repl.start({
    input,
    output,
    ...(args.includes('--forceTerminal') && { terminal: true }),
    ...(args.includes('--forcePreview') && { preview: true })
  })

  replServer.defineCommand(GPT_COMMAND, {
    help: 'Use GPT to generate code directly in the REPL session.',
    action (problem) {
      this.clearBufferedCommand()
      gpt(this, problem).then(() => this.displayPrompt())
    }
  })

  return replServer
}
