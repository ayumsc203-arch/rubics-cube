const prisma = require('../config/db');

async function getProfile(req, res) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id }
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}

async function updateProfile(req, res) {
  const { username, avatar, bio, country } = req.body;
  try {
    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: { username, avatar, bio, country }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

async function getSolves(req, res) {
  try {
    const solves = await prisma.solve.findMany({
      where: { userId: req.user.id },
      orderBy: { id: 'desc' }
    });
    res.json(solves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch solves' });
  }
}

async function addSolve(req, res) {
  const { time, scramble, type } = req.body;
  const dateStr = new Date().toISOString().split('T')[0];

  try {
    const solve = await prisma.$transaction(async (tx) => {
      // 1. Create Solve record
      const s = await tx.solve.create({
        data: {
          time: parseFloat(time),
          scramble,
          type,
          date: dateStr,
          userId: req.user.id
        }
      });

      // 2. Fetch Profile to update XP / level / coins
      const profile = await tx.profile.findUnique({
        where: { userId: req.user.id }
      });

      if (!profile) throw new Error('Profile not found');

      let xp = profile.xp + 15;
      let coins = profile.coins + 5;
      let lvl = profile.lvl;
      let leveledUp = false;

      const threshold = lvl * 100;
      if (xp >= threshold) {
        xp -= threshold;
        lvl++;
        leveledUp = true;

        // Create system notification for level up
        await tx.notification.create({
          data: {
            message: `🎉 Leveled Up! You are now Level ${lvl}!`,
            userId: req.user.id
          }
        });
      }

      await tx.profile.update({
        where: { userId: req.user.id },
        data: { xp, coins, lvl }
      });

      return { solve: s, leveledUp, lvl };
    });

    res.status(201).json(solve);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record solve' });
  }
}

async function getFavorites(req, res) {
  try {
    const favs = await prisma.favoriteAlgo.findMany({
      where: { userId: req.user.id }
    });
    res.json(favs.map(f => f.algoName));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
}

async function toggleFavorite(req, res) {
  const { algoName } = req.body;
  try {
    const existing = await prisma.favoriteAlgo.findFirst({
      where: { userId: req.user.id, algoName }
    });

    if (existing) {
      await prisma.favoriteAlgo.delete({ where: { id: existing.id } });
      res.json({ favorite: false, message: 'Removed from favorites' });
    } else {
      await prisma.favoriteAlgo.create({
        data: { userId: req.user.id, algoName }
      });
      res.json({ favorite: true, message: 'Added to favorites' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getSolves,
  addSolve,
  getFavorites,
  toggleFavorite
};
