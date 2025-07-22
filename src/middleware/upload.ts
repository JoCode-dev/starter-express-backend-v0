import multer from 'multer';

// Configuration de base, à adapter selon les besoins
const storage = multer.memoryStorage();
export const upload = multer({ storage }); 