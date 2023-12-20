# Sauna

## Ziel: Eine selbst gebaute Sauna - von der Planung bis zur ersten Inbetriebnahme

## Features:
    - Saunaofen mit Verdampfer
    - Infrarotstrahler
    - RGB-LED
    - SmartHome-Integration (in Home Assistant)

## Saunacontroller:
    Hardware
        - ESP32-Microcontroller
        - 4x DS18B20
        - 4,7k Ohm Widerstand
        - 5V Netzteil
        - AM3220 Luftfeuchtesensor
        - 4x SSR-40-DA
        - 6-fach PCB-LED-Treiberplatine zur Ansteuerung der SSRS
        - ...

    Software:
        - ESPHome-Installation in Home Assistant: https://esphome.io/guides/getting_started_hassio.html
        - bei Ressourcenschwachem Home Assistant - Hostrechner zusätzlich (Exceptions bemi Compilieren)
            - installiertes Python und ESPHome: https://esphome.io/guides/installing_esphome.html
            - esphome-flasher: https://github.com/esphome/esphome-flasher

    Vorgehensweise Firmware flashen:
        - Kompilieren mit "esphome compile .\saunacontroller.yaml"
        - Flashen des ESP32 mit der Datei "firmware.bin" mit esphome-flasher (https://web.esphome.io/ funktioniert bei mir nicht)
