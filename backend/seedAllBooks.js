const { PrismaClient, BookCategory } = require('@prisma/client');
const prisma = new PrismaClient();

const allBooks = [
  // Existing Wattpad style books
  {
    title: "After",
    author: "Anna Todd",
    description: "When Tessa meets Hardin, her life changes forever. A passionate love story filled with drama, heartbreak, and unexpected twists.",
    category: "FICTION",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1390827002i/13691738.jpg",
    fileUrl: "https://example.com/after.pdf",
    isbn: "9781476792484",
    availableCopies: 5,
    totalCopies: 5
  },
  {
    title: "The Kissing Booth",
    author: "Beth Reekles",
    description: "Elle Evans has never been kissed. But when she runs a kissing booth at her school carnival, everything changes when Noah Flynn shows up.",
    category: "FICTION",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1337027369i/15731059.jpg",
    fileUrl: "https://example.com/kissing-booth.pdf",
    isbn: "9780385742535",
    availableCopies: 3,
    totalCopies: 5
  },
  // ... [previous books from seedBooks.js]
  
  // New additions - Classic Literature
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
    category: "FICTION",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg",
    fileUrl: "https://example.com/mockingbird.pdf",
    isbn: "9780446310789",
    availableCopies: 4,
    totalCopies: 6
  },
  
  // New additions - Science Fiction
  {
    title: "Dune",
    author: "Frank Herbert",
    description: "The story of the son of a noble family entrusted with the protection of the most valuable asset in the galaxy.",
    category: BookCategory.SCIENCE,
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg",
    fileUrl: "https://example.com/dune.pdf",
    isbn: "9780441172719",
    availableCopies: 3,
    totalCopies: 5
  },
  
  // New additions - Fantasy
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    description: "The story of Kvothe, an adventurer and musician who grows to be the most notorious wizard the world has ever seen.",
    category: BookCategory.FICTION,
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1270352123i/186074.jpg",
    fileUrl: "https://example.com/name-of-wind.pdf",
    isbn: "9780756404741",
    availableCopies: 2,
    totalCopies: 4
  },
  
  // New additions - Mystery/Thriller
  {
    title: "Gone Girl",
    author: "Gillian Flynn",
    description: "A woman disappears on the day of her fifth wedding anniversary. Is her husband a killer?",
    category: BookCategory.FICTION,
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1554086139i/19288043.jpg",
    fileUrl: "https://example.com/gone-girl.pdf",
    isbn: "9780307588371",
    availableCopies: 5,
    totalCopies: 7
  },
  
  // New additions - Non-Fiction
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    description: "A groundbreaking narrative of humanity's creation and evolution that explores the ways in which biology and history have defined us.",
    category: BookCategory.EDUCATION,
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1420585954i/23692271.jpg",
    fileUrl: "https://example.com/sapiens.pdf",
    isbn: "9780062316097",
    availableCopies: 3,
    totalCopies: 5
  },
  
  // New additions - Self-Help
  {
    title: "Atomic Habits",
    author: "James Clear",
    description: "A guide to building good habits and breaking bad ones, with a proven system for improving your life.",
    category: BookCategory.EDUCATION,
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg",
    fileUrl: "https://example.com/atomic-habits.pdf",
    isbn: "9780735211292",
    availableCopies: 4,
    totalCopies: 6
  }
];

async function seedAllBooks() {
  try {
    console.log('🌱 Starting to seed all books...');
    
    // Get the first library to associate with books
    const library = await prisma.library.findFirst();
    
    if (!library) {
      console.log('❌ No library found. Please create a library first.');
      return;
    }
    
    console.log(`📚 Using library: ${library.name}`);
    
    // Clear existing books
    await prisma.book.deleteMany({});
    console.log('🗑️  Cleared existing books');
    
    // Add all books
    const createdBooks = await Promise.all(
      allBooks.map(book => 
        prisma.book.upsert({
          where: { isbn: book.isbn },
          update: {},
          create: {
            ...book,
            libraryId: library.id,
            isAvailable: book.availableCopies > 0
          }
        })
      )
    );
    
    console.log(`✅ Successfully seeded ${createdBooks.length} books!`);
    return createdBooks;
  } catch (error) {
    console.error('❌ Error seeding books:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedAllBooks()
    .then(() => {
      console.log('✨ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAllBooks };
