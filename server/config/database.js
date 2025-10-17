const nano = require('nano');

let couchdb;
let usersDb;
let vacationsDb;

const initialize = async () => {
  try {
    couchdb = nano(process.env.COUCHDB_URL);
    
    try {
      await couchdb.db.create('users');
    } catch (err) {
      if (err.statusCode !== 412) {
        throw err;
      }
    }
    
    try {
      await couchdb.db.create('vacations');
    } catch (err) {
      if (err.statusCode !== 412) {
        throw err;
      }
    }
    
    usersDb = couchdb.use('users');
    vacationsDb = couchdb.use('vacations');
    
    await createIndexes();
    await createDefaultAdmin();
    
    console.log('Connected to CouchDB successfully');
  } catch (error) {
    console.error('Failed to connect to CouchDB:', error);
    throw error;
  }
};

const createIndexes = async () => {
  try {
    // Index for users by email
    await usersDb.createIndex({
      index: {
        fields: ['email']
      },
      name: 'email-index'
    });

    // Index for vacations by userId
    await vacationsDb.createIndex({
      index: {
        fields: ['userId']
      },
      name: 'userId-index'
    });

    // Index for vacations by status
    await vacationsDb.createIndex({
      index: {
        fields: ['status']
      },
      name: 'status-index'
    });

    // Index for vacations by startDate (for sorting)
    await vacationsDb.createIndex({
      index: {
        fields: ['startDate']
      },
      name: 'startDate-index'
    });

    // Index for vacations by id
    await vacationsDb.createIndex({
      index: {
        fields: ['id']
      },
      name: 'id-index'
    });

    // Index for users by id
    await usersDb.createIndex({
      index: {
        fields: ['id']
      },
      name: 'user-id-index'
    });

    console.log('Database indexes created successfully');
  } catch (error) {
    console.log('Indexes may already exist:', error.message);
  }
};

const createDefaultAdmin = async () => {
  try {
    await usersDb.get('admin');
  } catch (err) {
    if (err.statusCode === 404) {
      const bcrypt = require('bcryptjs');
      const { v4: uuidv4 } = require('uuid');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = {
        _id: 'admin',
        id: uuidv4(),
        email: 'admin@company.com',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'admin',
        active: true,
        createdAt: new Date().toISOString()
      };
      
      await usersDb.insert(adminUser);
      console.log('Default admin user created');
    }
  }
};

const getUsersDb = () => usersDb;
const getVacationsDb = () => vacationsDb;

module.exports = {
  initialize,
  getUsersDb,
  getVacationsDb
};