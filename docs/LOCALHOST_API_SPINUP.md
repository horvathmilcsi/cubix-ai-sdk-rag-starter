# Localhost Spinup Guide for API use

This guide will walk you through setting up and running the RAG system on localhost so you can call the API endpoints.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) package manager (v9.6.0+)
- [Docker](https://www.docker.com/) and Docker Compose
- [OpenAI API Key](https://platform.openai.com/api-keys)

## Setup Steps

### 1. Install Dependencies

Install all project dependencies using pnpm:

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rag_starter
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

**Important:** Replace `your_openai_api_key_here` with your actual OpenAI API key.

The `DATABASE_URL` matches the default PostgreSQL configuration in `docker-compose.yml`.

### 3. Start the Database

Start the PostgreSQL database with pgvector extension using Docker Compose:

```bash
docker-compose up -d
```

This will start a PostgreSQL container on port `5432` with:
- Database name: `rag_starter`
- Username: `postgres`
- Password: `postgres`

### 4. Run Database Migrations

Apply the database schema migrations:

```bash
pnpm db:migrate
```

This creates the necessary tables (`resources` and `embeddings`) in the database.

### 5. Start the Development Server

Start the Next.js development server:

```bash
pnpm dev
```

The API will be available at `http://localhost:3000`. The server runs in development mode with hot-reloading enabled.

## Verifying the Setup

Once the server is running, you can verify the API is accessible by making a simple POST request to create a test resource:

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"content":"Test resource","chunkingStrategy":"none"}'
```

**Using PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/resources" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"content":"Test resource","chunkingStrategy":"none"}'
```

If successful, you should receive a response with `"success": true`.

## Testing the API

### Using batch_upload_recipes.py

The `batch_upload_recipes.py` script provides an example of how to use the API by uploading multiple resources from markdown and text files.

**Prerequisites for the script:**
- Python 3.x
- `requests` library (`pip install requests`)

**Before running the script:**

1. Ensure the API server is running (see step 5 above)
2. Update the `RECIPES_FOLDER` path in `batch_upload_recipes.py` to point to your recipes directory (or create the expected folder structure)

**Running the script:**

```bash
python batch_upload_recipes.py
```

The script will:
- Scan for `.md` and `.txt` files in the specified recipes folder
- Upload each file to the `/api/resources` endpoint
- Use different chunking strategies based on file type:
  - `.md` files → `"none"` chunking strategy
  - `.txt` files → `"."` (sentence-based) chunking strategy
- Display progress and results for each file

**Example output:**
```
Scanning for .md and .txt files in: C:\Repos\Recipes\recipes
Found 5 file(s)
------------------------------------------------------------

[1/5] Processing: recipe1.md
  📄 Content length: 1523 characters
  🔧 Chunking strategy: none
  ✅ Success: Resource successfully created.

[2/5] Processing: recipe2.txt
  📄 Content length: 2876 characters
  🔧 Chunking strategy: .
  ✅ Success: Resource successfully created.

...

============================================================
BATCH UPLOAD SUMMARY
============================================================
Total files processed: 5
✅ Successful: 5
❌ Failed: 0
============================================================
```

### Manual API Testing

You can also test the API manually using the examples provided in [API_RESOURCES.md](./API_RESOURCES.md).

**Example: Create a resource with curl**
```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "content": "The Eiffel Tower is located in Paris, France. It was completed in 1889 and stands 330 meters tall.",
    "chunkingStrategy": "."
  }'
```

## Troubleshooting

### Database Connection Issues

- **Error: "Connection refused"**
  - Ensure Docker is running
  - Check that the PostgreSQL container is up: `docker-compose ps`
  - Verify the container is healthy: `docker-compose logs postgres`

### Environment Variable Issues

- **Error: "DATABASE_URL is required"**
  - Ensure `.env` file exists in the root directory
  - Check that all required variables are set (see step 2)

### API Key Issues

- **Error: "OPENAI_API_KEY is required"**
  - Verify your OpenAI API key is correctly set in `.env`
  - Ensure the API key is valid and has sufficient credits

### Port Conflicts

- **Error: "Port 3000 is already in use"**
  - Stop any other processes using port 3000
  - Or change the port by modifying `next.config.mjs` or using `pnpm dev -- -p 3001`

## Stopping the System

To stop the development server, press `Ctrl+C` in the terminal where it's running.

To stop the database:

```bash
docker-compose down
```

To stop and remove all data (volumes):

```bash
docker-compose down -v
```

## Next Steps

Once the system is running:

1. Upload resources using the API (see `batch_upload_recipes.py` or [API_RESOURCES.md](./API_RESOURCES.md))
2. Test the chat endpoint at `/api/chat` to query your knowledge base
3. Explore the web interface at `http://localhost:3000`

For more information about the API endpoints, see [API_RESOURCES.md](./API_RESOURCES.md).

