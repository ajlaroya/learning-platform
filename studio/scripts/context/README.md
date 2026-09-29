# Vertex Search Context

The Studio is on Sanity 5.31, while the current `@sanity/context/studio` plugin peer range does not support this Sanity major. Keep the plugin out of the Studio bundle and import the `sanity.agentContext` document directly instead.

Deploy the Studio application before testing Context MCP; a schema-only deploy is not enough. Then, from `studio/`, set `SANITY_STUDIO_DATASET` and run:

```bash
npm run context:import
```

The import replaces the document with ID `vertex-search`. The API uses its slug in `SANITY_CONTEXT_MCP_URL`. Edit the NDJSON document and rerun the import to update the search scope or instructions.
