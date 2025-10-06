import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, TrendingUp,  ArrowRight, Sparkles } from 'lucide-react';

const Home: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const popularBooks = [
    { title: 'After', color: 'from-red-400 to-pink-500' },
    { title: 'Twilight', color: 'from-purple-400 to-indigo-500' },
    { title: 'Pride & Prejudice', color: 'from-blue-400 to-cyan-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20 pt-12" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-2 mb-6">
            <Sparkles className="text-yellow-400" size={20} />
            <span className="text-purple-200 font-medium">Welcome to the Future of Reading</span>
          </div>
          
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-6 tracking-tight">
            LibraryMate
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Dive into endless stories. Read, track, and discover your next favorite book.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/books"
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Books
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            
            <Link
              to="/login"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-full text-white font-bold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 max-w-4xl mx-auto">
          <div className="group relative bg-gradient-to-br from-purple-500/10 to-transparent backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 hover:border-purple-500/40 transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/50">
                <BookOpen className="text-white" size={32} />
              </div>
              <div className="text-4xl font-black text-white mb-2">15+</div>
              <h3 className="text-xl font-bold text-white mb-3">Books Available</h3>
              <p className="text-gray-400 mb-6">
                Popular fiction including After, Twilight, Pride & Prejudice, and many more classics
              </p>
              <Link
                to="/books"
                className="inline-flex items-center gap-2 text-purple-400 font-semibold hover:text-purple-300 transition-colors"
              >
                Browse Collection
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-blue-500/10 to-transparent backdrop-blur-xl border border-blue-500/20 rounded-3xl p-8 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/50">
                <Star className="text-white" size={32} />
              </div>
              <div className="text-4xl font-black text-white mb-2">Smart</div>
              <h3 className="text-xl font-bold text-white mb-3">Track Progress</h3>
              <p className="text-gray-400 mb-6">
                Create wishlists, track reading progress, and never lose your place
              </p>
              <Link
                to="/student/books"
                className="inline-flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition-colors"
              >
                Student Portal
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Popular Books Showcase */}
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-white flex items-center gap-3">
                <TrendingUp className="text-pink-400" />
                Trending Now
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularBooks.map((book, index) => (
                <div
            key={index}
            className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
            <div className={`absolute inset-0 bg-gradient-to-br ${book.color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Book Cover */}
              <img
                src={
                  book.title === 'After'
              ? 'https://covers.openlibrary.org/b/id/10594765-L.jpg'
              : book.title === 'Twilight'
              ? 'https://covers.openlibrary.org/b/id/8225261-L.jpg'
              : book.title === 'Pride & Prejudice'
              ? 'https://covers.openlibrary.org/b/id/11105934-L.jpg'
              : ''
                }
                alt={book.title + ' cover'}
                className="w-24 h-36 object-cover rounded-xl shadow-lg mb-4 border-4 border-white/30"
              />
              <div className="text-center p-2">
                <h3 className="text-2xl font-black text-white">{book.title}</h3>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                </div>
              ))}
            </div>
          </div>

        {/* Quick Start Guide */}
        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-white mb-4 flex items-center justify-center gap-3">
              <Sparkles className="text-yellow-400" />
              Quick Start Guide
            </h2>
            <p className="text-gray-300 text-lg">Choose your path to start reading</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl">1</div>
                <h3 className="text-2xl font-bold text-white">Direct Access</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-300">
                  <div className="bg-purple-500/20 rounded-full p-1 mt-1">
                    <ArrowRight size={16} className="text-purple-400" />
                  </div>
                  <span>Visit <Link to="/books" className="text-purple-400 hover:text-purple-300 font-semibold">/books</Link> to see all books immediately</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <div className="bg-purple-500/20 rounded-full p-1 mt-1">
                    <ArrowRight size={16} className="text-purple-400" />
                  </div>
                  <span>No login required for browsing</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <div className="bg-purple-500/20 rounded-full p-1 mt-1">
                    <ArrowRight size={16} className="text-purple-400" />
                  </div>
                  <span>Click any book to start reading instantly</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 rounded-2xl p-8 hover:border-pink-500/40 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-pink-500 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl">2</div>
                <h3 className="text-2xl font-bold text-white">Student Experience</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-300">
                  <div className="bg-pink-500/20 rounded-full p-1 mt-1">
                    <ArrowRight size={16} className="text-pink-400" />
                  </div>
                  <span><Link to="/dev" className="text-pink-400 hover:text-pink-300 font-semibold">Auto-login as student</Link> for full features</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <div className="bg-pink-500/20 rounded-full p-1 mt-1">
                    <ArrowRight size={16} className="text-pink-400" />
                  </div>
                  <span>Access wishlists and progress tracking</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <div className="bg-pink-500/20 rounded-full p-1 mt-1">
                    <ArrowRight size={16} className="text-pink-400" />
                  </div>
                  <span>Direct access via <Link to="/student/books" className="text-pink-400 hover:text-pink-300 font-semibold">/student/books</Link></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;