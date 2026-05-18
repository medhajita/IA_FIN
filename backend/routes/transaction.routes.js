const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middlewares/auth.middleware');
const { uploadCSV, getTransactions, updateTransactionCategory, recategorize, createTransaction, updateTransaction, deleteTransaction, seedDemo } = require('../controllers/transaction.controller');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv files are allowed'));
    }
  },
});

router.post('/upload', verifyToken, upload.single('file'), uploadCSV);
router.post('/seed-demo', verifyToken, seedDemo);
router.post('/categorize', verifyToken, recategorize);
router.get('/', verifyToken, getTransactions);
router.post('/', verifyToken, createTransaction);
router.put('/:id', verifyToken, updateTransaction);
router.delete('/:id', verifyToken, deleteTransaction);
router.patch('/:id/category', verifyToken, updateTransactionCategory);

module.exports = router;
