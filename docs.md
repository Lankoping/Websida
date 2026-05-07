# Lankoping.se Documentation

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

### Resetting a User's Password
If you need to reset a user's password from the command line, run:
```bash
npm run setpassword
```
This script will prompt you for the user's email address and their new password.

## Development
To start the development server:
```bash
npm run dev
```
