import { getCollection, type CollectionEntry } from 'astro:content';

type Doc = CollectionEntry<'docs'>;

/** Routes that exist outside the `docs` collection but are valid link targets. */
const EXTRA_ROUTES = new Set(['', 'concept-graph']);

/** True for the journal index (`journal`) and any journal entry (`journal/...`).
 *  Journal pages are provenance, excluded from backlinks and the concept graph. */
function isJournal(id: string): boolean {
  return id === 'journal' || id.startsWith('journal/');
}

/** Normalize a collection id or path into a canonical, slash-trimmed slug.
 *  e.g. 'guides/index' -> 'guides', 'Concepts/Quantization' -> 'concepts/quantization'. */
export function canonical(id: string): string {
  return id
    .replace(/\.(md|mdx)$/i, '')
    .replace(/(^|\/)index$/i, '$1')
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();
}

/** Resolve a markdown link href to a canonical slug, or null if external/non-page. */
function hrefToCanonical(href: string, fromDir: string): string | null {
  if (!href) return null;
  if (/^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('#')) {
    return null;
  }
  const path = href.split('#')[0].split('?')[0];
  if (!path) return null;
  if (path.startsWith('/')) return canonical(path);

  // Relative link — resolve against the linking page's directory.
  const parts = fromDir ? fromDir.split('/') : [];
  for (const seg of path.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return canonical(parts.join('/'));
}

// Markdown links [text](href), excluding images (negative lookbehind on '!').
const LINK_RE = /(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

function extractTargets(doc: Doc): string[] {
  const body = doc.body ?? '';
  const fromDir = canonical(doc.id).split('/').slice(0, -1).join('/');
  const out = new Set<string>();
  for (const match of body.matchAll(LINK_RE)) {
    const target = hrefToCanonical(match[1], fromDir);
    if (target !== null) out.add(target);
  }
  return [...out];
}

async function buildGraph() {
  const docs = await getCollection('docs');
  const byId = new Map<string, Doc>(docs.map((d) => [canonical(d.id), d]));
  const valid = new Set<string>([...byId.keys(), ...EXTRA_ROUTES]);

  const outgoing = new Map<string, Set<string>>();
  const edges: { source: string; target: string }[] = [];

  for (const doc of docs) {
    const from = canonical(doc.id);
    const targets = extractTargets(doc).filter((t) => valid.has(t) && t !== from);
    outgoing.set(from, new Set(targets));
    for (const target of targets) edges.push({ source: from, target });
  }

  return { docs, byId, outgoing, edges };
}

/** Pages that link TO the given page. */
export async function getBacklinks(id: string) {
  const { byId, outgoing } = await buildGraph();
  const target = canonical(id);
  const result: { id: string; title: string; href: string }[] = [];
  for (const [from, targets] of outgoing) {
    // Journal entries link to pages as provenance — that relationship is shown
    // in the "Sources" box, so they're excluded from backlinks here.
    if (isJournal(from)) continue;
    if (targets.has(target)) {
      const doc = byId.get(from);
      if (doc) result.push({ id: from, title: doc.data.title, href: `/${from}/` });
    }
  }
  return result.sort((a, b) => a.title.localeCompare(b.title));
}

/** Nodes + edges for the concept graph. */
export async function getGraphData() {
  const { docs, edges } = await buildGraph();
  // Journal entries are provenance, not concepts — omit them (and their edges)
  // so the map shows how concepts link, not the capture history.
  const nodes = docs
    .map((doc) => {
      const id = canonical(doc.id);
      return {
        id,
        label: doc.data.title,
        group: id.split('/')[0] || 'home',
        tags: doc.data.tags ?? [],
      };
    })
    // Exclude the home/splash page (empty id) and journal pages — neither is a
    // concept. An empty id also crashes Cytoscape, blanking the whole graph.
    .filter((n) => n.id !== '' && !isJournal(n.id));
  const ids = new Set(nodes.map((n) => n.id));
  return { nodes, edges: edges.filter((e) => ids.has(e.source) && ids.has(e.target)) };
}
