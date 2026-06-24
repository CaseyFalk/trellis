/**
 * Convert ```mermaid fenced code blocks into <pre class="mermaid"> at the
 * mdast stage — before Expressive Code touches code blocks — so the client
 * mermaid script (see src/components/Head.astro) can render them as diagrams.
 */
export default function remarkMermaid() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.type === 'code' && child.lang === 'mermaid') {
          const escaped = child.value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          return { type: 'html', value: `<pre class="mermaid">${escaped}</pre>` };
        }
        return child;
      });
      node.children.forEach(walk);
    };
    walk(tree);
  };
}
