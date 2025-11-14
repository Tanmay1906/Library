const { PrismaClient, BookCategory } = require('@prisma/client');
const prisma = new PrismaClient();

const books = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A story of decadence, excess, and the American Dream in the Roaring Twenties.",
    category: BookCategory.FICTION,
    coverUrl: "https://covers.openlibrary.org/b/id/8394441-L.jpg",
    isbn: "9780743273565",
    availableCopies: 3,
    totalCopies: 3
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "A powerful story of racial injustice and the loss of innocence in the American South.",
    category: BookCategory.FICTION,
    coverUrl: "https://covers.openlibrary.org/b/id/11103368-L.jpg",
    isbn: "9780061120084",
    availableCopies: 2,
    totalCopies: 2
  },
  {
    title: "1984",
    author: "George Orwell",
    description: "A dystopian novel about totalitarianism, mass surveillance, and thought control.",
    category: BookCategory.SCIENCE_FICTION,
    coverUrl: "https://covers.openlibrary.org/b/id/7222246-L.jpg",
    isbn: "9780451524935",
    availableCopies: 4,
    totalCopies: 4
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "A romantic novel that charts the emotional development of Elizabeth Bennet.",
    category: BookCategory.FICTION,
    coverUrl: "https://covers.openlibrary.org/b/id/4262448-L.jpg",
    isbn: "9780141439518",
    availableCopies: 3,
    totalCopies: 3
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    description: "A fantasy novel about the adventures of Bilbo Baggins in Middle-earth.",
    category: BookCategory.FANTASY,
    coverUrl: "https://covers.openlibrary.org/b/id/8406783-L.jpg",
    isbn: "9780547928227",
    availableCopies: 5,
    totalCopies: 5
  }
];

async function seedBooks() {
  try {
    console.log('Starting to seed books...');
    
    // Get the first library ID to associate with these books
    const library = await prisma.library.findFirst();
    
    if (!library) {
      throw new Error('No library found. Please create a library first.');
    }

    // Create books
    const createdBooks = await Promise.all(
      books.map(book => 
        prisma.book.upsert({
          where: { isbn: book.isbn },
          update: {},
          create: {
            ...book,
            libraryId: library.id,
            isAvailable: book.availableCopies > 0
          },
        })
      )
    );

    console.log(`Successfully seeded ${createdBooks.length} books`);
    return createdBooks;
  } catch (error) {
    console.error('Error seeding books:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedBooks()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedBooks };
