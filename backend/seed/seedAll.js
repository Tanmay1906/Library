require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const wattpadStyleBooks = [
  {
    title: "After",
    author: "Anna Todd",
    description: "When Tessa meets Hardin, her life changes forever. A passionate love story filled with drama, heartbreak, and unexpected twists.",
    category: "FICTION",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781476792484-M.jpg",
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
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780385742535-M.jpg",
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
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781492635239-M.jpg",
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
    coverUrl: "https://via.placeholder.com/300x400/8B5A3C/FFFFFF?text=The+Bad+Boy%27s+Girl",
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
    coverUrl: "https://via.placeholder.com/300x400/DC143C/FFFFFF?text=Chasing+Red",
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
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780141439556-M.jpg",
    fileUrl: "https://example.com/wuthering-heights.pdf",
    isbn: "9780141439556",
    availableCopies: 2,
    totalCopies: 3
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "Elizabeth Bennet navigates love, family, and social expectations in this timeless romantic classic.",
    category: "FICTION",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg",
    fileUrl: "https://example.com/pride-prejudice.pdf",
    isbn: "9780141439518",
    availableCopies: 4,
    totalCopies: 6
  },
  {
    title: "The Hating Game",
    author: "Sally Thorne",
    description: "Lucy and Joshua are executive assistants to co-CEOs who hate each other. But what happens when hate turns to something else?",
    category: "FICTION",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780062439598-M.jpg",
    fileUrl: "https://example.com/hating-game.pdf",
    isbn: "9780062439598",
    availableCopies: 5,
    totalCopies: 7
  },
  {
    title: "It Ends with Us",
    author: "Colleen Hoover",
    description: "Lily's life changes when she meets neurosurgeon Ryle, but when her past collides with her present, she must make an impossible choice.",
    category: "FICTION",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781501110368-M.jpg",
    fileUrl: "https://example.com/it-ends-with-us.pdf",
    isbn: "9781501110368",
    availableCopies: 3,
    totalCopies: 8
  },
  {
    title: "Beach Read",
    author: "Emily Henry",
    description: "Two rival writers challenge each other to write outside their comfort zones during one transformative summer.",
    category: "FICTION",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781984806734-M.jpg",
    fileUrl: "https://example.com/beach-read.pdf",
    isbn: "9781984806734",
    availableCopies: 4,
    totalCopies: 6
  },
  {
    title: "Red Queen",
    author: "Victoria Aveyard",
    description: "In a world divided by blood—Red or Silver—Mare discovers she has a power that could change everything.",
    category: "FICTION",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780062310637-M.jpg",
    fileUrl: "https://example.com/red-queen.pdf",
    isbn: "9780062310637",
    availableCopies: 5,
    totalCopies: 5
  },
  {
    title: "The Selection",
    author: "Kiera Cass",
    description: "For thirty-five girls, the Selection is the chance of a lifetime. For America Singer, it's a nightmare.",
    category: "FICTION",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780062059932-M.jpg",
    fileUrl: "https://example.com/selection.pdf",
    isbn: "9780062059932",
    availableCopies: 6,
    totalCopies: 8
  },
  {
    title: "Twilight",
    author: "Stephenie Meyer",
    description: "When Bella moves to Forks and meets the mysterious Edward Cullen, her life takes a supernatural turn.",
    category: "FICTION",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780316015844-M.jpg",
    fileUrl: "https://example.com/twilight.pdf",
    isbn: "9780316015844",
    availableCopies: 4,
    totalCopies: 10
  },
  {
    title: "Eleanor & Park",
    author: "Rainbow Rowell",
    description: "Set over one school year, this is the story of two star-crossed misfits who fall in love for the first time.",
    category: "FICTION",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781250012579-M.jpg",
    fileUrl: "https://example.com/eleanor-park.pdf",
    isbn: "9781250012579",
    availableCopies: 3,
    totalCopies: 5
  },
  {
    title: "The Fault in Our Stars",
    author: "John Green",
    description: "Hazel and Augustus are teens who share an acerbic wit, a disdain for the conventional, and a love that sweeps them on a journey.",
    category: "FICTION",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780525478812-M.jpg",
    fileUrl: "https://example.com/fault-in-stars.pdf",
    isbn: "9780525478812",
    availableCopies: 7,
    totalCopies: 10
  }
];

async function seedAll() {
  try {
    console.log('🌱 Starting comprehensive seeding...');

    // 1. Create Admin
    const password = await bcrypt.hash('admin123', 10);
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@library.com' },
      update: {},
      create: {
        name: 'Super Admin',
        email: 'admin@library.com',
        phone: '+911234567890',
        password
      }
    });
    console.log('✅ Admin created/found');

    // 2. Create Library
    const library = await prisma.library.upsert({
      where: { id: 'default-library' },
      update: {},
      create: {
        id: 'default-library',
        name: 'Digital Reading Hub',
        description: 'A modern digital library featuring the best contemporary fiction and classic literature',
        address: '123 Digital Street, Reading City, RC 12345',
        phone: '+911234567890',
        adminId: admin.id
      }
    });
    console.log('✅ Library created/found');

    // 3. Clear existing books and create new ones
    await prisma.book.deleteMany({});
    console.log('🗑️  Cleared existing books');

    // 4. Add the new books
    const createdBooks = [];
    for (const bookData of wattpadStyleBooks) {
      const book = await prisma.book.create({
        data: {
          ...bookData,
          libraryId: library.id
        }
      });
      createdBooks.push(book);
    }
    
    console.log(`✅ Successfully seeded ${wattpadStyleBooks.length} books!`);

    // 5. Create some students for testing
    let student1, student2;
    try {
      student1 = await prisma.student.upsert({
        where: { email: 'student1@test.com' },
        update: {},
        create: {
          name: 'John Student',
          email: 'student1@test.com',
          phone: '+911234567891',
          password: await bcrypt.hash('password123', 10),
          registrationNumber: 'STU001',
          aadharReference: 'AADH123456789',
          libraryId: library.id,
          subscriptionPlan: 'MONTHLY',
          paymentStatus: 'PAID',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      });

      student2 = await prisma.student.upsert({
        where: { email: 'student2@test.com' },
        update: {},
        create: {
          name: 'Jane Reader',
          email: 'student2@test.com',
          phone: '+911234567892',
          password: await bcrypt.hash('password123', 10),
          registrationNumber: 'STU002',
          aadharReference: 'AADH987654321',
          libraryId: library.id,
          subscriptionPlan: 'YEARLY',
          paymentStatus: 'PAID',
          dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }
      });
      console.log('✅ Test students created');
    } catch (error) {
      console.log('ℹ️  Students already exist, skipping creation');
    }

    // 6. Clear existing borrow history and create some sample history
    await prisma.borrowHistory.deleteMany({});
    console.log('🗑️  Cleared existing borrow history');

    // Create some borrow history for realistic dashboard data
    if (student1 && createdBooks.length > 0) {
      // Student 1 is currently reading 2 books
      await prisma.borrowHistory.create({
        data: {
          studentId: student1.id,
          bookId: createdBooks[0].id,
          borrowDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
          status: 'BORROWED'
        }
      });

      await prisma.borrowHistory.create({
        data: {
          studentId: student1.id,
          bookId: createdBooks[1].id,
          borrowDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
          status: 'BORROWED'
        }
      });

      // Student 1 has completed 2 books
      await prisma.borrowHistory.create({
        data: {
          studentId: student1.id,
          bookId: createdBooks[2].id,
          borrowDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          returnDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // returned 7 days ago
          status: 'RETURNED'
        }
      });

      await prisma.borrowHistory.create({
        data: {
          studentId: student1.id,
          bookId: createdBooks[3].id,
          borrowDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
          dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          returnDate: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000), // returned 32 days ago
          status: 'RETURNED'
        }
      });

      console.log('✅ Sample borrow history created');
    }
    
    // Display summary
    const totalBooks = await prisma.book.count();
    const totalStudents = await prisma.student.count();
    const totalBorrows = await prisma.borrowHistory.count();
    console.log(`📊 Database Summary:`);
    console.log(`   - Books: ${totalBooks}`);
    console.log(`   - Students: ${totalStudents}`);
    console.log(`   - Borrow Records: ${totalBorrows}`);
    console.log('🎉 Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
}

seedAll();