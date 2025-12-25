# Resources API Documentation

## Overview

The Resources API provides an endpoint for creating and storing resources in the knowledge base. Resources are stored with associated embeddings that enable semantic search and retrieval capabilities.

**Base URL:** `/api/resources`

**Supported Methods:** `POST`

---

## Create Resource

Creates a new resource in the knowledge base with optional chunking strategy for embedding generation.

### Endpoint

```
POST /api/resources
```

### Request

#### Headers

```
Content-Type: application/json
```

#### Request Body

```json
{
  "content": "string (required)",
  "chunkingStrategy": "string (optional)"
}
```

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `content` | string | Yes | - | The content or resource text to add to the knowledge base |
| `chunkingStrategy` | string | No | `"."` | The strategy used to split content into chunks before generating embeddings. Valid values: `"."`, `"#"`, or `"none"` |

#### Chunking Strategies

- **`"."`** (default): Splits content by periods (`.`), creating chunks at sentence boundaries
- **`"#"`**: Splits content by Markdown headers (`#`, `##`, `###`), creating chunks based on document sections
- **`"none"`**: Treats the entire content as a single chunk without splitting

### Response

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Resource successfully created.",
  "data": {
    "content": "The content that was stored"
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid input parameters

```json
{
  "error": "Content is required and must be a string"
}
```

```json
{
  "error": "chunkingStrategy must be \".\", \"#\", or \"none\""
}
```

**500 Internal Server Error** - Server error during processing

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## Examples

### Example 1: Create Resource with Default Chunking (Sentence-based)

**Request:**

```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "content": "The Eiffel Tower is located in Paris, France. It was completed in 1889 and stands 330 meters tall."
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Resource successfully created.",
  "data": {
    "content": "The Eiffel Tower is located in Paris, France. It was completed in 1889 and stands 330 meters tall."
  }
}
```

### Example 2: Create Resource with Markdown Header Chunking

**Request:**

```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# Introduction\nThis is the introduction section.\n\n## Section 1\nThis is section 1 content.",
    "chunkingStrategy": "#"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Resource successfully created.",
  "data": {
    "content": "# Introduction\nThis is the introduction section.\n\n## Section 1\nThis is section 1 content."
  }
}
```

### Example 3: Create Resource as Single Chunk

**Request:**

```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Short piece of information that should not be split.",
    "chunkingStrategy": "none"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Resource successfully created.",
  "data": {
    "content": "Short piece of information that should not be split."
  }
}
```

### Example 4: PowerShell Request

**Request:**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/resources" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"content":"The Eiffel Tower is located in Paris, France. It was completed in 1889 and stands 330 meters tall.","chunkingStrategy":"."}'
```

---

## Implementation Details

### Processing Flow

1. **Validation**: The API validates that `content` is provided and is a string, and that `chunkingStrategy` (if provided) is one of the allowed values.

2. **Resource Creation**: The content is inserted into the `resources` table in the database.

3. **Embedding Generation**: 
   - Content is chunked according to the specified `chunkingStrategy`
   - Each chunk is converted to an embedding vector using OpenAI's `text-embedding-3-small` model (1536 dimensions)
   - Embeddings are stored in the `embeddings` table with references to the parent resource

4. **Response**: A success response is returned with the created resource information.

### Database Schema

- **Resources Table**: Stores the main resource content with `id`, `content`, `createdAt`, and `updatedAt` fields
- **Embeddings Table**: Stores vector embeddings for each chunk with `resourceId`, `content`, and `embedding` (1536-dimensional vector) fields

### Error Handling

- Input validation errors return `400 Bad Request`
- Server errors (database issues, embedding generation failures) return `500 Internal Server Error` with an error message
- All errors are logged to the server console for debugging

---

## Notes

- The default chunking strategy is `"."` (sentence-based) if not specified
- Embeddings enable semantic search and retrieval of resources based on content similarity
- Resources are immediately available for search after creation
- The API uses server-side actions to ensure secure database operations

