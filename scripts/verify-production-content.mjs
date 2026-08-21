import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function filesUnder(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(path)));
    else files.push(path);
  }
  return files;
}

const sourceFiles = (await filesUnder('src/content/projects')).filter((path) =>
  path.endsWith('.json'),
);
const generatedFiles = (await filesUnder('dist')).filter(
  (path) => path.endsWith('.html') || path.endsWith('.xml'),
);
const generated = (
  await Promise.all(generatedFiles.map((path) => readFile(path, 'utf8')))
).join('\n');
const leaked = [];

for (const path of sourceFiles) {
  const entry = JSON.parse(await readFile(path, 'utf8'));
  if (
    entry.review.visibility !== 'public' &&
    (generated.includes(entry.title) ||
      generated.includes(path.split(/[\\/]/).at(-1).replace('.json', '')))
  ) {
    leaked.push(`${entry.title} (${entry.review.visibility})`);
  }
}

if (leaked.length > 0) {
  console.error(
    `Non-public content leaked into the production build:\n${leaked.join('\n')}`,
  );
  process.exit(1);
}

console.log(
  'Production content policy passed: no private or preview entries were generated.',
);
