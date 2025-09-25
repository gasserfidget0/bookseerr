# Create main app pages and layout
def create_app_pages():
    
    # src/app/layout.tsx - Root layout
    root_layout = '''import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bookseerr - Book Request Management',
  description: 'A modern book request management system for your digital library',
  keywords: ['books', 'request', 'management', 'library', 'digital', 'overseerr'],
  authors: [{ name: 'Bookseerr' }],
  creator: 'Bookseerr',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
'''
    
    # src/app/globals.css
    globals_css = '''@tailwind base;
@tailwind components;  
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.0%;

    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  @apply bg-muted/20;
}

::-webkit-scrollbar-thumb {
  @apply bg-muted-foreground/20 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-muted-foreground/40;
}

/* Loading animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Card hover effects */
.card-hover {
  @apply transition-all duration-200 hover:scale-[1.02] hover:shadow-lg;
}

/* Button styles */
.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary;
}

.btn-secondary {
  @apply bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary;
}

.btn-destructive {
  @apply bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive;
}

/* Status indicators */
.status-pending {
  @apply bg-yellow-500/10 text-yellow-400 border-yellow-500/20;
}

.status-approved {
  @apply bg-green-500/10 text-green-400 border-green-500/20;
}

.status-rejected {
  @apply bg-red-500/10 text-red-400 border-red-500/20;
}

.status-completed {
  @apply bg-blue-500/10 text-blue-400 border-blue-500/20;
}

.status-failed {
  @apply bg-red-500/10 text-red-400 border-red-500/20;
}
'''
    
    # src/app/page.tsx - Home page (redirects to dashboard or login)
    home_page = '''import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function HomePage() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth-token');

  if (authToken) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
'''
    
    # src/app/login/page.tsx - Login page
    login_page = '''import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-border/50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4-8h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h4v2h-4v-2z"/>
                </svg>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Bookseerr
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your book request management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground text-center">
                Demo credentials:
                <br />
                <span className="font-mono text-primary">admin / admin</span>
                {' or '}
                <span className="font-mono text-primary">reader / reader</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
'''
    
    # src/app/(dashboard)/layout.tsx - Dashboard layout with sidebar
    dashboard_layout = '''import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { AuthCheck } from '@/components/auth/auth-check';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <div className="lg:pl-64">
          <DashboardHeader />
          <main className="py-6 px-4 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthCheck>
  );
}
'''
    
    # src/app/(dashboard)/dashboard/page.tsx - Main dashboard
    dashboard_page = '''import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { QuickActions } from '@/components/dashboard/quick-actions';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your books.
        </p>
      </div>
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
'''
    
    # src/app/(dashboard)/discover/page.tsx - Book discovery
    discover_page = '''import { BookGrid } from '@/components/books/book-grid';
import { SearchAndFilters } from '@/components/books/search-and-filters';

export default function DiscoverPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Discover Books</h1>
        <p className="text-muted-foreground">
          Find your next favorite book and add it to your request list.
        </p>
      </div>
      
      <SearchAndFilters />
      <BookGrid />
    </div>
  );
}
'''
    
    # src/app/(dashboard)/requests/page.tsx - Request management
    requests_page = '''import { RequestsTable } from '@/components/requests/requests-table';

export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Requests</h1>
        <p className="text-muted-foreground">
          Manage all book requests in one place.
        </p>
      </div>
      
      <RequestsTable />
    </div>
  );
}
'''
    
    # src/app/(dashboard)/settings/page.tsx - Settings
    settings_page = '''import { SettingsTabs } from '@/components/settings/settings-tabs';
import { AdminOnly } from '@/components/auth/admin-only';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Configure your Bookseerr instance and integrations.
        </p>
      </div>
      
      <AdminOnly>
        <SettingsTabs />
      </AdminOnly>
    </div>
  );
}
'''
    
    # Write app pages
    app_files = [
        ("bookseerr/src/app/layout.tsx", root_layout),
        ("bookseerr/src/app/globals.css", globals_css),
        ("bookseerr/src/app/page.tsx", home_page),
        ("bookseerr/src/app/login/page.tsx", login_page),
        ("bookseerr/src/app/(dashboard)/layout.tsx", dashboard_layout),
        ("bookseerr/src/app/(dashboard)/dashboard/page.tsx", dashboard_page),
        ("bookseerr/src/app/(dashboard)/discover/page.tsx", discover_page),
        ("bookseerr/src/app/(dashboard)/requests/page.tsx", requests_page),
        ("bookseerr/src/app/(dashboard)/settings/page.tsx", settings_page)
    ]
    
    for file_path, content in app_files:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            f.write(content)
    
    return "App pages created"

print(create_app_pages())