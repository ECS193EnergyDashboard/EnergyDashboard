# EnergyDashboard

## Dependencies

- angular
- bootstrap 3.0

### Node Dependencies

- express
- body-parser

#### Bower Dependencies
- angular-daterangepicker

## Install Dependencies
- Navigate to app directory
- run `sudo npm install`
- `sudo npm install bower -g`
- `bower install`


### Accessing the Server
1. **UNIX based system**

    * Navigate to the SSH directory on your computer:

    `cd ~/.ssh`

    * Edit the file named `config` to contain the following:
    ```
    Host dash-server
    Hostname ec2-52-53-118-90.us-west-1.compute.amazonaws.com
    User ec2-user
    IdentityFile ~/.ssh/EnergyDashboard.pem
    ```
    * Then place the `EnergyDashboard.pem` private key file in the `~.ssh/` directory.

    * Confirm the configuration works by SSHing into the server:

    `ssh dash-server`

2. **Windows**

    * Download putty at this link [here](http://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html)
    * Download putty key generator (puttygen.exe) from above link
    * Open key generator, load the .pem file, then generate private key (ppk)
    * Run putty, in host name enter: `ec2-52-53-118-90.us-west-1.compute.amazonaws.com`
    * On Auth in "Private key file for authentication" field enter the path of the ppk file.
    * On Data in "Auto-login username" field enter `ec2-user`
    * Save and Open the connection

### Running the Server
The repo is located in the `~/www/` directory.

By default, the `node` server should run on startup. You can control the `node` server with these commands:

- `sudo service dash-server start`
- `sudo service dash-server stop`
- `sudo service dash-server restart`

You can reboot the AWS server with `sudo reboot`.

### Deploying to the Server With Git
Navigate to the project directory on your local machine, and add a new `remote` called `deploy` with:

`git remote add deploy dash-server:/home/ec2-user/EnergyDashboard.git`

Now anytime you want to push the Release branch to the server, use:

`git push deploy Release`