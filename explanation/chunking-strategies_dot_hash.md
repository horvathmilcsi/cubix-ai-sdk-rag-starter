Summary of Changes



app/api/resources/route.ts:

Accepts chunkingStrategy from the request body

Validates it to be ".", "#", or "none"

Passes it to createResource (defaults to "." if not provided)



lib/actions/resources.ts:

Updated createResource to accept chunkingStrategy as an optional parameter

Extracts and passes it to generateEmbeddings



lib/ai/embedding.ts:

Updated generateEmbeddings to accept chunkingStrategy



Uses:

"." → splits by periods using generateChunks

"#" → splits by markdown headers using generateChunksMd

"none" → returns the whole content as a single chunk



The changes are backward compatible; existing calls to createResource without chunkingStrategy default to "." (period-based chunking). No linter errors, and the implementation is complete.

