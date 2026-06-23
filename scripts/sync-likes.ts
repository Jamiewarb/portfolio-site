import 'dotenv/config';

import { syncLikeCountsToGit } from '../src/lib/likes/git/sync.ts';

async function main() {
  const { changed, synced, total } = await syncLikeCountsToGit();

  if (total === 0) {
    console.log('No likes to sync');
    return;
  }

  if (!changed) {
    console.log('Likes manifest unchanged — no file write needed');
    return;
  }

  console.log(`Wrote ${synced} post like total(s) to src/data/likes.json`);
}

main().catch((error) => {
  console.error('[likes sync] Failed:', error);
  process.exitCode = 1;
});
