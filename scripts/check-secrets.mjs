import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const ignoredDirectories = new Set([
  '.git',
  '.astro',
  '.npm-cache',
  'dist',
  'node_modules',
]);
const textExtensions = new Set([
  '',
  '.astro',
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.svg',
  '.ts',
  '.txt',
  '.yaml',
  '.yml',
]);
const maximumFileSize = 1_000_000;
const findings = [];

const signatures = [
  ['private key', new RegExp(`BEGIN (?:RSA |EC |OPENSSH )?PRIVATE ${'KEY'}`)],
  ['GitHub token', new RegExp(`gh[pousr]_[A-Za-z0-9]{36,}`)],
  ['GitHub fine-grained token', new RegExp(`github_pat_[A-Za-z0-9_]{40,}`)],
  ['AWS access key', new RegExp(`AKIA[0-9A-Z]{16}`)],
  [
    'embedded credential',
    new RegExp(
      String.raw`(?:api[_-]?key|client[_-]?secret|password|passwd|secret|token)\s*[:=]\s*["'](?!example|placeholder|replace-me|changeme)[^"'\s]{12,}["']`,
      'i',
    ),
  ],
];

async function inspect(path) {
  const fileStat = await stat(path);
  if (fileStat.isDirectory()) {
    if (ignoredDirectories.has(path.split(/[\\/]/).at(-1))) return;
    for (const entry of await readdir(path)) await inspect(join(path, entry));
    return;
  }

  const repositoryPath = relative(root, path).replaceAll('\\', '/');
  const filename = repositoryPath.split('/').at(-1);
  if (filename?.startsWith('.env') && !filename.endsWith('.example')) {
    findings.push(`${repositoryPath}: archivo de entorno privado`);
    return;
  }
  if (
    fileStat.size > maximumFileSize ||
    !textExtensions.has(extname(path).toLowerCase())
  )
    return;

  const content = await readFile(path, 'utf8');
  for (const [label, signature] of signatures) {
    if (signature.test(content)) findings.push(`${repositoryPath}: ${label}`);
  }
}

await inspect(root);

if (findings.length > 0) {
  console.error(
    'Potential secrets detected:\n' +
      findings.map((item) => `- ${item}`).join('\n'),
  );
  process.exit(1);
}

console.log(
  'Secret scan passed: no private keys, known tokens, embedded credentials, or private .env files detected.',
);
