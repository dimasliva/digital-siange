CREATE DATABASE docker_dss;
CREATE USER 'dsserver'@'localhost' IDENTIFIED BY "revressd";
GRANT ALL PRIVILEGES ON `docker_dss`.* TO 'dsserver'@'localhost';
FLUSH PRIVILEGES;
