# advent-of-code
My entries for https://adventofcode.com! 🥳

## Usage

### Run once

```sh
npm run once             -- [-y,--year] [-d,--day <day>]
```

### Dev mode

```sh
npm run dev              -- [-y,--year] [-d,--day <day>] 

# or, when making changes outside of the daily TS file
npm run dev:full-rebuild -- [-y,--year] [-d,--day <day>] 
```

### Prepare input and TS code

```sh
tools/prepare.sh [-f]
# -f to re-download of input even when the file already exists
```
> requires the value of your `session` cookie in `tools/.session`

> automatically ran by `npm run dev[:full-rebuild]`
