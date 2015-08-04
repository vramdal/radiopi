---
layout: post
title: Oppsett
date: 2015-08-04 23:15:00 +0100
---

Følger [oppskriften for å sette opp MonkeyBoard med Raspberry Pi][1].

Det vil si:

1. plugge inn DAB-kortet i Raspberry Pi'en med en USB-kabel
2. kjøre `dmesg` for å finne ut hvilket navn kortet får under `/dev/`
3. Laste ned biblioteket for kortet, og kjøre eksempel-programmet:


       wget http://www.monkeyboard.org/images/products/dab_fm/raspberrypi_keystone.tgz
       tar -xvzpf raspberrypi_keystone.tgz keystonecomm/
       cd keystonecomm/KeyStoneCOMM/
       sudo make install
       cd ../app/
       make
       sudo ./testdab




[1]: http://www.monkeyboard.org/tutorials/78-interfacing/87-raspberry-pi-linux-dab-fm-digital-radio