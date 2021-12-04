import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

export default function getInput(path, input = 'input') {
  return readFileSync(resolve(dirname(fileURLToPath(path)), input), 'utf8').trimEnd();
}
