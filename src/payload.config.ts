import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { resendAdapter } from '@payloadcms/email-resend'

import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { FloatingDynamicIsland } from './FloatingDynamicIsland/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { LegalPages } from '@/collections/LegalPages'
import { getDatabaseConnectionString } from '@/utilities/getDatabaseConnectionString'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const payloadSecret = process.env.PAYLOAD_SECRET
const dbConnectionString = getDatabaseConnectionString()

if (!payloadSecret) {
  throw new Error(
    'Missing PAYLOAD_SECRET. Set a strong PAYLOAD_SECRET in your environment (Vercel: Project Settings -> Environment Variables).',
  )
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error('BLOB_READ_WRITE_TOKEN is missing — Vercel Blob will fall back to local disk')
}

if (!dbConnectionString) {
  throw new Error(
    'Missing database connection string. Set one of: PARADIGM_POSTGRES_URL, PARADIGM_POSTGRES_URL_NON_POOLING, POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, DATABASE_URL, or DATABASE_URL_UNPOOLED.',
  )
}

export default buildConfig({
  email: resendAdapter({
    defaultFromAddress: 'info@updates.paradigm-clubs.com', // must be on a verified domain
    defaultFromName: 'Paradigm',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      // beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: vercelPostgresAdapter({
    pool: {
      connectionString: dbConnectionString,
    },
    // During active development, allow schema push by default so DB changes track config changes.
    // Override with PAYLOAD_DB_PUSH=false when you need to run dev without destructive sync.
    // In non-development environments this stays off unless explicitly set true.
    push: true,
  }),
  collections: [Pages, Posts, Media, Categories, Users, LegalPages],
  cors: [
    process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_URL ||
      process.env.VERCEL_BRANCH_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'http://localhost:3000',
  ].filter(Boolean),
  globals: [Header, Footer, FloatingDynamicIsland],
  plugins: [...plugins],
  secret: payloadSecret,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
