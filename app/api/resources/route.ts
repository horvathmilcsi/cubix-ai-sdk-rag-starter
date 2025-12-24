import { createResource } from '@/lib/actions/resources';
import { NextResponse } from 'next/server';

// Test:
// Invoke-RestMethod -Uri "http://localhost:3000/api/resources" -Method POST -ContentType "application/json" -Body '{"content":"The Eiffel Tower is located in Paris, France. It was completed in 1889 and stands 330 meters tall.","chunkingStrategy":"."}'
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, chunkingStrategy } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    if (chunkingStrategy && !['.', '#', 'none'].includes(chunkingStrategy)) {
      return NextResponse.json(
        { error: 'chunkingStrategy must be ".", "#", or "none"' },
        { status: 400 }
      );
    }

    const result = await createResource({ 
      content, 
      chunkingStrategy: chunkingStrategy || '.' 
    });

    return NextResponse.json(
      { 
        success: true, 
        message: result,
        data: { content }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create resource' 
      },
      { status: 500 }
    );
  }
}

