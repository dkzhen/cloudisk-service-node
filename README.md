# CloudDisk File Service

A lightweight file management microservice with automatic image optimization built with Node.js and Express.

## Features

- File upload with automatic image optimization (WebP conversion)
- Storage quota management (5GB default)
- Security: Helmet, CORS, Rate limiting, File type validation
- Path traversal protection
- Race condition prevention for concurrent uploads

## Tech Stack

- Node.js 18+ (ES Modules)
- Express 5
- Multer (file uploads)
- Sharp (image processing)

## Installation

```bash
npm install
```

## Configuration

Create `.env` file:

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*
```

## Usage

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

## API Endpoints

### Upload File

```bash
POST /api/files/upload
Content-Type: multipart/form-data
Field: file
```

### List Files

```bash
GET /api/files
```

### Delete File

```bash
DELETE /api/files/:filename
```

### Access File

```bash
GET /files/:filename
```

## Configuration

Edit `src/config/app.config.js` to customize:

- Storage limits
- Rate limiting
- Image optimization settings
- CORS settings

## Allowed File Types

Images, Documents (PDF, Word, Excel), Archives (ZIP, RAR), Text files, Videos, Audio

## Limits

- Max file size: 50MB
- Total storage: 5GB
- Rate limit: 100 requests per 15 minutes

## Deployment

See [VPS_SETUP.md](VPS_SETUP.md) for complete VPS deployment guide.

## License

ISC
