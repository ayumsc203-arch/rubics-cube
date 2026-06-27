const prisma = require('../config/db');

async function getLeaderboard(req, res) {
  try {
    const board = await prisma.profile.findMany({
      orderBy: { xp: 'desc' },
      take: 10,
      select: {
        username: true,
        xp: true,
        lvl: true,
        avatar: true
      }
    });
    res.json(board);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

async function getPosts(req, res) {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: { id: 'desc' },
      take: 20
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load community feed' });
  }
}

async function createPost(req, res) {
  const { text } = req.body;
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id }
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const post = await prisma.communityPost.create({
      data: {
        authorName: profile.username,
        text,
        userId: req.user.id
      }
    });
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to publish post' });
  }
}

async function likePost(req, res) {
  const { id } = req.params;
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: parseInt(id) }
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const updated = await prisma.communityPost.update({
      where: { id: post.id },
      data: { likes: post.likes + 1 }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to like post' });
  }
}

async function getNotifications(req, res) {
  try {
    const notis = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { id: 'desc' }
    });
    res.json(notis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load alerts list' });
  }
}

module.exports = {
  getLeaderboard,
  getPosts,
  createPost,
  likePost,
  getNotifications
};
