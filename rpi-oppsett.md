---
layout: post
title: Oppsett av Raspberry Pi
date: 2015-08-05 01:45:00 +0100
---
1 Oppdater pakkebeskrivelser

```bash
sudo apt-get update
sudo apt-get upgrade
```

2 Installer Node.js

```bash
sudo wget http://node-arm.herokuapp.com/node_latest_armhf.deb
sudo dpkg -i node_latest_armhf.deb
sudo rm node_latest_armhf.deb
```

3 Klon GitHub-repositoriet for RadioPi

```bash
git clone https://github.com/vramdal/radiopi
cd radiopi
```

4 Kompiler koden

```bash
npm install
```