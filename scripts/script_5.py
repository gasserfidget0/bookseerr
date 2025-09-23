# Create API routes
def create_api_routes():
    
    # src/app/api/auth/login/route.ts
    auth_login = '''import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getUserByEmail } from '@/lib/database';
import { verifyPassword, generateToken, databaseUserToUser } from '@/lib/auth';
import { createApiResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        createApiResponse(false, null, 'Username and password are required'),
        { status: 400 }
      );
    }

    // Find user by username or email
    let dbUser = getUserByUsername(username);
    if (!dbUser && username.includes('@')) {
      dbUser = getUserByEmail(username);
    }

    if (!dbUser) {
      return NextResponse.json(
        createApiResponse(false, null, 'Invalid credentials'),
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, dbUser.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        createApiResponse(false, null, 'Invalid credentials'),
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(dbUser);
    const user = databaseUserToUser(dbUser);

    const response = NextResponse.json(
      createApiResponse(true, {
        user,
        token,
        expiresAt: new Date(Date.now() + parseInt(process.env.JWT_EXPIRES_IN || '3600') * 1000).toISOString()
      }, null, 'Login successful')
    );

    // Set HTTP-only cookie
    const maxAge = parseInt(process.env.JWT_EXPIRES_IN || '3600');
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}
'''
    
    # src/app/api/auth/register/route.ts
    auth_register = '''import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createUser, getUserByUsername, getUserByEmail } from '@/lib/database';
import { hashPassword, generateToken, databaseUserToUser } from '@/lib/auth';
import { createApiResponse, isValidEmail, isValidUsername, isValidPassword } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        createApiResponse(false, null, 'Username, email, and password are required'),
        { status: 400 }
      );
    }

    if (!isValidUsername(username)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Username must be 3-20 characters and contain only letters, numbers, and underscores'),
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Invalid email format'),
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Password must be at least 6 characters long'),
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserByUsername = getUserByUsername(username);
    if (existingUserByUsername) {
      return NextResponse.json(
        createApiResponse(false, null, 'Username already exists'),
        { status: 409 }
      );
    }

    const existingUserByEmail = getUserByEmail(email);
    if (existingUserByEmail) {
      return NextResponse.json(
        createApiResponse(false, null, 'Email already exists'),
        { status: 409 }
      );
    }

    // Create new user
    const userId = uuidv4();
    const passwordHash = hashPassword(password);
    
    const dbUser = createUser({
      id: userId,
      username,
      email,
      password_hash: passwordHash,
      role: 'user',
      permissions: JSON.stringify({
        canRequest: true,
        canApprove: false,
        canManageUsers: false,
        canConfigureSettings: false,
        maxRequests: 10
      })
    });

    // Generate JWT token
    const token = generateToken(dbUser);
    const user = databaseUserToUser(dbUser);

    const response = NextResponse.json(
      createApiResponse(true, {
        user,
        token,
        expiresAt: new Date(Date.now() + parseInt(process.env.JWT_EXPIRES_IN || '3600') * 1000).toISOString()
      }, null, 'Registration successful')
    );

    // Set HTTP-only cookie
    const maxAge = parseInt(process.env.JWT_EXPIRES_IN || '3600');
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}
'''
    
    # src/app/api/auth/logout/route.ts
    auth_logout = '''import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    createApiResponse(true, null, null, 'Logout successful')
  );

  // Clear auth cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  return response;
}
'''
    
    # src/app/api/auth/me/route.ts
    auth_me = '''import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { createApiResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = authenticateRequest(request);

    if (!user) {
      return NextResponse.json(
        createApiResponse(false, null, 'Authentication required'),
        { status: 401 }
      );
    }

    return NextResponse.json(
      createApiResponse(true, { user })
    );
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}
'''
    
    # src/app/api/books/route.ts
    books_route = '''import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { searchBooks, createBook } from '@/lib/database';
import { authenticateRequest } from '@/lib/auth';
import { createApiResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        createApiResponse(false, null, 'Authentication required'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || undefined;
    const author = searchParams.get('author') || undefined;
    const category = searchParams.get('category') || undefined;
    const available = searchParams.get('available') ? searchParams.get('available') === 'true' : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const offset = (page - 1) * limit;

    const { books, total } = searchBooks({
      query,
      author,
      category,
      available,
      limit,
      offset
    });

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };

    return NextResponse.json(
      createApiResponse(true, { books, pagination })
    );
  } catch (error) {
    console.error('Get books error:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = authenticateRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        createApiResponse(false, null, 'Admin access required'),
        { status: 403 }
      );
    }

    const bookData = await request.json();
    
    if (!bookData.title || !bookData.author) {
      return NextResponse.json(
        createApiResponse(false, null, 'Title and author are required'),
        { status: 400 }
      );
    }

    const book = createBook({
      id: uuidv4(),
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn,
      published_date: bookData.publishedDate,
      description: bookData.description,
      page_count: bookData.pageCount,
      categories: bookData.categories ? JSON.stringify(bookData.categories) : null,
      image_url: bookData.imageUrl,
      available: bookData.available || false,
      google_books_id: bookData.googleBooksId,
      goodreads_id: bookData.goodreadsId
    });

    return NextResponse.json(
      createApiResponse(true, book, null, 'Book created successfully')
    );
  } catch (error) {
    console.error('Create book error:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}
'''
    
    # src/app/api/books/[id]/route.ts
    books_by_id = '''import { NextRequest, NextResponse } from 'next/server';
import { getBookById, updateBook } from '@/lib/database';
import { authenticateRequest } from '@/lib/auth';
import { createApiResponse } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        createApiResponse(false, null, 'Authentication required'),
        { status: 401 }
      );
    }

    const book = getBookById(params.id);
    
    if (!book) {
      return NextResponse.json(
        createApiResponse(false, null, 'Book not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createApiResponse(true, book)
    );
  } catch (error) {
    console.error('Get book error:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        createApiResponse(false, null, 'Admin access required'),
        { status: 403 }
      );
    }

    const updates = await request.json();
    const book = updateBook(params.id, updates);
    
    if (!book) {
      return NextResponse.json(
        createApiResponse(false, null, 'Book not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createApiResponse(true, book, null, 'Book updated successfully')
    );
  } catch (error) {
    console.error('Update book error:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}
'''
    
    # Create directories and write files
    api_routes = [
        ("bookseerr/src/app/api/auth/login/route.ts", auth_login),
        ("bookseerr/src/app/api/auth/register/route.ts", auth_register),
        ("bookseerr/src/app/api/auth/logout/route.ts", auth_logout),
        ("bookseerr/src/app/api/auth/me/route.ts", auth_me),
        ("bookseerr/src/app/api/books/route.ts", books_route),
        ("bookseerr/src/app/api/books/[id]/route.ts", books_by_id)
    ]
    
    for file_path, content in api_routes:
        # Create directory if needed
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            f.write(content)
    
    return "API routes created"

print(create_api_routes())