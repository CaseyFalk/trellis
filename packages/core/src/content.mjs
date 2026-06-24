// The `docs` content collection + Trellis frontmatter schema, layered onto
// Starlight's own schema. The in-project `src/content.config.ts` shim re-exports
// `collections` from here (ADR: Q2), so the schema is versioned in @trellis/core.
import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      // See conventions.md "Frontmatter schema" for the authoritative definition.
      extend: z.object({
        tags: z.array(z.string()).default([]),
        sources: z.array(z.string()).default([]),
        maturity: z.enum(['seedling', 'growing', 'established']).optional(),
      }),
    }),
  }),
};
