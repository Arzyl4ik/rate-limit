import express from 'express'

const app = express()
app.use(express.json())

const requestLog = new Map()

const WINDOW_MS = 10_000
const LIMIT = 5

const rateLimitMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress

  const now = Date.now();
  const history = requestLog.get(ip) || []

  const recentHistory = history.filter(timestamp => now - timestamp < WINDOW_MS)

  if (recentHistory.length >= LIMIT) {
    return res.status(429).json({
      message: 'Слишком много запросов'
    });
  }

  recentHistory.push(now)
  requestLog.set(ip, recentHistory)

  next()
};

app.use(rateLimitMiddleware);

app.get('/', (req, res) => {
  res.json({ message: 'Это защищённый эндпоинт? Наверное' })
});

app.listen(3000, () => {
  console.log('Server running on: http://localhost:3000/')
})