# Node.js REPL Integrated with GPT

![Automated Tests](https://github.com/imaustink/gpt-repl/actions/workflows/build.yml/badge.svg)
<span class="badge-npmversion"><a href="https://npmjs.org/package/gpt-repl" title="View this project on NPM"><img src="https://img.shields.io/npm/v/gpt-repl.svg" alt="NPM version" /></a></span>

Use GPT to write code directly into a Node.js REPL.

**Proceed with caution!**

Yes, this could totally be dangerous. So don't give it root privileges and then ask it to destroy your system or it might oblige you.

## Demo

[![asciicast](https://asciinema.org/a/AaA7UsxK4UExPO61SFI9zrBqb.svg)](https://asciinema.org/a/AaA7UsxK4UExPO61SFI9zrBqb)

## Prerequisites

1. An OpenAI [API key](https://platform.openai.com/account/api-keys)
1. [Node.js](https://nodejs.org/en) and [npm](https://www.npmjs.com/)

## Getting Started

- Install with `npm i -g gpt-repl`
- Setup `OPENAI_API_KEY` environment variable
- Start the REPL with `gpt-repl`
- Ask GPT for help with `.gpt sum an array of numbers`

## REPL Features

This tool is built on top of Node's built-in `repl` module.

For more information about it's features, see the [official documentation](https://nodejs.org/api/repl.html).
