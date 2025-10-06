import React, { useState } from 'react';
import { Heart, BookOpen, Eye, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Card from '../../components/UI/Card';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import BookCover from '../../components/UI/BookCover';
import { useAuth } from '../../utils/AuthContext';

// Book interface for API data 
interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  coverUrl?: string;
  fileUrl?: string;
  content?: string;
  libraryId: string;
  isAvailable: boolean;
  availableCopies: number;
  totalCopies: number;
  isbn?: string;
  createdAt: string;
  updatedAt: string;
  library?: {
    id: string;
    name: string;
  };
  borrowHistory?: any[];
  // Optional Wattpad-style properties
  readingProgress?: number;
  isWishlisted?: boolean;
  isCompleted?: boolean;
  rating?: string;
  reads?: number;
  votes?: number;
  chapters?: number;
  lastUpdated?: string;
  tags?: string[];
  isOngoing?: boolean;
  language?: string;
  mature?: boolean;
}
/**
 * Books Page Component - Wattpad Style
 * A modern, social reading platform interface featuring popular fiction books
 * with engagement metrics, reading progress, and social features
 */
const Books: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  React.useEffect(() => {
    setLoading(true);
    console.log('🔄 Fetching books from API...');
    fetch('http://localhost:4000/api/books')
      .then(res => res.json())
      .then(response => {
        console.log('📚 API Response:', response);
        // Check if response has the expected structure
        if (response.success && Array.isArray(response.data)) {
          console.log('✅ Setting books from response.data:', response.data.length, 'books');
          setBooks(response.data);
        } else if (Array.isArray(response)) {
          // Fallback for direct array response
          console.log('✅ Setting books from direct array:', response.length, 'books');
          setBooks(response);
        } else {
          console.error('❌ API response is not in expected format:', response);
          setBooks([]);
        }
        setError(null);
      })
      .catch(err => {
        console.error('❌ Error fetching books:', err);
        setError('Failed to load books');
        setBooks([]);
      })
      .finally(() => {
        console.log('🏁 Finished loading books');
        setLoading(false);
      });
  }, []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  /**
   * Get unique categories from books
   */
  const categories = ['all', ...new Set(Array.isArray(books) ? books.map(book => book.category) : [])];

  /**
   * Filter and sort books based on criteria
   */
  const filteredAndSortedBooks = Array.isArray(books) ? books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.reads || 0) - (a.reads || 0);
        case 'rating':
          return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
        case 'recent':
          return new Date(b.lastUpdated || b.updatedAt || '').getTime() - new Date(a.lastUpdated || a.updatedAt || '').getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    }) : [];

  // Debug logging
  console.log('📊 Books state:', books.length, 'books');
  console.log('🔍 Filtered books:', filteredAndSortedBooks.length, 'books');
  console.log('🔐 Auth state - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  /**
   * Toggle wishlist status
   */
  const toggleWishlist = (bookId: string) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    setBooks(prevBooks => 
      prevBooks.map(book => 
        book.id === bookId ? { ...book, isWishlisted: !book.isWishlisted } : book
      )
    );
  };

  /**
   * Format large numbers (e.g., 1000 -> 1K)
   */
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  /**
   * Get time ago string
   */
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Only show navbar when user is authenticated and loading is complete */}
      {!isLoading && isAuthenticated && <Navbar />}
      
      {/* Wattpad-style Header */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              📚 Discover Amazing Stories
            </h1>
            <p className="text-lg sm:text-xl opacity-90 mb-6">
              Millions of stories. Find your next favorite read.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Eye className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search for stories, authors, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-4 text-lg bg-white/95 backdrop-blur border-0 rounded-full shadow-lg"
                />
              </div>
            </div>
            
            {/* Login prompt for non-authenticated users */}
            {!isAuthenticated && (
              <div className="mt-6 flex gap-4 justify-center">
                <Link
                  to="/login"
                  className="px-6 py-3 bg-white text-orange-600 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Login to Save Books
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-3 bg-white/20 backdrop-blur border border-white/30 text-white font-semibold rounded-full hover:bg-white/30 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading amazing stories...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-8 bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
            <p className="text-center">{error}</p>
          </Card>
        )}

        {/* Debug Info */}
        <Card className="mb-8 bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-2xl">
          <div className="text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>Books loaded: {books.length} | Filtered: {filteredAndSortedBooks.length}</p>
            <p>Auth - isAuthenticated: {isAuthenticated ? 'Yes' : 'No'} | isLoading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Loading: {loading ? 'Yes' : 'No'} | Error: {error || 'None'}</p>
            <p>Search: "{searchTerm}" | Category: {categoryFilter} | Sort: {sortBy}</p>
          </div>
        </Card>

        {/* Main Content - Only show when not loading */}
        {!loading && (
          <>
            {/* Filters & Sorting */}
            <div className="mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? '📖 All Genres' : `📚 ${category}`}
                    </option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm"
                >
                  <option value="popular">🔥 Most Popular</option>
                  <option value="rating">⭐ Highest Rated</option>
                  <option value="recent">🆕 Recently Updated</option>
                  <option value="title">📝 Alphabetical</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">{filteredAndSortedBooks.length} stories</span>
                <div className="flex bg-gray-100 rounded-full p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-600'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-600'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            {/* Books Display */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedBooks.map((book) => (
                  <Card key={book.id} className="group bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                    <div className="relative">
                      {/* Book Cover */}
                      <div className="aspect-[3/4] overflow-hidden">
                        <BookCover
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          fallbackText={book.title}
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Link to={`/book-reader/${book.id}`}>
                            <Button className="bg-white text-black hover:bg-gray-100 rounded-full px-6 py-2 font-semibold">
                              Read Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                      
                      {/* Wishlist Button - Only show for authenticated users */}
                      {isAuthenticated && (
                        <button
                          onClick={() => toggleWishlist(book.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                            book.isWishlisted 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                          }`}
                        >
                          <Heart size={16} fill={book.isWishlisted ? 'currentColor' : 'none'} />
                        </button>
                      )}
                      
                      {/* Status Badge */}
                      {book.isOngoing && (
                        <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Ongoing
                        </div>
                      )}
                      
                      {/* Reading Progress - Only show for authenticated users */}
                      {isAuthenticated && (book.readingProgress ?? 0) > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2">
                          <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                            <span>Reading Progress</span>
                            <span>{book.readingProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${book.readingProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Book Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-1">{book.title}</h3>
                      <p className="text-orange-600 font-medium text-sm mb-2">by {book.author}</p>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Eye size={12} />
                          <span>{formatNumber(book.reads || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-400 fill-current" />
                          <span>{book.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart size={12} />
                          <span>{formatNumber(book.votes || 0)}</span>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      {book.tags && book.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {book.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Description */}
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{book.description}</p>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link to={`/book-reader/${book.id}`} className="flex-1">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0"
                          >
                            {(book.readingProgress || 0) > 0 ? 'Continue' : 'Start Reading'}
                          </Button>
                        </Link>
                        {/* Wishlist Button - Only show for authenticated users */}
                        {isAuthenticated && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleWishlist(book.id)}
                            className="border-orange-200 text-orange-600 hover:bg-orange-50"
                          >
                            <Heart size={16} fill={book.isWishlisted ? 'currentColor' : 'none'} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredAndSortedBooks.map((book) => (
                  <Card key={book.id} className="bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl p-6">
                    <div className="flex gap-6">
                      {/* Book Cover */}
                      <div className="flex-shrink-0">
                        <BookCover
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-20 h-28 object-cover rounded-lg"
                          fallbackText={book.title}
                        />
                      </div>
                      
                      {/* Book Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-xl line-clamp-1">{book.title}</h3>
                            <p className="text-orange-600 font-medium">by {book.author}</p>
                          </div>
                          {/* Wishlist Button - Only show for authenticated users */}
                          {isAuthenticated && (
                            <button
                              onClick={() => toggleWishlist(book.id)}
                              className={`p-2 rounded-full transition-colors ${
                                book.isWishlisted 
                                  ? 'bg-red-100 text-red-600' 
                                  : 'bg-gray-100 text-gray-400 hover:text-red-600'
                              }`}
                            >
                              <Heart size={18} fill={book.isWishlisted ? 'currentColor' : 'none'} />
                            </button>
                          )}
                        </div>
                        
                        {/* Stats Row */}
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Eye size={14} />
                            <span>{formatNumber(book.reads || 0)} reads</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400 fill-current" />
                            <span>{book.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart size={14} />
                            <span>{formatNumber(book.votes || 0)} votes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen size={14} />
                            <span>{book.chapters} chapters</span>
                          </div>
                          {book.isOngoing && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                              Ongoing
                            </span>
                          )}
                        </div>
                        
                        {/* Description */}
                        <p className="text-gray-600 line-clamp-2 mb-3">{book.description}</p>
                        
                        {/* Tags */}
                        {book.tags && book.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {book.tags.map((tag, index) => (
                              <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-3">
                            <Link to={`/book-reader/${book.id}`}>
                              <Button 
                                variant="primary" 
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0"
                              >
                                {(book.readingProgress || 0) > 0 ? 'Continue Reading' : 'Start Reading'}
                              </Button>
                            </Link>
                            <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                              Preview
                            </Button>
                          </div>
                          
                          {book.lastUpdated && (
                            <span className="text-xs text-gray-400">
                              Updated {getTimeAgo(book.lastUpdated)}
                            </span>
                          )}
                        </div>
                        
                        {/* Reading Progress */}
                        {(book.readingProgress ?? 0) > 0 && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                              <span>Your Progress</span>
                              <span>{book.readingProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${book.readingProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredAndSortedBooks.length === 0 && !loading && (
              <Card className="text-center py-16 bg-white border border-gray-100 shadow-lg rounded-2xl">
                <div className="text-gray-400 mb-6">
                  <BookOpen size={64} className="mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No stories found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || categoryFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Discover amazing stories in our library.'}
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                  }}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0"
                >
                  Explore All Stories
                </Button>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Books;