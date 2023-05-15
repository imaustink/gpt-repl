import { PassThrough } from "stream"
import { openai, basePrompt } from "../src/openai"
import "../bin/repl"

const mockSolution = `
function sumTwoNumbers(a, b) {
  return a + b;
}
`;

jest.spyOn(openai, 'createCompletion')
  .mockImplementation(async () => {
    const data = new PassThrough()
    const payload = {
      choices: [
        {
          text: mockSolution
        }
      ]
    };
    process.nextTick(() => {
      // TODO split into multiple streams
      data.write(`data: ${JSON.stringify(payload)}`)
      data.end()
    })
    return {
      data
    }
  });

describe("integration suite", () => {
  test("cli gpt command", async () => {
    const mockProblem = '.gpt sum two strings\n'
    const stdout = await new Promise(resolve => {
      const chunks = [];
      process.stdout.on('data', function (data) {
        console.log(data.toString('utf8'));
        chunks.push(data);
        if (data.toString('utf8').includes('\n')) {
          resolve(Buffer.concat(bufs));
        };
      });
    })
    process.stdin.write(mockProblem)
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
    expect(Buffer.concat(stdout)).toBe(mockSolution)
  });
});
