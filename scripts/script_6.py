# Create remaining API routes
def create_remaining_api_routes():
    
    # src/app/api/requests/route.ts
    requests_route = '''import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { 
  getAllRequests, 
  getRequestsByUserId, 
  createRequest, 
  getBookById,
  updateRequest
} from '@/lib/database';
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
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let requests;

    if (user.role === 'admin') {
      // Admin can see all requests
      if (userId) {
        requests = getRequestsByUserId(userId);
      } else {
        requests = getAllRequests();
      }
    } else {
      // Users can only see their own requests
      requests = getRequestsByUserId(user.id);
    }

    // Filter by status if provided
    if (status) {
      requests = requests.filter(req => req.status === status);
    }

    // Populate with book and user info
    const populatedRequests = requests.map(req => {
      const book = getBookById(req.book_id);
      return {
        ...req,
        book: book ? {
          id: book.id,
          title: book.title,
          author: book.author,
          imageUrl: book.image_url
        } : null
      };
    });

    return NextResponse.json(
      createApiResponse(true, populatedRequests)
    );
  } catch (error) {
    console.error('Get requests error:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        createApiResponse(false, null, 'Authentication required'),
        { status: 401 }
      );
    }

    const { bookId, notes } = await request.json();

    if (!bookId) {
      return NextResponse.json(
        createApiResponse(false, null, 'Book ID is required'),
        { status: 400 }
      );
    }

    // Check if book exists
    const book = getBookById(bookId);
    if (!book) {
      return NextResponse.json(
        createApiResponse(false, null, 'Book not found'),
        { status: 404 }
      );
    }

    // Check if user already has a pending request for this book
    const existingRequests = getRequestsByUserId(user.id);
    const existingRequest = existingRequests.find(
      req => req.book_id === bookId && req.status === 'pending'
    );

    if (existingRequest) {
      return NextResponse.json(
        createApiResponse(false, null, 'You already have a pending request for this book'),
        { status: 409 }
      );
    }

    // Create new request
    const newRequest = createRequest({
      id: uuidv4(),
      book_id: bookId,
      user_id: user.id,
      status: 'pending',
      notes
    });

    return NextResponse.json(
      createApiResponse(true, newRequest, null, 'Request submitted successfully')
    );
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}
'''
    
    # src/app/api/requests/[id]/route.ts
    requests_by_id = '''import { NextRequest, NextResponse } from 'next/server';
import { getRequestById, updateRequest } from '@/lib/database';
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

    const bookRequest = getRequestById(params.id);
    
    if (!bookRequest) {
      return NextResponse.json(
        createApiResponse(false, null, 'Request not found'),
        { status: 404 }
      );
    }

    // Check if user can access this request
    if (user.role !== 'admin' && bookRequest.user_id !== user.id) {
      return NextResponse.json(
        createApiResponse(false, null, 'Access denied'),
        { status: 403 }
      );
    }

    return NextResponse.json(
      createApiResponse(true, bookRequest)
    );
  } catch (error) {
    console.error('Get request error:', error);
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

    const { status, rejectionReason } = await request.json();
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Valid status (approved/rejected) is required'),
        { status: 400 }
      );
    }

    const updates: any = {
      status,
      approved_by: user.id
    };

    if (status === 'approved') {
      updates.approved_at = new Date().toISOString();
    } else if (status === 'rejected') {
      updates.rejected_at = new Date().toISOString();
      updates.rejection_reason = rejectionReason;
    }

    const updatedRequest = updateRequest(params.id, updates);
    
    if (!updatedRequest) {
      return NextResponse.json(
        createApiResponse(false, null, 'Request not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createApiResponse(true, updatedRequest, null, `Request ${status} successfully`)
    );
  } catch (error) {
    console.error('Update request error:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}
'''
    
    # src/app/api/users/route.ts
    users_route = '''import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/database';
import { authenticateRequest } from '@/lib/auth';
import { createApiResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const user = authenticateRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        createApiResponse(false, null, 'Admin access required'),
        { status: 403 }
      );
    }

    const users = getAllUsers();
    
    // Remove sensitive information
    const safeUsers = users.map(dbUser => ({
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
      avatar: dbUser.avatar,
      permissions: dbUser.permissions ? JSON.parse(dbUser.permissions) : null
    }));

    return NextResponse.json(
      createApiResponse(true, safeUsers)
    );
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}
'''
    
    # src/app/api/settings/route.ts
    settings_route = '''import { NextRequest, NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/database';
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
    const key = searchParams.get('key');

    if (key) {
      const value = getSetting(key);
      const parsedValue = value ? JSON.parse(value) : null;
      
      return NextResponse.json(
        createApiResponse(true, { [key]: parsedValue })
      );
    }

    // Return common settings
    const settings = {
      general: getSetting('general') ? JSON.parse(getSetting('general')!) : {
        applicationTitle: 'Bookseerr',
        applicationUrl: '',
        enableRegistration: true,
        defaultPermissions: {
          canRequest: true,
          canApprove: false,
          canManageUsers: false,
          canConfigureSettings: false,
          maxRequests: 10
        }
      },
      readarr: getSetting('readarr') ? JSON.parse(getSetting('readarr')!) : {
        url: '',
        apiKey: '',
        rootFolder: '/books',
        qualityProfile: 'Standard',
        enabled: false
      },
      qbittorrent: getSetting('qbittorrent') ? JSON.parse(getSetting('qbittorrent')!) : {
        url: '',
        username: '',
        password: '',
        downloadPath: '/downloads',
        category: 'books',
        enabled: false
      }
    };

    return NextResponse.json(
      createApiResponse(true, settings)
    );
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = authenticateRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        createApiResponse(false, null, 'Admin access required'),
        { status: 403 }
      );
    }

    const settings = await request.json();

    // Save each setting section
    for (const [key, value] of Object.entries(settings)) {
      setSetting(key, JSON.stringify(value));
    }

    return NextResponse.json(
      createApiResponse(true, settings, null, 'Settings updated successfully')
    );
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}
'''
    
    # src/app/api/integrations/readarr/test/route.ts
    readarr_test = '''import { NextRequest, NextResponse } from 'next/server';
import { getSetting } from '@/lib/database';
import { authenticateRequest } from '@/lib/auth';
import { createApiResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const user = authenticateRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        createApiResponse(false, null, 'Admin access required'),
        { status: 403 }
      );
    }

    const { url, apiKey } = await request.json();

    if (!url || !apiKey) {
      return NextResponse.json(
        createApiResponse(false, null, 'URL and API key are required'),
        { status: 400 }
      );
    }

    // Mock Readarr connection test
    // In real implementation, this would make an actual API call to Readarr
    const mockSuccess = true;
    
    if (mockSuccess) {
      return NextResponse.json(
        createApiResponse(true, {
          status: 'connected',
          version: '0.4.18.2734',
          rootFolders: [
            { id: 1, path: '/books', accessible: true }
          ],
          qualityProfiles: [
            { id: 1, name: 'Standard' },
            { id: 2, name: 'High Quality' }
          ]
        }, null, 'Successfully connected to Readarr')
      );
    } else {
      return NextResponse.json(
        createApiResponse(false, null, 'Failed to connect to Readarr'),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Readarr test error:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}
'''
    
    # src/app/api/integrations/qbittorrent/test/route.ts
    qbittorrent_test = '''import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { createApiResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const user = authenticateRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        createApiResponse(false, null, 'Admin access required'),
        { status: 403 }
      );
    }

    const { url, username, password } = await request.json();

    if (!url || !username || !password) {
      return NextResponse.json(
        createApiResponse(false, null, 'URL, username, and password are required'),
        { status: 400 }
      );
    }

    // Mock QBittorrent connection test
    // In real implementation, this would make an actual API call to QBittorrent
    const mockSuccess = true;
    
    if (mockSuccess) {
      return NextResponse.json(
        createApiResponse(true, {
          status: 'connected',
          version: '4.6.5',
          preferences: {
            save_path: '/downloads',
            max_active_downloads: 3
          }
        }, null, 'Successfully connected to QBittorrent')
      );
    } else {
      return NextResponse.json(
        createApiResponse(false, null, 'Failed to connect to QBittorrent'),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('QBittorrent test error:', error);
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    );
  }
}
'''
    
    # Create directories and write files
    additional_routes = [
        ("bookseerr/src/app/api/requests/route.ts", requests_route),
        ("bookseerr/src/app/api/requests/[id]/route.ts", requests_by_id),
        ("bookseerr/src/app/api/users/route.ts", users_route),
        ("bookseerr/src/app/api/settings/route.ts", settings_route),
        ("bookseerr/src/app/api/integrations/readarr/test/route.ts", readarr_test),
        ("bookseerr/src/app/api/integrations/qbittorrent/test/route.ts", qbittorrent_test)
    ]
    
    for file_path, content in additional_routes:
        # Create directory if needed
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            f.write(content)
    
    return "Additional API routes created"

print(create_remaining_api_routes())