// `trellis config` commands: get · set  (operate on trellis.config.json; ADR 0006)
import { ok, fail, requireProject, readFile, writeFile } from '../lib/util.mjs';

async function readConfig(configPath) {
  return JSON.parse(await readFile(configPath, 'utf8'));
}

function getPath(obj, dotted) {
  return dotted.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function setPath(obj, dotted, value) {
  const keys = dotted.split('.');
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (typeof o[keys[i]] !== 'object' || o[keys[i]] == null) o[keys[i]] = {};
    o = o[keys[i]];
  }
  o[keys[keys.length - 1]] = value;
}

/** Parse a CLI string into boolean / number / string. */
function coerce(raw) {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw !== '' && !Number.isNaN(Number(raw)) && /^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  return raw;
}

export async function configGet({ pos }) {
  const { configPath } = requireProject();
  const config = await readConfig(configPath);
  if (!pos[0]) return ok({ action: 'config get', config });
  const value = getPath(config, pos[0]);
  if (value === undefined) return fail(`key not found: ${pos[0]}`);
  return ok({ action: 'config get', key: pos[0], value });
}

export async function configSet({ pos }) {
  const { configPath } = requireProject();
  const key = pos[0];
  if (!key || pos[1] === undefined) return fail('usage: config set <key> <value>   (key may be dotted, e.g. features.tooltips)');
  const config = await readConfig(configPath);
  const value = coerce(pos[1]);
  setPath(config, key, value);
  await writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
  return ok({ action: 'config set', key, value });
}
