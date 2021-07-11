# Capstone Project (Competitive Duolingo)

The purpose of this project is to experiement with the possibility of duolingo being a competitive platform.

To get the project running, you will need to have a few things prepared before it will work properly.

## Requirements

- [Yarn](https://classic.yarnpkg.com/en/docs/install/)
- [PostgreSQL](https://www.postgresql.org/)

## Installation

Yarn is the package manager that this project is built with, so it will be necessary to have it available in order to download and install all the necessary dependencies.

Postgres is the database we rely on for our back end system. The installation for this may be a bit more involved, but it shouldn't be too crazy overall. You'll want to download the Postgres installer and run it, from there it will prompt you for various database settings. You will want to set the default password for `postgres` to `password` (this is what we currently use in the application; mmay change later on). You will also be prompted for the post number, but you should leave this on the default value of `5432`.

Once you have completed the installation, you can now verify the installation by opening a command prompt window and running the command `psql -U postgres` and then entering `password` when you are prompted for it. If this worked, then you can exit the database cli and run `createdb -U postgres capstone` to create the database. From here, you should now be ready to move on to the actual project.

## Setup

You will want to extract the project to a local directory, and then open a command prompt window in the folder. Once you have the command prompt opened to this directory you should run `yarn setup`. This will install the dependencies for both the front end and the back end, and then create database migrations for the backend.

## Running

From here you should now create two more command prompts (one for each system). Migrate both instances to the web and server directories respectively, and run `yarn dev` to start the front end, and `yarn start` to run the back end.

The front end is accessible from the address `http://localhost:4000/` and the back end runs off port `3000`.