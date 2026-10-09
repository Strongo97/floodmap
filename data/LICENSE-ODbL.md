# Data licence

The FloodMap spot database, `data/hcmc-flood-spots.geojson`, is made available under the
[Open Database License (ODbL) v1.0](https://opendatacommons.org/licenses/odbl/1-0/).
Individual contents of the database are licensed under the
[Database Contents License v1.0](https://opendatacommons.org/licenses/dbcl/1-0/).

The spot geometry was traced over OpenStreetMap, so it contains information from
OpenStreetMap, © OpenStreetMap contributors, available under the ODbL
(https://www.openstreetmap.org/copyright).

Flood facts (depth, frequency, past events) are summarised from the public sources listed
in each spot's `sources` and `past_events[].source` fields and in `docs/seed-sources.md`.

The code in this repository (everything outside `data/hcmc-flood-spots.geojson`) is under
the MIT licence in `/LICENSE`.
