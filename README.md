# advent-of-code

My entries for https://adventofcode.com! 🥳

You may want to check out the `interactive-runner` branch, which does some *really* funky stuff ;)  
It'll probably be worked on again next December. Maybe switching to Bun would be immensely helpful; that, or Rust.

## Usage

Install:
```shell
npm install
```

Watch-build code:
```shell
npm run dev:build
```

Watch-run built code:
```shell
npm run dev:run          [-y,--year <year>] [-d,--day <day>]
# or
nodemon --quiet dist/run [-y,--year <year>] [-d,--day <day>]
```

Run solution:
```
# or
node dist/run            [-y,--year <year>] [-d,--day <day>]
# or
dist/run.js              [-y,--year <year>] [-d,--day <day>]
```
