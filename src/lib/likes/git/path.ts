import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../..');

export const LIKES_JSON_PATH = join(projectRoot, 'src/data/likes.json');
