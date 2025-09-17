const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware.js');
const { addSubject, getSubject, deleteSubject, updateSubject, getSubjectById } = require('../controller/subjectControllers.js');

router.post('/', authMiddleware, addSubject);
router.get('/', authMiddleware, getSubject);
router.get('/:id', authMiddleware, getSubjectById);
router.delete('/delete/:id', authMiddleware, deleteSubject);
router.put('/update/:id', authMiddleware, updateSubject);

module.exports = router;