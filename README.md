# SkyDeck

A feature-complete Bluesky social media web frontend with a multi-column "deck" interface, inspired by [deck.blue](https://deck.blue).

## Features

- **Multi-Column Layout**: Drag-and-drop customizable columns for Home, Notifications, Messages, Search, Lists, Custom Feeds, and Profiles
- **Full Bluesky Integration**: Complete ATProto API support for posts, feeds, DMs, notifications, and moderation
- **Theme Customization**: Full control over colors, typography, layout, and custom CSS
- **Real-time Updates**: WebSocket-powered live feeds and notifications
- **Media Support**: Images, videos, GIFs, and link previews
- **Moderation Tools**: Block, mute, report, and word filtering
- **Responsive Design**: Works on desktop and mobile
- **Accessible**: WCAG 2.2 compliant with keyboard navigation

## Tech Stack

### Backend
- Node.js 20+ with Express.js
- PostgreSQL with Prisma ORM
- Redis for caching and sessions
- Socket.io for real-time updates
- @atproto/api for Bluesky integration

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- Zustand for state management
- @dnd-kit for drag-and-drop
- React Query for data fetching

## Quick Start

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- A Bluesky account

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/skydeck.git
cd skydeck
```

2. Start the database and Redis:
```bash
docker-compose up -d postgres redis
```

3. Set up the backend:
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

4. Set up the frontend (in a new terminal):
```bash
cd frontend
npm install
npm run dev
```

5. Open http://localhost:5173 in your browser

### Production Deployment

1. Create a `.env` file with your secrets:
```bash
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-secure-session-secret
```

2. Build and run with Docker Compose:
```bash
docker-compose up -d
```

3. Access the app at http://localhost:5173

## Project Structure

```
skydeck/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utilities
│   │   ├── socket/          # WebSocket handlers
│   │   └── jobs/            # Background jobs
│   └── prisma/              # Database schema
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── stores/          # Zustand stores
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   └── utils/           # Utilities
│   └── public/              # Static assets
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with Bluesky credentials
- `POST /api/auth/logout` - Logout current session
- `GET /api/auth/me` - Get current user

### Posts
- `POST /api/posts` - Create a post
- `GET /api/posts/:uri` - Get post thread
- `DELETE /api/posts/:uri` - Delete a post
- `POST /api/posts/:uri/like` - Like a post
- `POST /api/posts/:uri/repost` - Repost

### Feeds
- `GET /api/feeds/timeline` - Get home timeline
- `GET /api/feeds/feed/:feedUri` - Get custom feed
- `GET /api/feeds/mentions` - Get mentions

### Columns
- `GET /api/columns` - Get user's columns
- `POST /api/columns` - Create column
- `PATCH /api/columns/:id` - Update column
- `DELETE /api/columns/:id` - Delete column
- `POST /api/columns/reorder` - Reorder columns

### Themes
- `GET /api/themes` - Get user's theme
- `PATCH /api/themes` - Update theme
- `POST /api/themes/reset` - Reset to default
- `GET /api/themes/presets` - Get theme presets

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 3001 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | redis://localhost:6379 |
| `JWT_SECRET` | JWT signing secret | - |
| `SESSION_SECRET` | Session secret | - |
| `BLUESKY_SERVICE` | Bluesky API service URL | https://bsky.social |
| `BLUESKY_CHAT_SERVICE` | Bluesky Chat API URL | https://api.bsky.chat |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Bluesky](https://bsky.app) for the amazing decentralized social platform
- [deck.blue](https://deck.blue) for the design inspiration
- The ATProto team for the excellent SDK
