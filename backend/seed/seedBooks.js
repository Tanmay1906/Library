const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const wattpadStyleBooks = [
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
  {
    title: "My Life with the Walter Boys",
    author: "Ali Novak",
    description: "When Jackie's family dies in a car crash, she moves in with the Walter family and their twelve boys. Romance and chaos ensue.",
    category: "FICTION",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1405020323i/18664274.jpg",
    fileUrl: "https://example.com/walter-boys.pdf",
    isbn: "9781492635239",
    availableCopies: 4,
    totalCopies: 4
  },
  {
    title: "The Bad Boy's Girl",
    author: "Blair Holden",
    description: "Tessa O'Connell's life is turned upside down when she becomes involved with Cole Stone, the school's notorious bad boy.",
    category: "FICTION",
    coverUrl: "https://d1w7fb2mkkr3kw.cloudfront.net/assets/images/book/lrg/9781/5982/9781598209143.jpg",
    fileUrl: "https://example.com/bad-boys-girl.pdf",
    isbn: "9781598209143",
    availableCopies: 6,
    totalCopies: 8
  },
  {
    title: "Chasing Red",
    author: "Isabelle Ronin",
    description: "Veronica runs from her past, but when she meets Caleb, a mysterious and wealthy student, her carefully constructed world begins to crumble.",
    category: "FICTION",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1531085835i/35580925.jpg",
    fileUrl: "https://example.com/chasing-red.pdf",
    isbn: "9781250188106",
    availableCopies: 3,
    totalCopies: 5
  },
  {
    title: "Wuthering Heights",
    author: "Emily Brontë",
    description: "A passionate tale of love and revenge set on the Yorkshire moors, following Heathcliff and Catherine's tumultuous relationship.",
    category: "FICTION",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388212715i/6185.jpg",
    fileUrl: "https://example.com/wuthering-heights.pdf",
    isbn: "9780141439556",
    availableCopies: 2,
    totalCopies: 3,
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "Elizabeth Bennet navigates love, family, and social expectations in this timeless romantic classic.",
    category: "FICTION",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg",
    fileUrl: "https://example.com/pride-prejudice.pdf",
    isbn: "9780141439518",
    availableCopies: 4,
    totalCopies: 6,
  },
  {
    title: "The Hating Game",
    author: "Sally Thorne",
    description: "Lucy and Joshua are executive assistants to co-CEOs who hate each other. But what happens when hate turns to something else?",
    category: "FICTION",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1465684967i/25883848.jpg",
    fileUrl: "https://example.com/hating-game.pdf",
    isbn: "9780062439598",
    availableCopies: 5,
    totalCopies: 7,
  },
  {
    title: "It Ends with Us",
    author: "Colleen Hoover",
    description: "Lily's life changes when she meets neurosurgeon Ryle, but when her past collides with her present, she must make an impossible choice.",
    category: "FICTION",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1470427482i/18692431.jpg",
    fileUrl: "https://example.com/it-ends-with-us.pdf",
    isbn: "9781501110368",
    availableCopies: 3,
    totalCopies: 8,
  },
  {
    title: "Beach Read",
    author: "Emily Henry",
    description: "Two rival writers challenge each other to write outside their comfort zones during one transformative summer.",
    category: "FICTION",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1583978192i/52867387.jpg",
    fileUrl: "https://example.com/beach-read.pdf",
    isbn: "9781984806734",
    availableCopies: 4,
    totalCopies: 6,
  },
  {
    title: "Red Queen",
    author: "Victoria Aveyard",
    description: "In a world divided by blood—Red or Silver—Mare discovers she has a power that could change everything.",
    category: "FICTION",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1426578144i/22328546.jpg",
    fileUrl: "https://example.com/red-queen.pdf",
    isbn: "9780062310637",
    availableCopies: 5,
    totalCopies: 5,
  },
  {
    title: "The Selection",
    author: "Kiera Cass",
    description: "For thirty-five girls, the Selection is the chance of a lifetime. For America Singer, it's a nightmare.",
    category: "FICTION",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1358262032i/10507293.jpg",
    fileUrl: "https://example.com/selection.pdf",
    isbn: "9780062059932",
    availableCopies: 6,
    totalCopies: 8,
  },
  {
    title: "Twilight",
    author: "Stephenie Meyer",
    description: "When Bella moves to Forks and meets the mysterious Edward Cullen, her life takes a supernatural turn.",
    category: "FICTION",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1361039443i/41865.jpg",
    fileUrl: "https://example.com/twilight.pdf",
    isbn: "9780316015844",
    availableCopies: 4,
    totalCopies: 10,
  },
  {
    title: "Eleanor & Park",
    author: "Rainbow Rowell",
    description: "Set over one school year, this is the story of two star-crossed misfits who fall in love for the first time.",
    category: "FICTION",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1365833895i/15745753.jpg",
    fileUrl: "https://example.com/eleanor-park.pdf",
    isbn: "9781250012579",
    availableCopies: 3,
    totalCopies: 5,
  },
  {
    title: "The Fault in Our Stars",
    author: "John Green",
    description: "Hazel and Augustus are teens who share an acerbic wit, a disdain for the conventional, and a love that sweeps them on a journey.",
    category: "FICTION",
    coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1360206420i/11870085.jpg",
    fileUrl: "https://example.com/fault-in-stars.pdf",
    isbn: "9780525478812",
    availableCopies: 7,
    totalCopies: 10,
  }
];

async function seedBooks() {
  try {
    console.log('🌱 Starting to seed books...');
    
    // First, get a library to associate books with
    const library = await prisma.library.findFirst();
    
    if (!library) {
      console.log('❌ No library found. Please create a library first.');
      return;
    }
    
    console.log(`📚 Using library: ${library.name}`);
    
    // Clear existing books
    await prisma.book.deleteMany({});
    console.log('🗑️  Cleared existing books');
    
    // Add the new books
    for (const bookData of wattpadStyleBooks) {
      await prisma.book.create({
        data: {
          ...bookData,
          libraryId: library.id
        }
      });
    }
    
    console.log(`✅ Successfully seeded ${wattpadStyleBooks.length} books!`);
    
    // Display summary
    const totalBooks = await prisma.book.count();
    console.log(`📊 Total books in database: ${totalBooks}`);
    
  } catch (error) {
    console.error('❌ Error seeding books:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedBooks();
}

module.exports = { seedBooks, wattpadStyleBooks };