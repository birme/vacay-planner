const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { getVacationsDb } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const vacationSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().allow(''),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  status: Joi.string().valid('pending', 'approved', 'rejected').default('pending'),
  type: Joi.string().valid('vacation', 'sick', 'personal', 'other').default('vacation')
});

const updateVacationSchema = Joi.object({
  title: Joi.string().min(1),
  description: Joi.string().allow(''),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  status: Joi.string().valid('pending', 'approved', 'rejected'),
  type: Joi.string().valid('vacation', 'sick', 'personal', 'other')
}).custom((value, helpers) => {
  if (value.startDate && value.endDate && new Date(value.endDate) < new Date(value.startDate)) {
    return helpers.error('any.invalid', { message: 'End date must be after start date' });
  }
  return value;
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const vacationsDb = getVacationsDb();
    let selector = {};
    
    if (req.user.role !== 'admin') {
      selector.userId = req.user.id;
    }

    const result = await vacationsDb.find({
      selector,
      sort: [{ startDate: 'desc' }]
    });

    res.json(result.docs);
  } catch (error) {
    console.error('Get vacations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const vacationsDb = getVacationsDb();
    const result = await vacationsDb.find({
      selector: { id: req.params.id }
    });

    if (result.docs.length === 0) {
      return res.status(404).json({ message: 'Vacation not found' });
    }

    const vacation = result.docs[0];

    if (req.user.role !== 'admin' && vacation.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(vacation);
  } catch (error) {
    console.error('Get vacation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = vacationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const vacationsDb = getVacationsDb();

    const newVacation = {
      _id: `vacation_${uuidv4()}`,
      id: uuidv4(),
      ...value,
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      createdAt: new Date().toISOString()
    };

    await vacationsDb.insert(newVacation);

    res.status(201).json(newVacation);
  } catch (error) {
    console.error('Create vacation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { error, value } = updateVacationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const vacationsDb = getVacationsDb();
    const result = await vacationsDb.find({
      selector: { id: req.params.id }
    });

    if (result.docs.length === 0) {
      return res.status(404).json({ message: 'Vacation not found' });
    }

    const vacation = result.docs[0];

    if (req.user.role !== 'admin' && vacation.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role !== 'admin' && value.status) {
      return res.status(403).json({ message: 'Only administrators can change vacation status' });
    }

    const updatedVacation = {
      ...vacation,
      ...value,
      updatedAt: new Date().toISOString()
    };

    await vacationsDb.insert(updatedVacation);

    res.json(updatedVacation);
  } catch (error) {
    console.error('Update vacation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const vacationsDb = getVacationsDb();
    const result = await vacationsDb.find({
      selector: { id: req.params.id }
    });

    if (result.docs.length === 0) {
      return res.status(404).json({ message: 'Vacation not found' });
    }

    const vacation = result.docs[0];

    if (req.user.role !== 'admin' && vacation.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await vacationsDb.destroy(vacation._id, vacation._rev);
    res.status(204).send();
  } catch (error) {
    console.error('Delete vacation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;