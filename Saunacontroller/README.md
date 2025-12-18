# Sauna Controller

ESP32-basierte Sauna-Steuerung mit ESPHome. Regelt Temperatur, Luftfeuchtigkeit, Infrarotstrahler und Beleuchtung.

## Features

- **Thermostat** - Automatische Temperaturregelung (20-90°C)
- **Hygrostat** - Automatische Luftfeuchte-Regelung (30-70%)
- **Infrarotstrahler** - Dimmbar über AC-Dimmer
- **LED-Beleuchtung** - WS2812 RGB-Streifen und Salzkristall-Leuchten
- **Standalone-Betrieb** - Funktioniert ohne Home Assistant
- **Home Assistant Integration** - Optional über ESPHome API

## Hardware

| Komponente | GPIO | Beschreibung |
|------------|------|--------------|
| Saunaofen | GPIO16 | Relais (internal) |
| Verdampfer | GPIO17 | Relais (internal) |
| Infrarotstrahler 1 | GPIO18 | AC-Dimmer |
| Infrarotstrahler 2 | GPIO19 | AC-Dimmer |
| Zero-Cross Detection | GPIO5 | AC-Dimmer |
| LED Salzkristall | GPIO2 | WS2812 (16 LEDs) |
| LED Streifen | GPIO15 | WS2812 (213 LEDs) |
| AM2320 SDA | GPIO33 | Temperatur/Feuchte |
| AM2320 SCL | GPIO32 | Temperatur/Feuchte |
| Dallas DS18B20 | GPIO23 | Temperatur Steuergerät |

## Installation

### 1. secrets.yaml erstellen

```yaml
wifi_ssid: "DEIN_WLAN"
wifi_password: "DEIN_PASSWORT"
api_encryption_key: "DEIN_API_KEY"
ota_password: "DEIN_OTA_PASSWORT"
saunacontroller_ap_ssid: "Sauna-Fallback"
saunacontroller_ap_password: "fallback123"
saunacontroller_webserver_user: "admin"
saunacontroller_webserver_password: "DEIN_WEBSERVER_PASSWORT"
```

### 2. Firmware flashen

```bash
# Validieren
esphome config saunacontroller.yaml

# Kompilieren und Flashen (USB)
esphome run saunacontroller.yaml

# Oder OTA-Update
esphome run saunacontroller.yaml --device saunacontroller.local
```

### 3. Webinterface öffnen

Nach dem Start ist das Webinterface erreichbar unter:
- `http://saunacontroller.local` (mDNS)
- Oder über die IP-Adresse im Router

## Bedienung

### Webinterface

Das Webinterface zeigt alle Steuerungselemente in Gruppen:

| Gruppe | Funktion |
|--------|----------|
| **Sauna** | Thermostat ein/aus, Zieltemperatur einstellen |
| **Verdampfer** | Hygrostat ein/aus, Ziel-Luftfeuchtigkeit einstellen |
| **Infrarot** | Infrarotstrahler dimmen |
| **Beleuchtung** | LED-Farben und Helligkeit |
| **System** | Neustart, Diagnose-Informationen |

### Thermostat

1. Modus auf "Heizen" stellen
2. Zieltemperatur einstellen (Standard: 80°C)
3. Der Ofen schaltet automatisch ein/aus

### Hygrostat

1. "Hygrostat" Toggle einschalten
2. Ziel-Luftfeuchtigkeit einstellen (Standard: 50%)
3. Der Verdampfer regelt automatisch

## Sicherheit

- **Nach Neustart:** Alle Regler starten im AUS-Zustand
- **Hysterese:** Verhindert häufiges Schalten
  - Temperatur: ±0.3°C
  - Luftfeuchtigkeit: ±3%

## Home Assistant (optional)

Die ESPHome API ist aktiv. Nach dem Hinzufügen in HA sind folgende Entities verfügbar:

```
climate.saunacontroller_sauna_thermostat
switch.saunacontroller_hygrostat
number.saunacontroller_ziel_luftfeuchtigkeit
sensor.saunacontroller_temperatur_sauna
sensor.saunacontroller_luftfeuchte_sauna
light.saunacontroller_infrarotstrahler_1
light.saunacontroller_infrarotstrahler_2
light.saunacontroller_led_salzkristall_leuchten
light.saunacontroller_led_streifen
```

## Troubleshooting

### AM2320 Sensor liefert keine Werte
- I²C-Verbindung prüfen (SDA/SCL)
- Sensor benötigt angeschlossen zu sein beim Booten

### Webinterface nicht erreichbar
- Fallback-AP prüfen: "Sauna-Fallback" WLAN
- IP-Adresse im Router nachschlagen

### OTA-Update schlägt fehl
- Firewall-Einstellungen prüfen
- ESPHome und Firmware-Version abgleichen
