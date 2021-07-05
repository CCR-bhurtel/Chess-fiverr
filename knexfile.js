module.exports = {
  development: {
    client: 'pg',
    connection: {
      port: process.env.DATABASE_PORT || '5432',
      host: process.env.DATABASE_HOST || 'localhost',
      database: process.env.DATABASE_NAME || 'chess-new',
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_ACCESS_KEY || 'test@123',
    },
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds/dev'
    },
    useNullAsDefault: true
  },

  test: {
    client: 'pg',
    connection: {
      port: process.env.DATABASE_PORT || '5432',
      host: process.env.DATABASE_HOST || 'localhost',
      database: process.env.DATABASE_NAME || 'chess-new',
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_ACCESS_KEY || 'test@123',
    },
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds/test'
    },
    useNullAsDefault: true
  },

  production: {
    client: 'pg',
    connection: {
      port: process.env.DATABASE_PORT || '5432',
      host: process.env.DATABASE_HOST || 'localhost',
      database: process.env.DATABASE_NAME || 'chess-new',
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_ACCESS_KEY || 'test@123',
    },
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds/production'
    },
    useNullAsDefault: true
  }
}
