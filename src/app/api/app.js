// Bookseerr Application Logic

class BookseerrApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.selectedBook = null;
        
        // Mock data from the provided JSON
        this.mockBooks = [
            {
                "id": "1",
                "title": "The Name of the Wind",
                "author": "Patrick Rothfuss",
                "isbn": "9780756404079",
                "publishedDate": "2007-03-27",
                "description": "The riveting first-person narrative of a young man who grows to be the most notorious magician his world has ever seen.",
                "pageCount": 662,
                "categories": ["Fantasy", "Fiction"],
                "imageUrl": "/api/placeholder/300/450",
                "available": false,
                "requested": false
            },
            {
                "id": "2", 
                "title": "Dune",
                "author": "Frank Herbert",
                "isbn": "9780441013593",
                "publishedDate": "1965-08-01",
                "description": "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.",
                "pageCount": 688,
                "categories": ["Science Fiction", "Fiction"],
                "imageUrl": "/api/placeholder/300/450", 
                "available": true,
                "requested": false
            },
            {
                "id": "3",
                "title": "The Hobbit",
                "author": "J.R.R. Tolkien", 
                "isbn": "9780547928227",
                "publishedDate": "1937-09-21",
                "description": "The enchanting prelude to The Lord of the Rings, The Hobbit tells the tale of Bilbo Baggins and his journey.",
                "pageCount": 366,
                "categories": ["Fantasy", "Adventure"],
                "imageUrl": "/api/placeholder/300/450",
                "available": true,
                "requested": false
            },
            {
                "id": "4",
                "title": "Neuromancer",
                "author": "William Gibson",
                "isbn": "9780441569595", 
                "publishedDate": "1984-07-01",
                "description": "Case was the sharpest data-thief in the business, until vengeful former employers crippled his nervous system.",
                "pageCount": 271,
                "categories": ["Cyberpunk", "Science Fiction"],
                "imageUrl": "/api/placeholder/300/450",
                "available": false,
                "requested": true
            },
            {
                "id": "5",
                "title": "The Martian",
                "author": "Andy Weir",
                "isbn": "9780553418026",
                "publishedDate": "2011-01-01", 
                "description": "Six days ago, astronaut Mark Watney became one of the first people to walk on Mars. Now, he's sure he'll be the first person to die there.",
                "pageCount": 369,
                "categories": ["Science Fiction", "Thriller"],
                "imageUrl": "/api/placeholder/300/450",
                "available": false,
                "requested": false
            }
        ];

        this.mockUsers = [
            {
                "id": "1",
                "username": "admin",
                "email": "admin@bookseerr.local",
                "role": "admin",
                "createdAt": "2024-01-01T00:00:00Z"
            },
            {
                "id": "2", 
                "username": "reader",
                "email": "reader@bookseerr.local",
                "role": "user",
                "createdAt": "2024-01-15T00:00:00Z"
            }
        ];

        this.mockRequests = [
            {
                "id": "1",
                "bookId": "4",
                "userId": "2",
                "status": "pending",
                "requestedAt": "2024-12-01T10:00:00Z",
                "notes": "Would love to read this classic cyberpunk novel"
            },
            {
                "id": "2",
                "bookId": "1", 
                "userId": "2",
                "status": "approved",
                "requestedAt": "2024-11-25T14:30:00Z",
                "approvedAt": "2024-11-26T09:15:00Z",
                "notes": "Heard great things about this fantasy series"
            }
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.navigateTo(page);
            });
        });

        // Book search
        document.getElementById('book-search').addEventListener('input', (e) => {
            this.filterBooks();
        });

        // Category filter
        document.getElementById('category-filter').addEventListener('change', () => {
            this.filterBooks();
        });

        // Status filter
        document.getElementById('status-filter').addEventListener('change', () => {
            this.filterBooks();
        });

        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('book-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('book-modal')) {
                this.closeModal();
            }
        });

        document.getElementById('request-book-btn').addEventListener('click', () => {
            this.requestBook();
        });

        document.getElementById('cancel-request-btn').addEventListener('click', () => {
            this.cancelRequest();
        });

        // Settings test connections
        document.querySelectorAll('.settings-card button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.textContent === 'Test Connection') {
                    this.testConnection(e.target);
                }
            });
        });
    }

    checkAuthStatus() {
        // Check if user is logged in (simulate session check)
        const storedUser = localStorage.getItem('bookseerr_user');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.showMainApp();
        } else {
            this.showLoginPage();
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simple demo authentication
        let user = null;
        if ((username === 'admin' && password === 'admin') || (username === 'admin@bookseerr.local' && password === 'admin')) {
            user = this.mockUsers.find(u => u.username === 'admin');
        } else if ((username === 'reader' && password === 'reader') || (username === 'reader@bookseerr.local' && password === 'reader')) {
            user = this.mockUsers.find(u => u.username === 'reader');
        }

        if (user) {
            this.currentUser = user;
            localStorage.setItem('bookseerr_user', JSON.stringify(user));
            this.showToast('Login successful!', 'success');
            this.showMainApp();
        } else {
            this.showToast('Invalid credentials. Try admin/admin or reader/reader', 'error');
        }
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('bookseerr_user');
        this.showToast('Logged out successfully', 'success');
        this.showLoginPage();
    }

    showLoginPage() {
        document.getElementById('login-page').classList.add('active');
        document.getElementById('main-app').classList.remove('active');
    }

    showMainApp() {
        document.getElementById('login-page').classList.remove('active');
        document.getElementById('main-app').classList.add('active');
        
        // Update current user display
        document.getElementById('current-user').textContent = this.currentUser.username;
        
        // Show/hide admin settings
        const adminSettings = document.getElementById('admin-settings');
        if (this.currentUser.role === 'admin') {
            adminSettings.style.display = 'block';
        } else {
            adminSettings.style.display = 'none';
        }

        this.navigateTo('dashboard');
    }

    navigateTo(page) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-page').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${page}-content`).classList.add('active');

        this.currentPage = page;

        // Load page-specific content
        switch (page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'discover':
                this.loadDiscover();
                break;
            case 'requests':
                this.loadRequests();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    loadDashboard() {
        // Update stats
        const totalBooks = this.mockBooks.length;
        const availableBooks = this.mockBooks.filter(book => book.available).length;
        const pendingRequests = this.mockRequests.filter(req => req.status === 'pending').length;
        const totalUsers = this.mockUsers.length;

        document.getElementById('total-books').textContent = totalBooks;
        document.getElementById('available-books').textContent = availableBooks;
        document.getElementById('pending-requests').textContent = pendingRequests;
        document.getElementById('total-users').textContent = totalUsers;

        // Load recent requests
        this.loadRecentRequests();
    }

    loadRecentRequests() {
        const container = document.getElementById('recent-requests');
        const recentRequests = this.mockRequests.slice(-3);

        container.innerHTML = '';

        if (recentRequests.length === 0) {
            container.innerHTML = '<p style="color: var(--overseerr-text-secondary);">No recent requests</p>';
            return;
        }

        recentRequests.forEach(request => {
            const book = this.mockBooks.find(b => b.id === request.bookId);
            const user = this.mockUsers.find(u => u.id === request.userId);

            const requestElement = document.createElement('div');
            requestElement.className = 'recent-request-item';
            requestElement.innerHTML = `
                <div class="recent-request-info">
                    <h4>${book ? book.title : 'Unknown Book'}</h4>
                    <p>Requested by ${user ? user.username : 'Unknown User'} • ${this.formatDate(request.requestedAt)}</p>
                </div>
                <div class="book-status-badge ${request.status}">${request.status}</div>
            `;

            container.appendChild(requestElement);
        });
    }

    loadDiscover() {
        this.renderBooks();
    }

    renderBooks(books = null) {
        const container = document.getElementById('books-grid');
        const booksToRender = books || this.mockBooks;

        container.innerHTML = '';

        booksToRender.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.onclick = () => this.openBookModal(book);

            let statusBadge = '';
            let statusClass = '';
            if (book.available) {
                statusBadge = 'Available';
                statusClass = 'available';
            } else if (book.requested) {
                statusBadge = 'Requested';
                statusClass = 'requested';
            } else {
                statusBadge = 'Unavailable';
                statusClass = 'pending';
            }

            bookCard.innerHTML = `
                <div class="book-cover">
                    <i class="fas fa-book"></i>
                    <div class="book-status-badge ${statusClass}">${statusBadge}</div>
                </div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p>by ${book.author}</p>
                </div>
            `;

            container.appendChild(bookCard);
        });
    }

    filterBooks() {
        const searchTerm = document.getElementById('book-search').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;
        const statusFilter = document.getElementById('status-filter').value;

        let filteredBooks = this.mockBooks;

        // Apply search filter
        if (searchTerm) {
            filteredBooks = filteredBooks.filter(book =>
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm)
            );
        }

        // Apply category filter
        if (categoryFilter) {
            filteredBooks = filteredBooks.filter(book =>
                book.categories.includes(categoryFilter)
            );
        }

        // Apply status filter
        if (statusFilter) {
            filteredBooks = filteredBooks.filter(book => {
                if (statusFilter === 'available') return book.available;
                if (statusFilter === 'requested') return book.requested;
                if (statusFilter === 'pending') return !book.available && !book.requested;
                return true;
            });
        }

        this.renderBooks(filteredBooks);
    }

    openBookModal(book) {
        this.selectedBook = book;
        
        // Populate modal with book details
        document.getElementById('modal-book-title').textContent = book.title;
        document.getElementById('modal-book-author').textContent = book.author;
        document.getElementById('modal-book-date').textContent = this.formatDate(book.publishedDate);
        document.getElementById('modal-book-pages').textContent = book.pageCount;
        document.getElementById('modal-book-isbn').textContent = book.isbn;
        document.getElementById('modal-book-categories').textContent = book.categories.join(', ');
        document.getElementById('modal-book-description').textContent = book.description;

        // Set book cover
        const bookImage = document.getElementById('modal-book-image');
        bookImage.style.display = 'none'; // Hide since we don't have real images

        // Update status display
        const statusContainer = document.getElementById('modal-book-status');
        let statusClass = '';
        let statusText = '';
        
        if (book.available) {
            statusClass = 'available';
            statusText = 'Available';
        } else if (book.requested) {
            statusClass = 'requested';
            statusText = 'Requested';
        } else {
            statusClass = 'pending';
            statusText = 'Unavailable';
        }
        
        statusContainer.innerHTML = `<div class="book-status-badge ${statusClass}">${statusText}</div>`;

        // Update action buttons
        const requestBtn = document.getElementById('request-book-btn');
        const cancelBtn = document.getElementById('cancel-request-btn');

        if (book.requested || this.isBookRequested(book.id)) {
            requestBtn.classList.add('hidden');
            cancelBtn.classList.remove('hidden');
        } else {
            requestBtn.classList.remove('hidden');
            cancelBtn.classList.add('hidden');
        }

        // Show modal
        document.getElementById('book-modal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('book-modal').classList.add('hidden');
        this.selectedBook = null;
    }

    isBookRequested(bookId) {
        return this.mockRequests.some(req => 
            req.bookId === bookId && 
            req.userId === this.currentUser.id && 
            req.status !== 'rejected'
        );
    }

    requestBook() {
        if (!this.selectedBook) return;

        // Create new request
        const newRequest = {
            id: String(this.mockRequests.length + 1),
            bookId: this.selectedBook.id,
            userId: this.currentUser.id,
            status: 'pending',
            requestedAt: new Date().toISOString(),
            notes: 'Requested via Bookseerr'
        };

        this.mockRequests.push(newRequest);
        
        // Update book status
        const bookIndex = this.mockBooks.findIndex(b => b.id === this.selectedBook.id);
        if (bookIndex !== -1) {
            this.mockBooks[bookIndex].requested = true;
        }

        this.showToast('Book request submitted successfully!', 'success');
        this.closeModal();
        this.renderBooks(); // Refresh the books display
    }

    cancelRequest() {
        if (!this.selectedBook) return;

        // Remove request
        const requestIndex = this.mockRequests.findIndex(req => 
            req.bookId === this.selectedBook.id && 
            req.userId === this.currentUser.id
        );

        if (requestIndex !== -1) {
            this.mockRequests.splice(requestIndex, 1);
        }

        // Update book status
        const bookIndex = this.mockBooks.findIndex(b => b.id === this.selectedBook.id);
        if (bookIndex !== -1) {
            this.mockBooks[bookIndex].requested = false;
        }

        this.showToast('Book request cancelled', 'success');
        this.closeModal();
        this.renderBooks(); // Refresh the books display
    }

    loadRequests() {
        const container = document.getElementById('requests-list');
        let requestsToShow = this.mockRequests;

        // Filter requests based on user role
        if (this.currentUser.role !== 'admin') {
            requestsToShow = this.mockRequests.filter(req => req.userId === this.currentUser.id);
        }

        container.innerHTML = '';

        if (requestsToShow.length === 0) {
            container.innerHTML = '<p style="color: var(--overseerr-text-secondary);">No requests found</p>';
            return;
        }

        requestsToShow.forEach(request => {
            const book = this.mockBooks.find(b => b.id === request.bookId);
            const user = this.mockUsers.find(u => u.id === request.userId);

            const requestElement = document.createElement('div');
            requestElement.className = 'request-item';

            let actions = '';
            if (this.currentUser.role === 'admin' && request.status === 'pending') {
                actions = `
                    <div class="request-actions">
                        <button class="btn btn--primary btn--sm" onclick="app.approveRequest('${request.id}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn--secondary btn--sm" onclick="app.rejectRequest('${request.id}')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    </div>
                `;
            }

            requestElement.innerHTML = `
                <div class="request-book-cover">
                    <i class="fas fa-book"></i>
                </div>
                <div class="request-details">
                    <h3>${book ? book.title : 'Unknown Book'}</h3>
                    <p><strong>Author:</strong> ${book ? book.author : 'Unknown'}</p>
                    <p><strong>Requested by:</strong> ${user ? user.username : 'Unknown User'}</p>
                    <p><strong>Date:</strong> ${this.formatDate(request.requestedAt)}</p>
                    <p><strong>Notes:</strong> ${request.notes || 'No notes'}</p>
                </div>
                <div class="book-status-badge ${request.status}">${request.status}</div>
                ${actions}
            `;

            container.appendChild(requestElement);
        });
    }

    approveRequest(requestId) {
        const request = this.mockRequests.find(r => r.id === requestId);
        if (request) {
            request.status = 'approved';
            request.approvedAt = new Date().toISOString();
            this.showToast('Request approved!', 'success');
            this.loadRequests();
        }
    }

    rejectRequest(requestId) {
        const request = this.mockRequests.find(r => r.id === requestId);
        if (request) {
            request.status = 'rejected';
            request.rejectedAt = new Date().toISOString();
            this.showToast('Request rejected', 'warning');
            this.loadRequests();
        }
    }

    loadSettings() {
        // Load users list for admin
        if (this.currentUser.role === 'admin') {
            this.loadUsersList();
        }
    }

    loadUsersList() {
        const container = document.getElementById('users-list');
        container.innerHTML = '';

        this.mockUsers.forEach(user => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';

            userElement.innerHTML = `
                <div class="user-info-item">
                    <h4>${user.username}</h4>
                    <p>${user.email} • Joined ${this.formatDate(user.createdAt)}</p>
                </div>
                <div class="user-role ${user.role}">${user.role}</div>
            `;

            container.appendChild(userElement);
        });
    }

    testConnection(button) {
        const originalText = button.textContent;
        button.textContent = 'Testing...';
        button.disabled = true;

        // Simulate connection test
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            this.showToast('Connection test successful!', 'success');
        }, 1000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${iconMap[type] || iconMap.info}"></i>
            <div class="toast-content">${message}</div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add close functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }
}

// Initialize the application
const app = new BookseerrApp();

// Make functions globally available for inline event handlers
window.app = app;