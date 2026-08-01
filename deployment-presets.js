(function deploymentPresetFactory(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.WARGAME_DEPLOYMENTS = api;
})(typeof window !== "undefined" ? window : globalThis, function createDeploymentPresets() {
  "use strict";

  const SOURCE_CHECKED_AT = "2026-08-01";
  const PRECISION = "facility-centroid";
  const PUBLIC_FACILITIES = Object.freeze({
    hualien: facility("BLUE-HUALIEN", "花蓮航空基地（公開設施中心點）", 24.0237, 121.6169, "Z-ISL", "https://www.mnd.gov.tw/en/informationservices/publication/71953"),
    chiayi: facility("BLUE-CHIAYI", "嘉義航空基地（公開設施中心點）", 23.4618, 120.3928, "Z-ISL", "https://www.mnd.gov.tw/File/41892"),
    cck: facility("BLUE-CCK", "清泉崗航空基地（公開設施中心點）", 24.2647, 120.6206, "Z-ISL", "https://www.mnd.gov.tw/File/41892"),
    hsinchu: facility("BLUE-HSINCHU", "新竹航空基地（公開設施中心點）", 24.818, 120.9394, "Z-ISL", "https://www.mnd.gov.tw/File/41892"),
    tainan: facility("BLUE-TAINAN", "臺南航空基地（公開設施中心點）", 22.9504, 120.2058, "Z-ISL", "https://www.mnd.gov.tw/File/41892"),
    pingtung: facility("BLUE-PINGTUNG", "屏東航空基地（公開設施中心點）", 22.6724, 120.4617, "Z-ISL", "https://www.mnd.gov.tw/news/pressrelease/74884/656"),
    zuoying: facility("BLUE-ZUOYING", "高雄左營公開港區中心點", 22.6997, 120.2869, "Z-ISL", "https://www.openstreetmap.org/copyright"),
    keelung: facility("BLUE-KEELUNG", "基隆公開港區中心點", 25.1276, 121.7392, "Z-ISL", "https://www.openstreetmap.org/copyright"),
    taipei: inferred("BLUE-TAIPEI", "北部區域遊戲推定點", 25.033, 121.5654, "Z-ISL"),
    taichung: inferred("BLUE-TAICHUNG", "中部區域遊戲推定點", 24.1477, 120.6736, "Z-ISL"),
    kaohsiung: inferred("BLUE-KAOHSIUNG", "南部區域遊戲推定點", 22.6273, 120.3014, "Z-ISL"),

    fuzhouAirport: facility("RED-FUZHOU-AIR", "福州長樂國際機場（公開設施中心點）", 25.9351, 119.6633, "Z-NW", "https://www.openstreetmap.org/copyright"),
    xiamenAirport: facility("RED-XIAMEN-AIR", "廈門高崎國際機場（公開設施中心點）", 24.544, 118.1277, "Z-CW", "https://www.openstreetmap.org/copyright"),
    quanzhouAirport: facility("RED-QUANZHOU-AIR", "泉州晉江機場（公開設施中心點）", 24.7964, 118.589, "Z-CW", "https://www.openstreetmap.org/copyright"),
    ningboAirport: facility("RED-NINGBO-AIR", "寧波櫟社國際機場（公開設施中心點）", 29.8267, 121.4619, "Z-NW", "https://www.openstreetmap.org/copyright"),
    xiamenPort: facility("RED-XIAMEN-PORT", "廈門公開港區中心點", 24.473, 118.08, "Z-CW", "https://www.openstreetmap.org/copyright"),
    ningboPort: facility("RED-NINGBO-PORT", "寧波舟山公開港區中心點", 29.8683, 121.544, "Z-NW", "https://www.openstreetmap.org/copyright"),
    fuzhou: inferred("RED-FUZHOU-REGION", "福州區域遊戲推定點", 26.0745, 119.2965, "Z-NW"),
    xiamen: inferred("RED-XIAMEN-REGION", "廈門區域遊戲推定點", 24.4798, 118.0894, "Z-CW"),
    wenzhou: inferred("RED-WENZHOU-REGION", "溫州區域遊戲推定點", 27.9938, 120.6994, "Z-NW"),

    misawa: facility("AMBER-MISAWA", "Misawa Air Base（公開設施中心點）", 40.7032, 141.3684, "Z-REAR", "https://www.af.mil/News/Article-Display/Article/4447093/f-35a-lightning-iis-arrive-at-misawa-air-base/"),
    yokota: facility("AMBER-YOKOTA", "Yokota Air Base（公開設施中心點）", 35.7485, 139.3485, "Z-REAR", "https://www.yokota.af.mil/"),
    kadena: facility("AMBER-KADENA", "Kadena Air Base（公開設施中心點）", 26.3556, 127.7676, "Z-REAR", "https://www.kadena.af.mil/"),
    iwakuni: facility("AMBER-IWAKUNI", "MCAS Iwakuni（公開設施中心點）", 34.1439, 132.2358, "Z-REAR", "https://www.mcasiwakuni.marines.mil/"),
    yokosuka: facility("AMBER-YOKOSUKA", "Yokosuka 公開港區中心點", 35.2839, 139.6715, "Z-REAR", "https://www.surfpac.navy.mil/ddg88/Welcome-Aboard/"),
    sasebo: facility("AMBER-SASEBO", "Sasebo 公開港區中心點", 33.1596, 129.7228, "Z-REAR", "https://www.navsea.navy.mil/Home/RMC/SRF-JRMC/"),
    naha: facility("AMBER-NAHA", "Naha Airport（公開設施中心點）", 26.1958, 127.6459, "Z-REAR", "https://www.openstreetmap.org/copyright"),
    okinawa: inferred("AMBER-OKINAWA-REGION", "沖繩區域遊戲推定點", 26.3344, 127.8056, "Z-REAR")
  });

  function facility(presetId, label, lat, lng, zoneId, sourceUrl) {
    return { presetId, label, lat, lng, zoneId, sourceUrl, sourceCheckedAt: SOURCE_CHECKED_AT, precision: PRECISION, isLive: false, inferred: false };
  }

  function inferred(presetId, label, lat, lng, zoneId) {
    return { presetId, label, lat, lng, zoneId, sourceUrl: "https://www.openstreetmap.org/copyright", sourceCheckedAt: SOURCE_CHECKED_AT, precision: "regional-game-inference", isLive: false, inferred: true };
  }

  const SPECIFIC = [
    [/(f16v|viper|毒蛇)/, ["hualien", "chiayi"]],
    [/(idf|fck1|經國)/, ["cck", "tainan"]],
    [/(mirage20005|幻象20005)/, ["hsinchu"]],
    [/(c130h|e2k)/, ["pingtung"]],
    [/(p3c|獵戶座)/, ["pingtung"]],
    [/(j20|殲20)/, ["ningboAirport"]],
    [/(j16|殲16)/, ["fuzhouAirport", "ningboAirport"]],
    [/(j10c|殲10c)/, ["xiamenAirport", "quanzhouAirport"]],
    [/(h6k|轟6k|kj500|空警500|y20|運20)/, ["fuzhouAirport", "xiamenAirport"]],
    [/(055|052d)/, ["ningboPort", "xiamenPort"]],
    [/(075)/, ["xiamenPort"]],
    [/(f35a|lightningii|閃電ii)/, ["misawa"]],
    [/(fa18ef|superhornet|超級大黃蜂|e2d|advancedhawkeye)/, ["iwakuni"]],
    [/(p8a|poseidon|海神)/, ["kadena"]],
    [/(kc46a|pegasus|飛馬)/, ["yokota"]],
    [/(c17|globemasteriii)/, ["yokota"]],
    [/(arleighburke|sm6|tomahawk|戰斧)/, ["yokosuka", "sasebo"]],
    [/(virginia)/, ["sasebo"]]
  ];

  const CATEGORY_POOLS = Object.freeze({
    BLUE: {
      aviation: ["hualien", "chiayi", "cck", "hsinchu", "tainan", "pingtung"],
      airDefense: ["taipei", "taichung", "kaohsiung"],
      longRange: ["taichung", "kaohsiung"], maritime: ["zuoying", "keelung"],
      subsurface: ["pingtung", "zuoying"], isr: ["pingtung", "hualien"],
      logistics: ["pingtung", "cck"], airport: ["hsinchu", "hualien", "chiayi"],
      radarStation: ["taipei", "taichung"], base: ["zuoying", "taichung"],
      powerPlant: ["taipei", "taichung", "kaohsiung"], position: ["taipei", "taichung", "kaohsiung"]
    },
    RED: {
      aviation: ["fuzhouAirport", "xiamenAirport", "quanzhouAirport"],
      airDefense: ["fuzhou", "xiamen", "wenzhou"], longRange: ["fuzhou", "xiamen", "wenzhou"],
      maritime: ["ningboPort", "xiamenPort"], subsurface: ["ningboPort", "xiamenPort"],
      isr: ["fuzhouAirport", "ningboAirport"], logistics: ["fuzhouAirport", "xiamenAirport"],
      airport: ["fuzhouAirport", "xiamenAirport", "quanzhouAirport"],
      radarStation: ["fuzhou", "wenzhou"], base: ["fuzhou", "xiamen"],
      powerPlant: ["fuzhou", "xiamen"], position: ["fuzhou", "xiamen", "wenzhou"]
    },
    AMBER: {
      aviation: ["misawa", "iwakuni"], airDefense: ["yokosuka", "sasebo"],
      longRange: ["yokosuka", "sasebo"], maritime: ["yokosuka", "sasebo"],
      subsurface: ["sasebo"], isr: ["iwakuni", "kadena"],
      logistics: ["yokota", "kadena"], airport: ["kadena", "naha"],
      radarStation: ["okinawa"], base: ["kadena", "sasebo"],
      powerPlant: ["okinawa"], position: ["okinawa", "naha"]
    }
  });

  function normalize(value) {
    return String(value || "").normalize("NFKC").toLowerCase().replace(/台/g, "臺").replace(/[^a-z0-9\u3400-\u9fff]+/g, "");
  }

  function largestRemainder(total, count) {
    const safeTotal = Math.max(0, Math.round(Number(total) || 0));
    if (!count) return [];
    const base = Math.floor(safeTotal / count);
    const remainder = safeTotal - base * count;
    return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
  }

  function presetKeysFor(row) {
    const name = normalize(row?.alias);
    const specific = SPECIFIC.find(([pattern]) => pattern.test(name));
    return specific?.[1] || CATEGORY_POOLS[row?.actor]?.[row?.category] || [];
  }

  function placementsForRow(row, options = {}) {
    if (!row || options.preserveExisting !== false && Array.isArray(row.placements) && row.placements.length) {
      return Array.isArray(row?.placements) ? row.placements : [];
    }
    if (["communications", "energy"].includes(row.category)) return [];
    const keys = presetKeysFor(row);
    const quantities = largestRemainder(row.nominal, keys.length);
    return keys.map((key, index) => {
      const preset = PUBLIC_FACILITIES[key];
      const quantity = quantities[index];
      return {
        placementId: `${row.id || "INV"}-P${index + 1}`,
        label: preset.label,
        lat: preset.lat,
        lng: preset.lng,
        zoneId: preset.zoneId,
        nominalQuantity: quantity,
        currentQuantity: quantity,
        presetId: preset.presetId,
        sourceUrl: preset.sourceUrl,
        sourceCheckedAt: preset.sourceCheckedAt,
        precision: preset.precision,
        isLive: false,
        isUserModified: false
      };
    }).filter(item => item.nominalQuantity > 0);
  }

  return {
    SOURCE_CHECKED_AT,
    PRECISION,
    PUBLIC_FACILITIES,
    CATEGORY_POOLS,
    normalize,
    largestRemainder,
    presetKeysFor,
    placementsForRow
  };
});
