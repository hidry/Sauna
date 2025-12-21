# Sauna Controller - Projektkontext

## Projektübersicht

ESP32-basierte Sauna-Steuerung mit ESPHome. Kann standalone (ohne Home Assistant) oder mit Home Assistant Integration betrieben werden.

## Verzeichnisstruktur

```
Sauna/
├── Saunacontroller/
│   ├── saunacontroller.yaml    # ESPHome Hauptkonfiguration
│   ├── secrets.yaml            # Sensible Daten (nicht committen!)
│   └── homeassistant/
│       └── configuration.yaml  # HA-Konfiguration (optional, nicht mehr benötigt)
├── .devcontainer/
│   └── devcontainer.json       # GitHub Codespaces ESPHome-Umgebung
└── .github/
    └── workflows/
        └── blank.yml           # ESPHome Build Action
```

## Technologie-Stack

- **Hardware:** ESP32 (esp32dev Board)
- **Framework:** ESPHome mit Arduino
- **Sensoren:** AM2320 (Temperatur/Luftfeuchte), Dallas DS18B20
- **Aktoren:** GPIO-Relais (Ofen, Verdampfer), AC-Dimmer (Infrarot), WS2812 LEDs

## Build & Deployment

### Lokal (mit ESPHome installiert)
```bash
esphome config Saunacontroller/saunacontroller.yaml  # Validieren
esphome compile Saunacontroller/saunacontroller.yaml # Kompilieren
esphome upload Saunacontroller/saunacontroller.yaml  # Flashen
```

### GitHub Codespaces
- Codespace starten → ESPHome Dashboard auf Port 6052
- Dashboard öffnet automatisch im Browser

### GitHub Actions
- Build läuft automatisch bei Push auf `main`, `dev`, `claude/**`
- Manuelles Triggern via `workflow_dispatch` möglich

## Architektur

### Standalone-Steuerung (ohne Home Assistant)

Der ESP32 regelt autonom:

1. **Thermostat** (ESPHome Climate Component)
   - Sensor: `temperatur_sauna` (AM2320)
   - Aktor: `saunaofen` (GPIO16, internal)
   - Hysterese: ±3°C (schont Relais, passt zur Trägheit der Sauna)
   - Default: 80°C, startet im OFF-Modus

2. **Hygrostat** (Custom Implementation)
   - Sensor: `luftfeuchte_sauna` (AM2320)
   - Aktor: `saunaverdampfer` (GPIO17, internal)
   - Hysterese: ±3%
   - Default: 50%, Interval-basierte Regelung (10s)

### Home Assistant Integration

Die HA API bleibt aktiv. HA nutzt direkt die ESP-Entities:
- `climate.saunacontroller_sauna_thermostat`
- `switch.saunacontroller_hygrostat`
- `number.saunacontroller_ziel_luftfeuchtigkeit`

Die alte `generic_thermostat`/`generic_hygrostat` Konfiguration ist nicht mehr nötig.

## Webserver-Gruppen

Entities sind im Webserver (Port 80) gruppiert:
1. **Sauna** - Thermostat, Temperatur
2. **Verdampfer** - Hygrostat, Ziel-Luftfeuchtigkeit, Luftfeuchte, Toleranzen
3. **Infrarot** - Infrarotstrahler 1+2
4. **Beleuchtung** - LED Salzkristall, LED Streifen
5. **Statistik** - Betriebsstunden, Session-Zähler
6. **System** - ESP Restart, Debug-Sensoren, Version

## Wichtige Hinweise

- **Nach ESP-Neustart:** Alle Regler starten im OFF-Modus (Sicherheit), LEDs mit Lava-Rot voreingestellt
- **Statistik-Zähler:** Betriebsstunden und Sessions sind persistent (überleben Neustarts), nur laufende Sessions gehen bei Stromausfall verloren
- **AM2320 Sensor:** Update-Interval 30s, kann bei Problemen erhöht werden
- **GPIO-Switches:** `saunaofen` und `saunaverdampfer` sind `internal: true` (nicht direkt steuerbar)
- **secrets.yaml:** Enthält WiFi-Credentials, API-Keys etc. - niemals committen!

## Branching

- `main` - Produktiver Stand
- `dev` - Entwicklung
- `claude/**` - Feature-Branches für Claude Code Sessions
