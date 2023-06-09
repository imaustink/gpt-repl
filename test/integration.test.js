import { PassThrough } from 'node:stream'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { v4 as createUuid } from 'uuid'
import { createReplServer, GPT_COMMAND } from '../src/repl'
import { openai, basePrompt } from '../src/openai'
import { StreamSpy, createMockGptStream } from './utils'

const mockSolution = `
function sumTwoNumbers(a, b) {
  return a + b;
}
`

const input = new StreamSpy()
const output = new PassThrough()
createReplServer(input, output)

jest.spyOn(openai, 'createCompletion')
  .mockImplementation(async () => ({
    data: createMockGptStream(mockSolution)
  }))

describe('REPL .gpt command', () => {
  test('should fetch solution from GPT', async () => {
    const mockProblem = 'sum two strings'
    const mockCommand = `.${GPT_COMMAND} ${mockProblem}`
    const outputFile = `${join(tmpdir(), createUuid())}.js`
    const saveCommand = `.save ${outputFile}`

    // Write a .gtp command to the REPL
    input.write(`${mockCommand}\n`)

    // Wait for stream to complete
    await new Promise(resolve => {
      process.nextTick(resolve)
    })

    // Write output to file
    input.write(`${saveCommand}\n`)

    // Read output from file
    const output = await readFile(outputFile, 'utf8')

    // Assert gpt parameters
    expect(openai.createCompletion).toHaveBeenCalledWith({
      model: 'text-davinci-003',
      prompt: [
        ...basePrompt,
        mockProblem
      ].join('/n'),
      temperature: 0,
      max_tokens: 1024,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stream: true
    }, { responseType: 'stream' })

    // Assert REPL input
    expect(input.content).toBe(`${mockCommand}\n${saveCommand}\n`)

    // Assert output
    expect(output).toBe(mockSolution)
  })
})
