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

3. **Auto-Off Timer** (Sicherheitsabschaltung)
   - Startet wenn Thermostat ODER Hygrostat aktiviert wird
   - Nach 4 Stunden: Beide werden automatisch abgeschaltet
   - Sensor: `sauna_restzeit` zeigt Restzeit in Minuten
   - Global: `sauna_session_start_time` (millis()-Timestamp)

4. **SSR-Sicherheit** (Übertemperaturschutz Schaltschrank)
   - Sensor: `temperatur_steuergeraet` (Dallas DS18B20 im Schaltschrank)
   - Warnung: >50°C → Binary Sensor `schaltschrank_uebertemperatur` (für HA-Automations)
   - Notabschaltung: ≥60°C → Ofen + Verdampfer werden sofort abgeschaltet
   - Entwarnung: <50°C → Notabschaltung aufgehoben, manueller Neustart erforderlich
   - Schützt SSRs, Elektronik und Holzständerhaus vor Überhitzung/Brand

5. **Sauna-Maximaltemperatur** (Übertemperaturschutz Sauna-Raum)
   - Sensor: `temperatur_sauna` (AM2320)
   - Warnung: >90°C → Binary Sensor `sauna_uebertemperatur` (für HA-Automations)
   - Notabschaltung: ≥95°C → Ofen + Verdampfer werden sofort abgeschaltet
   - Entwarnung: <85°C → Notabschaltung aufgehoben, manueller Neustart erforderlich
   - Schützt vor Reglerversagen und zu hohen Temperaturen

6. **Sensor-Ausfall Erkennung** (Schutz vor defekten Sensoren)
   - **AM2320 (Sauna-Temperatur):**
     - Überwacht: `temperatur_sauna` (Update-Interval 30s)
     - Timeout: 90s (3 fehlende Updates) → Binary Sensor `sensor_ausfall`
     - Notabschaltung: Bei Timeout + aktiver Heizung → Ofen + Verdampfer werden abgeschaltet
   - **DS18B20 (Schaltschrank-Temperatur):**
     - Überwacht: `temperatur_steuergeraet` (Update-Interval 60s)
     - Timeout: 180s (3 fehlende Updates) → Binary Sensor `ds18b20_ausfall`
     - Notabschaltung: Bei Timeout + aktiver Heizung → Ofen + Verdampfer werden abgeschaltet
     - Kritisch für SSR-Sicherheit: Ohne funktionierenden Sensor kann Übertemperatur nicht erkannt werden
   - Entwarnung: Automatisch wenn Sensor wieder Daten liefert
   - Schützt vor defekten oder abgesteckten Sensoren während des Betriebs

7. **Infrarot Auto-Off** (Sicherheitsabschaltung)
   - Nach 2 Stunden: Infrarotstrahler werden automatisch abgeschaltet
   - Sensoren: `infrarot1_restzeit`, `infrarot2_restzeit` zeigen Restzeit in Minuten
   - Unabhängig für jeden Strahler (eigene Timer)
   - Verhindert vergessene Infrarotstrahler

### Home Assistant Integration

Die HA API bleibt aktiv. HA nutzt direkt die ESP-Entities:
- `climate.saunacontroller_sauna_thermostat`
- `switch.saunacontroller_hygrostat`
- `number.saunacontroller_ziel_luftfeuchtigkeit`

Die alte `generic_thermostat`/`generic_hygrostat` Konfiguration ist nicht mehr nötig.

## Webserver-Gruppen

Entities sind im Webserver (Port 80) gruppiert:
1. **Sauna** - Thermostat, Temperatur, Restzeit, Übertemperatur-Schutz
2. **Verdampfer** - Hygrostat, Ziel-Luftfeuchtigkeit, Luftfeuchte, Toleranzen
3. **Infrarot** - Infrarotstrahler 1+2, Restzeiten
4. **Beleuchtung** - LED Salzkristall, LED Streifen
5. **Statistik** - Betriebsstunden, Session-Zähler
6. **System** - SSR-Sicherheit, Sensor-Ausfall, ESP Restart, Debug-Sensoren, Version

## Wichtige Hinweise

- **Nach ESP-Neustart:** Alle Regler starten im OFF-Modus (Sicherheit), LEDs mit Lava-Rot voreingestellt
- **Statistik-Zähler:** Betriebsstunden und Sessions sind persistent (überleben Neustarts), nur laufende Sessions gehen bei Stromausfall verloren
- **Auto-Off nach 4h:** Thermostat und Hygrostat werden automatisch abgeschaltet (Sicherheitsfeature)
- **Infrarot Auto-Off nach 2h:** Infrarotstrahler werden nach 2 Stunden automatisch abgeschaltet (unabhängige Timer pro Strahler)
- **SSR-Sicherheit:** Bei Schaltschrank-Temperatur ≥60°C werden Ofen und Verdampfer automatisch abgeschaltet (Schutz für SSRs und Holzständerhaus). Nach Abkühlung (<50°C) ist manueller Neustart erforderlich - prüfe bei Auslösung die Belüftung/Kühlung der SSRs
- **Sauna-Maximaltemperatur:** Bei Sauna-Temperatur ≥95°C werden Ofen und Verdampfer automatisch abgeschaltet (Schutz vor Reglerversagen). Nach Abkühlung (<85°C) ist manueller Neustart erforderlich
- **Sensor-Ausfall:** Wenn ein Temperatursensor keine Werte liefert und die Heizung aktiv ist, werden Ofen und Verdampfer automatisch abgeschaltet:
  - AM2320 (Sauna): Timeout nach >90s → Binary Sensor `sensor_ausfall`
  - DS18B20 (Schaltschrank): Timeout nach >180s → Binary Sensor `ds18b20_ausfall` (kritisch für SSR-Sicherheit)
  - Entwarnung erfolgt automatisch wenn Sensor wieder Daten liefert
- **AM2320 Sensor:** Update-Interval 30s, kann bei Problemen erhöht werden
- **GPIO-Switches:** `saunaofen` und `saunaverdampfer` sind `internal: true` (nicht direkt steuerbar)
- **secrets.yaml:** Enthält WiFi-Credentials, API-Keys etc. - niemals committen!

## Branching

- `main` - Produktiver Stand
- `dev` - Entwicklung
- `claude/**` - Feature-Branches für Claude Code Sessions
