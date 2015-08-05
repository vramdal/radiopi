---
layout: post
title: Oppsett og test av DAB-kort
date: 2015-08-04 23:15:00 +0100
---

Følger [oppskriften for å sette opp MonkeyBoard med Raspberry Pi][1].

Det vil si:

1 Plugg inn DAB-kortet i Raspberry Pi'en med en USB-kabel
2 Kjør `dmesg` for å finne ut hvilket navn kortet får under `/dev/`
3 Last ned biblioteket for kortet, og kompiler og kjør eksempel-programmet:

```bash
wget http://www.monkeyboard.org/images/products/dab_fm/raspberrypi_keystone.tgz
tar -xvzpf raspberrypi_keystone.tgz keystonecomm/
cd keystonecomm/KeyStoneCOMM/
sudo make install
cd ../app/
make
sudo ./testdab
```
Dette lister ut en haug med stasjoner.

4 Gjør tty'en tilgjengelig for ikke-sudo-brukere:

```bash
sudo nano /etc/udev/rules.d/75-microchip.rules
```

... og lim inn:

```bash
#DAB Serial Port
KERNEL=="ttyACM0", ATTRS{idVendor}=="04d8", ATTRS{idProduct}=="000a", MODE="666", GROUP="pi"
```

Trykk <kbd>Ctrl</kbd>-<kbd>O</kbd>, <kbd>Enter</kbd>, <kbd>Ctrl</kbd>-<kbd>X</kbd> for å lagre og avslutte.

5 Restart:

```bash
sudo shutdown -r now
```

6 Start eksempel-app'en igjen (denne gangen trenger vi ikke `sudo`):

```bash
cd keystonecomm/app
./testdab
```


Igjen listes det ut en masse stasjoner.

[1]: http://www.monkeyboard.org/tutorials/78-interfacing/87-raspberry-pi-linux-dab-fm-digital-radio