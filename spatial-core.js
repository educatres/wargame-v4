(function spatialCoreFactory(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.WARGAME_SPATIAL = api;
})(typeof window !== "undefined" ? window : globalThis, function createSpatialCore() {
  "use strict";

  const MODEL_VERSION = 2;
  const CONFLICT_RADIUS_KM = 50;
  const RANGE_DEFAULTS_KM = Object.freeze({
    aviation: 600,
    airDefense: 160,
    longRange: 700,
    maritime: 300,
    subsurface: 250,
    isr: 500,
    communications: 800,
    logistics: 250,
    energy: 100,
    airport: 200,
    radarStation: 450,
    base: 150,
    powerPlant: 100,
    position: 80
  });
  const OPTIONAL_LOCATION_CATEGORIES = new Set(["communications", "energy"]);
  const ZONE_CENTERS = Object.freeze({
    "Z-NW": [25.15, 119.65],
    "Z-CW": [23.75, 119.55],
    "Z-SW": [22.25, 119.45],
    "Z-NE": [25.25, 123.0],
    "Z-E": [23.75, 123.2],
    "Z-SE": [21.8, 122.6],
    "Z-ISL": [23.7, 120.95],
    "Z-REAR": [24.1, 126.2]
  });
  const GRID_STEPS_DEGREES = Object.freeze([
    0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 30, 45, 90
  ]);

  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const round = (value, digits = 6) => {
    const power = 10 ** digits;
    return Math.round(finite(value) * power) / power;
  };

  function chooseGridStep(bounds, maxLines = 10) {
    const south = Math.max(-90, Math.min(90, finite(bounds?.south, -90)));
    const north = Math.max(-90, Math.min(90, finite(bounds?.north, 90)));
    const west = finite(bounds?.west, -180);
    let east = finite(bounds?.east, 180);
    if (east < west) east += 360;
    const span = Math.max(Math.abs(north - south), Math.abs(east - west));
    const minimumStep = span / Math.max(2, finite(maxLines, 10));
    return GRID_STEPS_DEGREES.find(step => step + 1e-10 >= minimumStep)
      || GRID_STEPS_DEGREES[GRID_STEPS_DEGREES.length - 1];
  }

  function gridCoordinateDecimals(step) {
    const value = Math.abs(finite(step, 1));
    if (Math.abs(value - Math.round(value)) < 1e-10) return 0;
    if (Math.abs(value * 10 - Math.round(value * 10)) < 1e-10) return 1;
    if (Math.abs(value * 100 - Math.round(value * 100)) < 1e-10) return 2;
    return 3;
  }

  function formatGridCoordinate(value, axis, step = 1) {
    const numeric = finite(value);
    const normalized = axis === "lng"
      ? ((numeric + 180) % 360 + 360) % 360 - 180
      : Math.max(-90, Math.min(90, numeric));
    const hemisphere = axis === "lng"
      ? (normalized < 0 ? "W" : "E")
      : (normalized < 0 ? "S" : "N");
    return `${Math.abs(normalized).toFixed(gridCoordinateDecimals(step))}°${hemisphere}`;
  }

  function gridLinesForBounds(bounds, maxLines = 10) {
    const south = Math.max(-90, Math.min(90, finite(bounds?.south, -90)));
    const north = Math.max(-90, Math.min(90, finite(bounds?.north, 90)));
    const west = finite(bounds?.west, -180);
    let east = finite(bounds?.east, 180);
    if (east < west) east += 360;
    const step = chooseGridStep({ south, west, north, east }, maxLines);
    const latitudes = [];
    const longitudes = [];
    const firstLatitude = Math.ceil((Math.min(south, north) - 1e-10) / step) * step;
    const firstLongitude = Math.ceil((west - 1e-10) / step) * step;
    for (let value = firstLatitude; value <= Math.max(south, north) + 1e-10 && latitudes.length < 100; value += step) {
      latitudes.push(round(value, 6));
    }
    for (let value = firstLongitude; value <= east + 1e-10 && longitudes.length < 100; value += step) {
      longitudes.push(round(value, 6));
    }
    return { step, south, west, north, east, latitudes, longitudes };
  }

  function normalizeCatalogText(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/台/g, "臺")
      .replace(/[^a-z0-9\u3400-\u9fff]+/g, "");
  }

  function normalizedTextSpan(source, normalizedTarget) {
    const text = String(source || "");
    for (let start = 0; start < text.length; start += 1) {
      if (!normalizeCatalogText(text[start])) continue;
      let normalized = "";
      for (let end = start; end < text.length; end += 1) {
        normalized = normalizeCatalogText(text.slice(start, end + 1));
        if (!normalized) continue;
        if (normalized === normalizedTarget) return { start, end: end + 1 };
        if (normalized.length > normalizedTarget.length || !normalizedTarget.startsWith(normalized)) break;
      }
    }
    return null;
  }

  function canonicalizeCatalogNames(source, catalog) {
    let text = String(source || "");
    const replacements = [];
    (catalog || []).forEach(item => {
      const canonical = String(item?.canonical || "").trim();
      if (!canonical) return;
      const variants = [...new Set([canonical, ...(item?.variants || [])]
        .map(normalizeCatalogText)
        .filter(value => value.length >= 3))]
        .sort((a, b) => b.length - a.length);
      const matched = variants.map(variant => ({ variant, span: normalizedTextSpan(text, variant) }))
        .find(candidate => candidate.span);
      if (matched) {
        const original = text.slice(matched.span.start, matched.span.end);
        replacements.push({ ...matched.span, canonical, variant: matched.variant, original, changed: original !== canonical });
      }
    });
    replacements.sort((a, b) => b.start - a.start || (b.end - b.start) - (a.end - a.start));
    const accepted = [];
    replacements.forEach(replacement => {
      if (accepted.some(item => replacement.start < item.end && replacement.end > item.start)) return;
      accepted.push(replacement);
      text = `${text.slice(0, replacement.start)}${replacement.canonical}${text.slice(replacement.end)}`;
    });
    return { text, replacements: accepted.reverse() };
  }

  function haversineKm(a, b) {
    if (!a || !b) return Infinity;
    const lat1 = finite(a.lat, NaN);
    const lng1 = finite(a.lng, NaN);
    const lat2 = finite(b.lat, NaN);
    const lng2 = finite(b.lng, NaN);
    if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return Infinity;
    const radians = degrees => degrees * Math.PI / 180;
    const dLat = radians(lat2 - lat1);
    const dLng = radians(lng2 - lng1);
    const h = Math.sin(dLat / 2) ** 2
      + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLng / 2) ** 2;
    return 6371.0088 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  function nearestZoneId(point) {
    let selected = "Z-ISL";
    let distance = Infinity;
    Object.entries(ZONE_CENTERS).forEach(([zoneId, center]) => {
      const candidate = haversineKm(point, { lat: center[0], lng: center[1] });
      if (candidate < distance) {
        distance = candidate;
        selected = zoneId;
      }
    });
    return selected;
  }

  function sanitizePlacement(raw, index, rowId) {
    const nominal = Math.max(0, finite(raw?.nominalQuantity ?? raw?.quantity, 0));
    return {
      placementId: String(raw?.placementId || `${rowId || "INV"}-P${index + 1}`).slice(0, 100),
      label: String(raw?.label || `配置點 ${index + 1}`).replace(/[\r\n]+/g, " ").trim().slice(0, 100),
      lat: round(Math.max(-90, Math.min(90, finite(raw?.lat, 23.7)))),
      lng: round(Math.max(-180, Math.min(180, finite(raw?.lng, 120.95)))),
      zoneId: String(raw?.zoneId || nearestZoneId(raw || {})).slice(0, 20),
      nominalQuantity: nominal,
      currentQuantity: Math.max(0, Math.min(nominal, finite(raw?.currentQuantity, nominal))),
      presetId: String(raw?.presetId || "").slice(0, 100),
      sourceUrl: /^https:\/\//.test(String(raw?.sourceUrl || "")) ? String(raw.sourceUrl).slice(0, 500) : "",
      sourceCheckedAt: /^\d{4}-\d{2}-\d{2}$/.test(String(raw?.sourceCheckedAt || "")) ? String(raw.sourceCheckedAt) : "",
      precision: String(raw?.precision || (raw?.presetId ? "facility-centroid" : "user-selected")).slice(0, 60),
      isLive: false,
      isUserModified: Boolean(raw?.isUserModified)
    };
  }

  function normalizeSpatialRow(raw, index = 0) {
    const rowId = String(raw?.id || `INV-${index + 1}`);
    const category = String(raw?.category || "logistics");
    const locationRequired = raw?.locationRequired === undefined
      ? !OPTIONAL_LOCATION_CATEGORIES.has(category)
      : Boolean(raw.locationRequired);
    const placements = Array.isArray(raw?.placements)
      ? raw.placements.map((placement, placementIndex) => sanitizePlacement(placement, placementIndex, rowId))
      : [];
    return {
      gameRangeKm: Math.max(1, finite(raw?.gameRangeKm, RANGE_DEFAULTS_KM[category] || 100)),
      locationRequired,
      placements
    };
  }

  function placementTotals(row) {
    const placements = Array.isArray(row?.placements) ? row.placements : [];
    return {
      nominal: round(placements.reduce((sum, item) => sum + finite(item.nominalQuantity), 0), 2),
      current: round(placements.reduce((sum, item) => sum + finite(item.currentQuantity), 0), 2)
    };
  }

  function validateSpatialRow(row) {
    const errors = [];
    const spatial = normalizeSpatialRow(row);
    const nominal = Math.max(0, finite(row?.nominal));
    const totals = placementTotals(spatial);
    if (spatial.locationRequired && !spatial.placements.length) errors.push("尚未配置位置");
    if (spatial.locationRequired && Math.abs(totals.nominal - nominal) > 0.01) {
      errors.push(`配置數量 ${totals.nominal} 必須等於遊戲存量 ${nominal}`);
    }
    spatial.placements.forEach((placement, index) => {
      if (!Number.isFinite(placement.lat) || !Number.isFinite(placement.lng)) errors.push(`配置點 ${index + 1} 座標無效`);
      if (placement.nominalQuantity <= 0) errors.push(`配置點 ${index + 1} 數量必須大於 0`);
    });
    return errors;
  }

  function eligiblePlacements(row, target, requestedQuantity = 0) {
    const spatial = normalizeSpatialRow(row);
    const reserveRate = Math.max(0, Math.min(100, finite(row?.reserve, 0))) / 100;
    return spatial.placements.map(placement => {
      const distanceKm = haversineKm(placement, target);
      const committable = Math.max(0, finite(placement.currentQuantity) - finite(placement.nominalQuantity) * reserveRate);
      return { placement, distanceKm, committable };
    }).filter(item =>
      item.distanceKm <= spatial.gameRangeKm + 0.000001
      && item.committable + 0.000001 >= Math.max(0, finite(requestedQuantity))
    ).sort((a, b) => a.distanceKm - b.distanceKm);
  }

  function consumePlacement(row, placementId, requestedQuantity, protectReserve = true) {
    const spatial = normalizeSpatialRow(row);
    const placement = spatial.placements.find(item => item.placementId === placementId);
    if (!placement) return { used: 0, spatial };
    const reserve = protectReserve ? finite(placement.nominalQuantity) * finite(row?.reserve) / 100 : 0;
    const capacity = Math.max(0, finite(placement.currentQuantity) - reserve);
    const used = Math.min(capacity, Math.max(0, finite(requestedQuantity)));
    placement.currentQuantity = round(placement.currentQuantity - used, 2);
    return { used: round(used, 2), spatial };
  }

  function distributeRecovery(row, amount) {
    const spatial = normalizeSpatialRow(row);
    let remaining = Math.max(0, finite(amount));
    const deficits = spatial.placements.map(placement => ({
      placement,
      deficit: Math.max(0, finite(placement.nominalQuantity) - finite(placement.currentQuantity))
    }));
    const totalDeficit = deficits.reduce((sum, item) => sum + item.deficit, 0);
    deficits.forEach((item, index) => {
      if (!remaining || !item.deficit) return;
      const addition = index === deficits.length - 1
        ? Math.min(item.deficit, remaining)
        : Math.min(item.deficit, amount * item.deficit / Math.max(1, totalDeficit));
      item.placement.currentQuantity = round(item.placement.currentQuantity + addition, 2);
      remaining -= addition;
    });
    return { applied: round(Math.max(0, finite(amount)) - remaining, 2), spatial };
  }

  function clusterOpposedActions(actions, radiusKm = CONFLICT_RADIUS_KM) {
    const combat = (actions || []).filter(item => item?.combat && item?.target);
    const groups = [];
    combat.forEach(action => {
      let group = groups.find(candidate => candidate.actions.some(existing =>
        existing.actor !== action.actor && haversineKm(existing.target, action.target) <= radiusKm
      ));
      if (!group) {
        group = { actions: [] };
        groups.push(group);
      }
      group.actions.push(action);
    });
    return groups.filter(group => {
      const actors = new Set(group.actions.map(item => item.actor));
      return actors.has("RED") && (actors.has("BLUE") || actors.has("AMBER"));
    });
  }

  return {
    MODEL_VERSION,
    CONFLICT_RADIUS_KM,
    RANGE_DEFAULTS_KM,
    OPTIONAL_LOCATION_CATEGORIES,
    ZONE_CENTERS,
    GRID_STEPS_DEGREES,
    chooseGridStep,
    gridCoordinateDecimals,
    formatGridCoordinate,
    gridLinesForBounds,
    normalizeCatalogText,
    canonicalizeCatalogNames,
    haversineKm,
    nearestZoneId,
    normalizeSpatialRow,
    placementTotals,
    validateSpatialRow,
    eligiblePlacements,
    consumePlacement,
    distributeRecovery,
    clusterOpposedActions
  };
});
