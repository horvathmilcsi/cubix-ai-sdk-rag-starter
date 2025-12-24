# Codebase Explanation



## Brief Overview



A **RAG (Retrieval-Augmented Generation)** chatbot starter using the Vercel AI SDK. It answers only from its knowledge base.



## Core Functionality



### Knowledge Base Storage



Users can add resources (text) that are:



- Stored in **PostgreSQL** (`resources` table)

- Split into chunks (by sentences)

- Embedded using OpenAI's `text-embedding-3-small` (1536 dimensions)

- Stored in an `embeddings` table with **pgvector** for similarity search



### Chat Interface



A Next.js chat UI that:



- Uses the Vercel AI SDK React hooks

- Shows messages with collapsible tool call details

- Streams responses in real time



### AI Tools



The chatbot has two tools:



- **`addResource`**: Adds new content to the knowledge base

- **`getInformation`**: Searches the knowledge base using vector similarity (cosine distance) to find relevant content



## Tech Stack



- **Next.js 14** (App Router) with TypeScript

- **Vercel AI SDK** with OpenAI (`gpt-5` model)

- **PostgreSQL** with pgvector for vector search

- **Drizzle ORM** for database management

- **shadcn-ui** + TailwindCSS for UI



## How It Works



When a user asks a question:



1. The query is embedded into a vector
→ lib/ai/embedding.ts (generateEmbedding)

2. The system searches for similar embeddings (similarity > `0.3`)
→ lib/ai/embedding.ts (findRelevantContent)

3. The top **4** most relevant chunks are retrieved

4. The LLM uses this context to generate an answer
→ app/api/chat/route.ts (streamText and getInformation tool)

5. If no relevant info is found, it responds: *"Sorry, I don't know."*
→ app/api/chat/route.ts (system prompt)


The system is constrained to only use information from its knowledge base, making it suitable for:

- Customer support

- Documentation Q&A

- Personal knowledge management



## Most Important Files in the Codebase



### API & Chat Logic

- **`app/api/chat/route.ts`** - Main API endpoint that handles chat requests. Defines the AI tools (`addResource`, `getInformation`), configures the LLM with system prompts, and streams responses.

- **`app/page.tsx`** - The chat UI component. Uses Vercel AI SDK's `useChat` hook to display messages and tool call details with collapsible sections.



### Embedding & Vector Search

- **`lib/ai/embedding.ts`** - Core RAG functionality:
  - `generateEmbedding()` - Converts text queries into vectors
  - `generateEmbeddings()` - Creates embeddings for resource chunks
  - `findRelevantContent()` - Performs vector similarity search (cosine distance) to find relevant content chunks



### Data Management

- **`lib/actions/resources.ts`** - Server action that creates resources. Handles chunking, embedding generation, and storing both the resource and its embeddings in the database.

- **`lib/db/schema/resources.ts`** - Database schema definitions using Drizzle ORM:
  - `resources` table - Stores original text content
  - `embeddings` table - Stores chunked content with pgvector embeddings (1536 dimensions)

