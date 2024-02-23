# Sauna

## Ziel: Eine selbst gebaute Sauna - von der Planung bis zur ersten Inbetriebnahme

## Features:
    - Saunaofen mit Verdampfer
    - 2x Infrarotstrahler
    - RGB-LED-Streifen
    - 2x Salzkristallleuchte
    - SmartHome-Integration (in Home Assistant)

## Saunacontroller:
    Hardware
        - 1x ESP32-Microcontroller
        - 1x DS18B20
        - 1x 4,7k Ohm Widerstand
        - 1x 5V Netzteil 20A 100W
        - 2x AM2320 Luftfeucht- & Temperatursensor
        - 4x SSR-40-DA
        - 1x 6-fach PCB-LED-Treiberplatine zur Ansteuerung der SSRS
        - 1x 5m LED Stripes WS2812B IP65
        - 2x RobotDYN PWM AC-Dimmer
        - ...

    Software:
        - ESPHome-Installation in Home Assistant: https://esphome.io/guides/getting_started_hassio.html
        - bei Ressourcenschwachem Home Assistant - Hostrechner zusätzlich (Exceptions bemi Compilieren)
            - installiertes Python und ESPHome: https://esphome.io/guides/installing_esphome.html
            - esphome-flasher: https://github.com/esphome/esphome-flasher

    Vorgehensweise Firmware flashen:
        - Kompilieren mit "esphome compile .\saunacontroller.yaml"
        - Flashen des ESP32 mit der Datei "firmware.bin" mit esphome-flasher (https://web.esphome.io/ funktioniert bei mir nicht)
