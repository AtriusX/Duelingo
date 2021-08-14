# Capstone Project (Competitive Duolingo)

The purpose of this project is to experiement with the possibility of duolingo being a competitive platform.

To get the project running, you will need to have a few things prepared before it will work properly.

## Requirements

- [Yarn](https://classic.yarnpkg.com/en/docs/install/)
- [Redis](https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-ubuntu-20-04)
  - Linux allows you to install Redis directly without extra dependencies.
  - If you are on Windows you will need to install WSL 2 first. I recommend using [Ubuntu 20.04](https://www.microsoft.com/en-us/p/ubuntu-2004-lts/9n6svws3rx71) for this system.
  - Mac is unfortunately unsupported in this installation guide, though you should be able to install this through [Homebrew](https://phoenixnap.com/kb/install-redis-on-mac).
- [PostgreSQL](https://www.postgresql.org/)
- [Docker Desktop (Production)](https://www.docker.com/products/docker-desktop) 

## Installation

### Yarn:

Yarn is the package manager that this project is built with, so it will be necessary to have it available in order to download and install all the necessary dependencies.

### Redis: 

Redis is the system we use for session storage, and later potentially for game system management. Redis is an in-memory datastore, meaning we can save and recall data much more quickly than we could by using a conventional database (though with the added trade-off of saved data being volatile). This system was chosen for sessions primarily because of its read/write throughput, since we assume session states will change much more frequently, and as a way to keep session state off the main server process. Installing the software will require the use of an open terminal for most of the process.

Redis is only natively supported on Linux, so if you use Windows or Mac you will need to first install WSL or Homebrew respectively before you can continue. Once you have the prerequesites installed, you can now move forward with the installation. For the rest of this installation, we will assume you are using WSL since this is what the system was developed on. If you are running on Linux or Mac, please consult installation guides for those platforms.

You want to begin by opening a WSL terminal in the command prompt by running the `wsl` command. This should run your default linux subsystem and allow you to run commands through it. From here, start by running `sudo apt update` and entering your password if prompted (this should likely be your system user password). Once the command has finished executing, you will want to install Redis using the command `sudo apt install redis-server`. This should install any necessary components for interactions with Redis to take place. From here, you should now run `sudo service redis-server restart` to ensure that Redis has started successfully, and then you can check if you can connect by running `redis-cli`. If you see the prompt change to an IP address, you have successfully installed the application.

### Postgres:

Postgres is the database we rely on for our back end system. The installation for this may be a bit more involved, but it shouldn't be too crazy overall. You'll want to download the Postgres installer and run it, from there it will prompt you for various database settings. You will want to set the default password for `postgres` to `password` (this is what we currently use in the application; may change later on). You will also be prompted for the post number, but you should leave this on the default value of `5432`.

Once you have completed the installation, you can now verify the installation by opening a command prompt window and running the command `psql -U postgres` and then entering `password` when you are prompted for it. If this worked, then you can exit the database cli and run `createdb -U postgres capstone` to create the database. From here, you should now be ready to move on to the actual project.

## Setup

You will want to extract the project to a local directory, and then open a command prompt window in the folder. Once you have the command prompt opened to this directory you should run `yarn setup`. This will install the dependencies for both the front end and the back end, and then create database migrations for the backend.

## Running

From here you should now create two more command prompts (one for each system). Migrate both instances to the web and server directories respectively, and run `yarn dev` to start the front end, and `yarn start` to run the back end.

The front end is accessible from the address `http://localhost:4000/` and the back end runs off port `3000`. 

On the first run of the system, the application will also generate a set of 1000 test users. This will only run if the user count dips below 1000 in development mode, and can be used in testing different functions on the system. Any mockups created for each phase will be stored in the corresponding folder under the `/mock` directory.

# Production 

Our production system is a bit different than how the development environment is meant to function. In order to ensure stability and ease of use across systems, we bundle and install the application as a docker container. This allows us the ability to simplify the setup process to a certain extent as well.

## Installation

The requirements for production builds are largely the same, however you will not need to install Redis yourself. Redis is automatically installed alongside the application as a container. You will still need to have a Postgres database available on your machine outside of docker however. So if you do not have this installed please follow the instructions [above](#postgres).

Yarn is also still needed for running our scripts, please make sure you have that installed as well. If you do not, follow the instructions [above](#yarn).

### Docker Desktop

By this point, you will need to install Docker onto your system to allow for the application environment to be build, installed, and ran. Depending on your operating system you may need a support system such as WSL 2 (Windows) to use it. If you need to install a support system, please check the [requirements](#requirements) under Redis to find a guide for your specific system.

Installing Docker Desktop after this is relatively straightforward. You simply just download the installer from the website, and after you run it the application should become available to you.

## Setup and Running

Once Docker is started and you have gone through the initial guide phase of the program, you can now come back here and build the application. From here, simply open a terminal in the root directory of the project and run `yarn compose`. This will kick off a series of docker builds that will eventually be bundled into a network of containers. After this, the application will be accessible from `http://localhost:8080/`.