// Book data structure
class Book {
    constructor(title, author, genre, year, coverUrl, status = 'Available') {
        this.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.year = year;
        this.coverUrl = coverUrl || '';
        this.status = status;
        this.dateAdded = new Date().toISOString();
    }
}

// Sample initial data for wow factor
const sampleBooks = [
    new Book('Dune', 'Frank Herbert', 'Sci-Fi', 1965, 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Available'),
    new Book('The Midnight Library', 'Matt Haig', 'Fiction', 2020, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Borrowed'),
    new Book('Atomic Habits', 'James Clear', 'Non-Fiction', 2018, 'https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Available'),
    new Book('Project Hail Mary', 'Andy Weir', 'Sci-Fi', 2021, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Available'),
    new Book('Steve Jobs', 'Walter Isaacson', 'Biography', 2011, 'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Borrowed'),
    new Book('Clean Code', 'Robert C. Martin', 'Technology', 2008, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Available')
];

// App State
let books = [];

// DOM Elements
const booksGrid = document.getElementById('booksGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');

const totalBooksCount = document.getElementById('totalBooksCount');
const availableBooksCount = document.getElementById('availableBooksCount');
const borrowedBooksCount = document.getElementById('borrowedBooksCount');

const addBookModal = document.getElementById('addBookModal');
const addBookBtn = document.getElementById('addBookBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const addBookForm = document.getElementById('addBookForm');

// Initialize App
function init() {
    // Load from local storage or use sample data
    const storedBooks = localStorage.getItem('nexus_books');
    if (storedBooks) {
        books = JSON.parse(storedBooks);
    } else {
        books = sampleBooks;
        saveBooks();
    }
    
    renderBooks();
    setupEventListeners();
}

// Save to LocalStorage
function saveBooks() {
    localStorage.setItem('nexus_books', JSON.stringify(books));
    updateStats();
}

// Update Dashboard Statistics
function updateStats() {
    totalBooksCount.textContent = books.length;
    
    const availableCount = books.filter(b => b.status === 'Available').length;
    availableBooksCount.textContent = availableCount;
    
    const borrowedCount = books.length - availableCount;
    borrowedBooksCount.textContent = borrowedCount;
}

// Render Books Grid
function renderBooks(booksToRender = books) {
    booksGrid.innerHTML = '';
    
    if (booksToRender.length === 0) {
        booksGrid.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        booksGrid.style.display = 'grid';
        emptyState.style.display = 'none';
        
        booksToRender.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            
            // Generate cover HTML
            let coverHtml = '';
            if (book.coverUrl) {
                coverHtml = `<img src="${book.coverUrl}" alt="${book.title} cover" onerror="this.onerror=null; this.parentNode.innerHTML='<i class=\\'fa-solid fa-book book-cover-placeholder\\'></i>';">`;
            } else {
                coverHtml = `<i class="fa-solid fa-book book-cover-placeholder"></i>`;
            }

            const statusClass = book.status === 'Available' ? 'status-available' : 'status-borrowed';
            const toggleActionText = book.status === 'Available' ? 'Mark as Borrowed' : 'Mark as Available';

            bookCard.innerHTML = `
                <div class="book-cover">
                    ${coverHtml}
                </div>
                <div class="book-status ${statusClass}">
                    ${book.status}
                </div>
                <div class="book-info">
                    <div class="book-genre">${book.genre} • ${book.year}</div>
                    <div class="book-title">${book.title}</div>
                    <div class="book-author">by ${book.author}</div>
                    
                    <div class="book-actions">
                        <button class="btn-toggle-status" onclick="toggleBookStatus('${book.id}')">
                            <i class="fa-solid fa-rotate"></i> ${toggleActionText}
                        </button>
                        <button class="btn-delete" onclick="deleteBook('${book.id}')" title="Delete Book">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;
            
            booksGrid.appendChild(bookCard);
        });
    }
    
    updateStats();
}

// Add New Book
function handleAddBook(e) {
    e.preventDefault();
    
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const genre = document.getElementById('bookGenre').value;
    const year = document.getElementById('bookYear').value;
    const coverUrl = document.getElementById('bookCover').value;
    
    const newBook = new Book(title, author, genre, year, coverUrl);
    
    books.unshift(newBook); // Add to beginning of array
    saveBooks();
    renderBooks();
    
    closeModal();
    addBookForm.reset();
}

// Delete Book
function deleteBook(id) {
    if (confirm('Are you sure you want to remove this book from the catalog?')) {
        books = books.filter(book => book.id !== id);
        saveBooks();
        renderBooks();
    }
}

// Toggle Book Status
function toggleBookStatus(id) {
    const bookIndex = books.findIndex(book => book.id === id);
    if (bookIndex !== -1) {
        books[bookIndex].status = books[bookIndex].status === 'Available' ? 'Borrowed' : 'Available';
        saveBooks();
        renderBooks();
    }
}

// Search Books
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (!searchTerm) {
        renderBooks();
        return;
    }
    
    const filteredBooks = books.filter(book => {
        return book.title.toLowerCase().includes(searchTerm) ||
               book.author.toLowerCase().includes(searchTerm) ||
               book.genre.toLowerCase().includes(searchTerm);
    });
    
    renderBooks(filteredBooks);
}

// Modal Functions
function openModal() {
    addBookModal.classList.add('active');
    document.getElementById('bookTitle').focus();
}

function closeModal() {
    addBookModal.classList.remove('active');
}

// Setup Event Listeners
function setupEventListeners() {
    // Modal events
    addBookBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    addBookModal.addEventListener('click', (e) => {
        if (e.target === addBookModal) {
            closeModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && addBookModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Form submission
    addBookForm.addEventListener('submit', handleAddBook);
    
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    
    // Nav links purely for visual effect (no actual routing)
    const navLinks = document.querySelectorAll('.sidebar-nav li');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// Boot up
document.addEventListener('DOMContentLoaded', init);
