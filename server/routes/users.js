const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { getUsersDb } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'user').default('user')
});

const updateUserSchema = Joi.object({
  email: Joi.string().email(),
  name: Joi.string().min(2),
  password: Joi.string().min(6),
  role: Joi.string().valid('admin', 'user'),
  active: Joi.boolean()
});

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const usersDb = getUsersDb();
    const result = await usersDb.find({
      selector: {},
      fields: ['_id', 'id', 'email', 'name', 'role', 'active', 'createdAt']
    });

    res.json(result.docs);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, name, password, role } = value;
    const usersDb = getUsersDb();

    const existingUser = await usersDb.find({
      selector: { email: email }
    });

    if (existingUser.docs.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      _id: `user_${uuidv4()}`,
      id: uuidv4(),
      email,
      name,
      password: hashedPassword,
      role,
      active: true,
      createdAt: new Date().toISOString()
    };

    await usersDb.insert(newUser);

    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      active: newUser.active,
      createdAt: newUser.createdAt
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const usersDb = getUsersDb();
    const result = await usersDb.find({
      selector: { id: req.params.id }
    });

    if (result.docs.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.docs[0];
    const updates = { ...value };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    if (updates.email && updates.email !== user.email) {
      const existingUser = await usersDb.find({
        selector: { email: updates.email }
      });
      if (existingUser.docs.length > 0) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await usersDb.insert(updatedUser);

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      active: updatedUser.active,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const usersDb = getUsersDb();
    const result = await usersDb.find({
      selector: { id: req.params.id }
    });

    if (result.docs.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.docs[0];
    
    if (user._id === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }

    await usersDb.destroy(user._id, user._rev);
    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;