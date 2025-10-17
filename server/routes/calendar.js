const express = require('express');
const { default: icalGenerator } = require('ical-generator');
const { getVacationsDb } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/feed/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const vacationsDb = getVacationsDb();

    const result = await vacationsDb.find({
      selector: { 
        userId: userId,
        status: 'approved'
      }
    });

    const calendar = icalGenerator({
      domain: req.get('host'),
      name: 'Personal Vacation Calendar',
      description: 'Approved vacation requests for the user',
      timezone: 'UTC'
    });

    result.docs.forEach(vacation => {
      calendar.createEvent({
        start: new Date(vacation.startDate),
        end: new Date(vacation.endDate),
        summary: vacation.title,
        description: vacation.description || '',
        uid: vacation.id,
        organizer: {
          name: vacation.userName,
          email: vacation.userEmail
        }
      });
    });

    res.set({
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="vacation-calendar.ics"'
    });

    res.send(calendar.toString());
  } catch (error) {
    console.error('Calendar feed error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/team-feed', async (req, res) => {
  try {
    const vacationsDb = getVacationsDb();

    const result = await vacationsDb.find({
      selector: { 
        status: 'approved'
      }
    });

    const calendar = icalGenerator({
      domain: req.get('host'),
      name: 'Team Vacation Calendar',
      description: 'All approved vacation requests for the team',
      timezone: 'UTC'
    });

    result.docs.forEach(vacation => {
      calendar.createEvent({
        start: new Date(vacation.startDate),
        end: new Date(vacation.endDate),
        summary: `${vacation.userName} - ${vacation.title}`,
        description: vacation.description || '',
        uid: vacation.id,
        organizer: {
          name: vacation.userName,
          email: vacation.userEmail
        }
      });
    });

    res.set({
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="team-vacation-calendar.ics"'
    });

    res.send(calendar.toString());
  } catch (error) {
    console.error('Team calendar feed error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/urls', authenticateToken, async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.json({
    personalFeed: `${baseUrl}/api/calendar/feed/${req.user.id}`,
    teamFeed: `${baseUrl}/api/calendar/team-feed`
  });
});

module.exports = router;