# Länköping.se Documentation

## Database Management

### Migrations
To apply database migrations after resetting the database or pulling new changes, run:
```bash
npm run migrate
```

### Creating an Admin User
If you have reset the database and need to create a new initial admin user, run:
```bash
npm run makeuser
```
This script will prompt you for an email, password, and name, and will create a user with the `organizer` role.

## Development
To start the development server:
```bash
npm run dev
```
