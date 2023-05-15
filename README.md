# Node.js REPL Integrated with GPT

Use GPT to write code directly into your REPL.

**Proceed with caution!**

Yes, this could totally be dangerous. So don't give it root privileges and then ask it to destroy your system or it might oblige you.

## Prerequisites

1. An OpenAI [API key](https://platform.openai.com/account/api-keys)
1. [Node.js](https://nodejs.org/en) and [npm](https://www.npmjs.com/)

## Getting Started

- Install with `npm i -g gpt-repl`
- Setup `OPENAI_API_KEY` environment variable
- Start the REPL with `gpt-repl`
- Ask GPT for help with `.gpt sum an array of numbers`

## REPL Features

This tool is built on top of Node's builtin `repl` module.

For more information about it's features, see the [official documentation](https://nodejs.org/api/repl.html).
