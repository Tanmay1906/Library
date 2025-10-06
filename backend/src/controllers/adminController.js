const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getLibraries = async (req, res) => {
  const libraries = await prisma.library.findMany({ where: { adminId: req.user.id } });
  res.json(libraries);
};

exports.createLibrary = async (req, res) => {
  const { name, location } = req.body;
  const library = await prisma.library.create({ data: { name, location, adminId: req.user.id } });
  res.json(library);
};

exports.updateLibrary = async (req, res) => {
  const { id } = req.params;
  const { name, location } = req.body;
  const library = await prisma.library.update({ where: { id }, data: { name, location } });
  res.json(library);
};

exports.deleteLibrary = async (req, res) => {
  const { id } = req.params;
  await prisma.library.delete({ where: { id } });
  res.json({ success: true });
};

exports.getProfile = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.user.id },
      include: {
        libraries: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true
          }
        }
      }
    });

    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    const { password, ...adminData } = admin;
    
    res.json({
      success: true,
      data: {
        ...adminData,
        library: admin.libraries[0] || null // Return first library if exists
      }
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, libraryName, libraryAddress } = req.body;
    
    // Update admin details
    const updatedAdmin = await prisma.admin.update({
      where: { id: req.user.id },
      data: { name, email, phone },
      include: {
        libraries: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true
          }
        }
      }
    });

    // Update library details if library exists and library data is provided
    if (updatedAdmin.libraries.length > 0 && (libraryName || libraryAddress)) {
      const libraryId = updatedAdmin.libraries[0].id;
      await prisma.library.update({
        where: { id: libraryId },
        data: {
          ...(libraryName && { name: libraryName }),
          ...(libraryAddress && { address: libraryAddress })
        }
      });
    }

    const { password, ...adminData } = updatedAdmin;
    
    res.json({
      success: true,
      data: {
        ...adminData,
        library: updatedAdmin.libraries[0] || null
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// ...existing code for other admin features
