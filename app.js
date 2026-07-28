(() => {
  "use strict";

  const DATA = window.WARGAME_DATA;
  const STORAGE_KEY = "taiwan-strait-scenario-generator-v2";
  const LLM_SETTINGS_KEY = "taiwan-strait-scenario-generator-llm-v1";
  const SHOW_INTERCEPT_LAB = false;

  const ACTIONS = {
    BLUE: [
      ["強化防空警戒", { readiness: 2, command: 1, intel: 1, civilian: 1 }],
      ["商船護航", { sustainment: -1, command: 1, civilian: -3 }],
      ["分散部署", { readiness: 1, sustainment: -1, civilian: 0 }],
      ["備援通訊", { command: 4, intel: 1, civilian: 0 }],
      ["後勤修復", { readiness: 1, sustainment: 5, civilian: 0 }],
      ["情報融合", { intel: 5, command: 1, civilian: 0 }],
      ["無人機偵察與通訊中繼", { readiness: 1, sustainment: -1, command: 2, intel: 5, civilian: 0 }],
      ["星鏈與高空平臺備援通訊", { readiness: 1, sustainment: -1, command: 6, intel: 2, civilian: 0 }],
      ["能源配給與電網調度", { readiness: -1, sustainment: 4, command: 2, civilian: -3 }],
      ["經濟持續運作協調", { readiness: 0, sustainment: 3, command: 2, civilian: -4 }],
      ["【航空】空中攔截任務", { readiness: 2, sustainment: -2, command: 1, intel: 2, civilian: 1 }],
      ["【防空】分層防空交戰", { readiness: 2, sustainment: -3, command: 2, intel: 1, civilian: 1 }],
      ["【遠程火力】遠程火力反制", { readiness: -1, sustainment: -3, command: 0, intel: 1, civilian: 4 }],
      ["【海上】海上拒止任務", { readiness: 1, sustainment: -2, command: 1, intel: 1, civilian: 2 }],
      ["【水下】水下威懾與反潛警戒", { readiness: 1, sustainment: -2, command: 1, intel: 3, civilian: 1 }]
    ],
    RED: [
      ["增加空中施壓", { readiness: -1, command: 1, intel: 0, civilian: 3 }],
      ["海上臨檢演示", { sustainment: -1, command: 0, intel: 1, civilian: 4 }],
      ["電磁壓制", { readiness: 0, command: 2, intel: 2, civilian: 2 }],
      ["遠程火力展示", { readiness: -2, command: 0, intel: 0, civilian: 6 }],
      ["調整封控區", { sustainment: 1, command: 1, intel: 0, civilian: 3 }],
      ["外交訊息操作", { readiness: 0, command: 1, intel: 2, civilian: -1 }],
      ["海警與海上民兵執法封控", { readiness: 0, sustainment: 1, command: 1, intel: 2, civilian: 5 }],
      ["【航空】空中攔截與護航", { readiness: 1, sustainment: -2, command: 1, intel: 1, civilian: 3 }],
      ["【遠程火力】遠程火力施壓", { readiness: -2, sustainment: -3, command: 0, intel: 0, civilian: 7 }],
      ["【海上】海上拒止行動", { readiness: 1, sustainment: -2, command: 1, intel: 1, civilian: 4 }],
      ["【水下】水下封控與反潛警戒", { readiness: 1, sustainment: -2, command: 1, intel: 2, civilian: 4 }]
    ],
    AMBER: [
      ["提供ISR支援", { readiness: 0, command: 1, intel: 6, civilian: 0 }],
      ["提升後勤準備", { readiness: 1, sustainment: 6, intel: 0, civilian: 0 }],
      ["網路防護支援", { readiness: 1, command: 5, intel: 1, civilian: 0 }],
      ["外交協調", { readiness: 0, command: 2, intel: 1, civilian: -3 }],
      ["遠距海上存在", { readiness: 1, command: 1, intel: 2, civilian: 2 }],
      ["人道支援準備", { readiness: 0, sustainment: 2, intel: 0, civilian: -5 }],
      ["提供衛星與高空通訊支援", { readiness: 1, sustainment: 1, command: 6, intel: 3, civilian: 0 }],
      ["多國商船護航協調", { readiness: 1, sustainment: 2, command: 3, intel: 1, civilian: -2 }],
      ["工業補充與供應鏈動員", { readiness: 0, sustainment: 5, command: 1, intel: 0, civilian: -1 }],
      ["【航空】區域空中攔截支援", { readiness: 2, sustainment: -2, command: 2, intel: 3, civilian: 1 }],
      ["【海上】多國海上防護協調", { readiness: 1, sustainment: -2, command: 3, intel: 2, civilian: -1 }],
      ["【水下】水下監視與反潛支援", { readiness: 1, sustainment: -1, command: 2, intel: 5, civilian: 0 }]
    ]
  };

  const FOCUS_LIBRARY = {
    joint: {
      title: "聯合決策與整體情勢",
      objectives: ["維持關鍵海空通道與指揮韌性", "在資源有限下平衡防護、後勤與民事需求", "辨識升級風險並保留外交空間"],
      success: ["關鍵功能維持在可接受水準", "未因單一回合投入耗盡後續資源", "能解釋每項決策的假設與替代方案"]
    },
    airdefense: {
      title: "防空資源與預警",
      objectives: ["比較預警品質、攔截配置與庫存保留", "處理多目標與資訊不確定性", "理解單次成功率不等於整體防護效果"],
      success: ["防護任務與庫存風險取得平衡", "能說明感測、指管及環境對結果的影響", "避免把合成機率視為真實武器性能"]
    },
    logistics: {
      title: "後勤持續性與修復",
      objectives: ["維持補給、維修與運輸節點", "在任務壓力下安排修復優先順序", "評估民事交通與軍事後勤的衝突"],
      success: ["持續性指數未跌破危險門檻", "完成至少一次有效修復或替代路線", "提出可驗證的後勤風險指標"]
    },
    intelligence: {
      title: "情報判讀與戰場迷霧",
      objectives: ["區分事實、推測及未知", "評估來源可靠度與分析信心", "避免以單一訊息直接推導對手意圖"],
      success: ["重大決策引用至少兩項獨立線索", "明確標記關鍵假設", "能在新情報出現後修正判斷"]
    },
    civil: {
      title: "民事韌性與危機溝通",
      objectives: ["維持商運、人道與基礎功能", "處理假訊息與群眾焦慮", "平衡軍事行動與民事風險"],
      success: ["民事風險未持續失控", "建立公開訊息與跨部門協調方案", "每回合均評估非軍事後果"]
    },
    diplomacy: {
      title: "升級控制與外交協調",
      objectives: ["辨識可能觸發升級的行動", "利用外交訊號及有限承諾創造降溫窗口", "評估外部支援的政治限制"],
      success: ["保留至少一條降溫或談判路徑", "避免只以戰果衡量任務成果", "能說明軍事與政治目標的關係"]
    }
  };

  const DIFFICULTY = {
    intro: { noise: 0.55, events: 0.65, pressure: 0.75, label: "基礎" },
    standard: { noise: 0.8, events: 0.9, pressure: 1.0, label: "標準" },
    advanced: { noise: 1.0, events: 1.15, pressure: 1.2, label: "進階" }
  };

  const SCENARIO_TEMPLATES = {
    blockade: { name: "海峽警戒與有限封控：72小時聯合決策演練", focus: "joint", difficulty: "standard", turns: 12, amberSupport: "indirect", weatherPreset: "variable", overview: "有限封控、商運改道與資訊操作同時出現；各方須在不完整資訊下保存資源並避免危機升級。" },
    airdefense: { name: "多軸空情與分層防護：48小時資源配置演練", focus: "airdefense", difficulty: "advanced", turns: 8, amberSupport: "indirect", weatherPreset: "variable", overview: "多方向空情與合成來襲目標造成警戒壓力，必須在預警、攔截存量與民事影響之間做取捨。" },
    logistics: { name: "港口延誤與後勤韌性：96小時持續性演練", focus: "logistics", difficulty: "standard", turns: 16, amberSupport: "limited", weatherPreset: "adverse", overview: "港口作業、運輸節點與維修批次陸續受阻；推演重點是優先順序、替代路線與資源保存。" },
    grayzone: { name: "灰色地帶與資訊迷霧：跨域判讀演練", focus: "intelligence", difficulty: "advanced", turns: 10, amberSupport: "indirect", weatherPreset: "stable", overview: "不明海空活動、訊息操作與模糊歸因事件交錯，需區分事實、推測與未知。" },
    humanitarian: { name: "人道疏散與民事協調：危機韌性演練", focus: "civil", difficulty: "standard", turns: 10, amberSupport: "limited", weatherPreset: "variable", overview: "人道需求、商運延誤與公共訊息壓力升高；資源配置需兼顧防護、疏散與基本服務。" },
    deescalation: { name: "危機降溫與外交窗口：升級控制演練", focus: "diplomacy", difficulty: "advanced", turns: 8, amberSupport: "indirect", weatherPreset: "stable", overview: "高風險互動後出現有限降溫窗口，需將資源使用、公開訊息與外交協調連成一致策略。" },
    csis_blackout_2025: {
      name: "CSIS《燈火管制》（2025）：封鎖、護航與能源韌性",
      sourceLabel: "CSIS《燈火管制：中國封鎖台灣兵推》（2025）案例假設",
      references: [{ title: "CSIS — Lights Out? Wargaming a Chinese Blockade of Taiwan", url: "https://www.csis.org/analysis/lights-out-wargaming-chinese-blockade-taiwan" }],
      focus: "logistics", difficulty: "advanced", turns: 20, hoursPerTurn: 12,
      turnOrderMode: "red_first", firstOrderVisibility: "public",
      uncertainty: 4, civilPressure: 5, amberSupport: "limited", weatherPreset: "variable",
      overview: "共軍以海警與海上民兵執法為由切斷航運，美日協調護航破封；推演核心是商運持續、能源配給與避免灰色地帶危機失控。",
      objectives: ["維持最低限度商運與能源輸入", "協調多國護航、港口與保險機制", "在執法封控敘事下控制升級風險"],
      success: ["第10日仍維持關鍵民生與指揮用電", "建立可持續且可解釋的商船護航機制", "能源配給未使民事風險持續失控"],
      extraConstraints: ["案例假設：LNG安全存量於封鎖後10天耗盡。", "案例假設：能源耗盡後電力降至平時35%。"],
      parameters: { coercionMode: "law_enforcement_blockade", energyReserveDays: 10, residualPowerPct: 35, precisionStockpileDays: 30, nuclearStrikeCount: 0, globalEconomicShock: 4 },
      events: [
        { trigger_turn: 2, event_name: "海警宣布擴大臨檢", category: "封控", zone_id: "Z-CW", affected_actor: "ALL", description: "以執法名義提高商船進出與保險壓力。", sustainment_delta: -3, civilian_risk_delta: 5 },
        { trigger_turn: 10, event_name: "護航破封協調窗口", category: "外交", zone_id: "Z-REAR", affected_actor: "AMBER", description: "美日與商運單位研議多國護航及航運風險分攤。", command_delta: 4, sustainment_delta: 3 },
        { trigger_turn: 20, event_name: "能源安全存量耗盡", category: "能源", zone_id: "Z-ISL", affected_actor: "BLUE", description: "案例假設下LNG安全存量耗盡，電力供應面臨快速下降。", readiness_delta: -12, sustainment_delta: -18, command_delta: -4, civilian_risk_delta: 18 }
      ]
    },
    csis_mit_nuclear_2024: {
      name: "CSIS & MIT（2024）：傳統戰局與核升級風險",
      sourceLabel: "CSIS & MIT《台海衝突納入核武推演》（2024）案例假設",
      references: [
        { title: "CSIS — Confronting Armageddon", url: "https://www.csis.org/analysis/confronting-armageddon" },
        { title: "MIT Security Studies Program — Flagship Games", url: "https://ssp.mit.edu/wargaming-lab/flagship-games" }
      ],
      focus: "diplomacy", difficulty: "advanced", turns: 12, hoursPerTurn: 6,
      turnOrderMode: "simultaneous", firstOrderVisibility: "sealed",
      uncertainty: 5, civilPressure: 5, amberSupport: "limited", weatherPreset: "stable",
      overview: "傳統戰局對中方不利後，危機跨越核門檻；推演聚焦預警判讀、政治溝通、分散韌性與終止衝突，不處理核武目標或運用細節。",
      objectives: ["辨識核升級警訊並保留溝通管道", "維持最低限度指揮與民事應變功能", "建立衝突終止與避免後續升級的政策選項"],
      success: ["在核門檻前提出可信的降溫方案", "核事件後維持跨部門指揮與公共訊息", "決策未以報復交換取代政治目標"],
      extraConstraints: ["只採抽象核風險裁決，不呈現目標、武器、當量或運用方式。", "案例假設：傳統戰局不利時發生7次戰術核武攻擊。"],
      parameters: { coercionMode: "nuclear_escalation", energyReserveDays: 20, residualPowerPct: 50, precisionStockpileDays: 14, nuclearStrikeCount: 7, globalEconomicShock: 5 },
      events: [
        { trigger_turn: 6, event_name: "核升級警訊增強", category: "戰略預警", zone_id: "Z-REAR", affected_actor: "ALL", description: "情報顯示核門檻風險顯著升高，外交與危機溝通窗口縮小。", command_delta: -5, civilian_risk_delta: 12 },
        { trigger_turn: 8, event_name: "七次戰術核武攻擊（抽象裁決）", category: "核升級", zone_id: "Z-ISL", affected_actor: "ALL", description: "依案例假設進行整體性衝擊裁決；不包含目標、武器或運用細節。", readiness_delta: -25, sustainment_delta: -25, command_delta: -20, civilian_risk_delta: 40 }
      ]
    },
    cnas_policy_war: {
      name: "美國國會 × CNAS：一週彈藥耗盡與全球經濟衝擊",
      sourceLabel: "美國國會與新美國安全中心（CNAS）政策級兵推案例假設",
      references: [{ title: "CNAS — Bad Blood: The TTX for the House Select Committee on the CCP", url: "https://www.cnas.org/publications/congressional-testimony/bad-blood-ttx" }],
      focus: "joint", difficulty: "advanced", turns: 14, hoursPerTurn: 12,
      turnOrderMode: "red_first", firstOrderVisibility: "sealed",
      uncertainty: 4, civilPressure: 5, amberSupport: "limited", weatherPreset: "variable",
      overview: "政策級推演聚焦開戰後一週內遠程精準導引彈藥耗盡，以及航運、金融、能源與科技供應鏈引發的全球連鎖經濟衝擊。",
      objectives: ["在一週彈藥限制下設定可持續的政治與軍事優先序", "協調工業補充、盟友分工與供應鏈替代", "管理全球金融、航運與民生連鎖風險"],
      success: ["第7日仍保有關鍵任務所需資源", "建立工業補充與盟友分攤方案", "全球經濟衝擊未使政策目標失去可持續性"],
      extraConstraints: ["案例假設：開戰後一週內耗盡遠程精準導引彈藥。", "每回合必須同時評估全球經濟與民事後果。"],
      parameters: { coercionMode: "conventional_conflict", energyReserveDays: 14, residualPowerPct: 45, precisionStockpileDays: 7, nuclearStrikeCount: 0, globalEconomicShock: 5 },
      events: [
        { trigger_turn: 6, event_name: "全球金融與航運震盪", category: "經濟", zone_id: "Z-REAR", affected_actor: "ALL", description: "保險、金融、能源與科技供應鏈出現跨區域連鎖壓力。", sustainment_delta: -8, command_delta: -3, civilian_risk_delta: 15 },
        { trigger_turn: 14, event_name: "遠程精準彈藥耗盡", category: "後勤", zone_id: "Z-REAR", affected_actor: "AMBER", description: "案例假設下，一週後遠程精準導引彈藥存量耗盡。", readiness_delta: -18, sustainment_delta: -20, command_delta: -5 }
      ]
    }
  };

  const STRATEGIC_DEFAULTS = {
    coercionMode: "limited_blockade",
    energyReserveDays: 30,
    residualPowerPct: 80,
    precisionStockpileDays: 30,
    nuclearStrikeCount: 0,
    globalEconomicShock: 1
  };

  const RESOURCE_DEFAULTS = {
    blueAircraft: 48,
    blueInterceptors: 160,
    blueVessels: 14,
    blueLogistics: 72,
    blueDrones: 120,
    starlinkNodes: 24,
    highAltitudePlatforms: 6,
    redAircraft: 96,
    redIncoming: 180,
    redVessels: 24,
    redLogistics: 84
  };

  const INVENTORY_CATEGORIES = {
    aviation: "航空任務",
    airDefense: "防空／攔截",
    longRange: "遠程火力",
    maritime: "海上任務",
    subsurface: "水下任務",
    isr: "ISR／感測",
    communications: "通訊／指管",
    logistics: "後勤／維修",
    energy: "能源／基礎設施"
  };

  const INVENTORY_BASELINES = {
    aviation: 120,
    airDefense: 150,
    longRange: 125,
    maritime: 70,
    subsurface: 42,
    isr: 55,
    communications: 42,
    logistics: 105,
    energy: 100
  };

  const INVENTORY_TEMPLATE = [
    ["BLUE", "F-16V「Viper／毒蛇」", "aviation", 42, 84, 24, 5, 2, 6, 4, 89, "多用途航空任務；參數為遊戲平衡值"],
    ["BLUE", "IDF／F-CK-1「經國號」", "aviation", 34, 80, 22, 4, 2, 5, 3, 86, "航空攔截任務；參數為遊戲平衡值"],
    ["BLUE", "Mirage 2000-5「幻象2000-5」", "aviation", 20, 76, 28, 4, 1, 3, 5, 85, "空優攔截任務；參數為遊戲平衡值"],
    ["BLUE", "C-130H「力士型運輸機」", "logistics", 20, 78, 30, 3, 2, 4, 4, 88, "空運與補給支援；參數為遊戲平衡值"],
    ["BLUE", "E-2K「鷹眼預警機」", "isr", 12, 82, 35, 2, 1, 2, 5, 90, "空中預警與感測；參數為遊戲平衡值"],
    ["BLUE", "P-3C「獵戶座反潛巡邏機」", "subsurface", 16, 77, 30, 3, 1, 3, 4, 87, "海上巡邏與水下警戒；參數為遊戲平衡值"],
    ["BLUE", "雄風三型超音速反艦飛彈", "maritime", 48, 88, 32, 6, 1, 8, 5, 91, "海上拒止資源；參數為遊戲平衡值"],
    ["BLUE", "天劍二型空對空飛彈／TC-2", "airDefense", 68, 86, 28, 8, 1, 12, 4, 89, "空中攔截資源；參數為遊戲平衡值"],
    ["BLUE", "天弓三型防空飛彈", "airDefense", 54, 90, 35, 7, 1, 10, 5, 92, "區域防空資源；參數為遊戲平衡值"],
    ["BLUE", "萬劍飛彈", "longRange", 30, 82, 35, 5, 1, 6, 6, 88, "遠程火力資源；參數為遊戲平衡值"],
    ["BLUE", "雷霆2000多管火箭系統", "longRange", 36, 84, 25, 5, 2, 8, 3, 90, "地面火力支援；參數為遊戲平衡值"],
    ["RED", "殲-20戰鬥機／J-20", "aviation", 32, 84, 28, 5, 2, 6, 5, 90, "先進航空任務；參數為遊戲平衡值"],
    ["RED", "殲-16戰鬥機／J-16", "aviation", 52, 82, 20, 6, 2, 9, 4, 88, "多用途航空任務；參數為遊戲平衡值"],
    ["RED", "殲-10C戰鬥機／J-10C", "aviation", 58, 80, 18, 6, 3, 10, 3, 87, "航空攔截任務；參數為遊戲平衡值"],
    ["RED", "轟-6K轟炸機／H-6K", "longRange", 24, 76, 35, 5, 1, 4, 6, 86, "遠程航空任務；參數為遊戲平衡值"],
    ["RED", "空警-500預警機／KJ-500", "isr", 18, 84, 32, 2, 1, 3, 5, 91, "空中預警與感測；參數為遊戲平衡值"],
    ["RED", "運-20運輸機／Y-20", "logistics", 24, 79, 26, 3, 2, 5, 4, 88, "空運與補給支援；參數為遊戲平衡值"],
    ["RED", "055型導彈驅逐艦", "maritime", 16, 82, 30, 3, 1, 3, 6, 90, "大型水面艦任務；參數為遊戲平衡值"],
    ["RED", "052D型導彈驅逐艦", "maritime", 28, 81, 24, 4, 1, 5, 4, 88, "水面護航任務；參數為遊戲平衡值"],
    ["RED", "075型兩棲攻擊艦", "maritime", 12, 75, 38, 3, 1, 2, 7, 86, "兩棲支援任務；參數為遊戲平衡值"],
    ["RED", "東風-17常規導彈／DF-17", "longRange", 56, 85, 30, 7, 1, 10, 5, 90, "遠程火力資源；參數為遊戲平衡值"],
    ["RED", "東風-26型導彈／DF-26", "longRange", 44, 83, 38, 7, 1, 8, 7, 89, "戰略火力敘事標籤；參數為遊戲平衡值"],
    ["AMBER", "F-35A Lightning II「閃電II」", "aviation", 36, 86, 30, 5, 2, 6, 5, 92, "先進航空支援；參數為遊戲平衡值"],
    ["AMBER", "F/A-18E/F Super Hornet「超級大黃蜂」", "aviation", 48, 83, 24, 6, 2, 8, 4, 90, "艦載航空支援；參數為遊戲平衡值"],
    ["AMBER", "E-2D Advanced Hawkeye", "isr", 14, 88, 38, 2, 1, 2, 5, 93, "空中預警支援；參數為遊戲平衡值"],
    ["AMBER", "P-8A Poseidon「海神」", "subsurface", 20, 84, 30, 3, 1, 4, 4, 91, "海上巡邏與水下警戒；參數為遊戲平衡值"],
    ["AMBER", "KC-46A Pegasus「飛馬」", "logistics", 18, 80, 34, 3, 2, 4, 5, 89, "空中加油支援；參數為遊戲平衡值"],
    ["AMBER", "C-17 Globemaster III", "logistics", 16, 82, 32, 3, 2, 4, 5, 91, "戰略空運支援；參數為遊戲平衡值"],
    ["AMBER", "Arleigh Burke級導彈驅逐艦", "maritime", 24, 86, 32, 4, 1, 4, 5, 92, "艦隊護航支援；參數為遊戲平衡值"],
    ["AMBER", "Virginia級攻擊核潛艦", "subsurface", 14, 88, 40, 3, 1, 2, 7, 93, "水下警戒支援；參數為遊戲平衡值"],
    ["AMBER", "SM-6標準六型飛彈", "airDefense", 72, 89, 36, 8, 1, 12, 6, 93, "艦隊防空資源；參數為遊戲平衡值"],
    ["AMBER", "Tomahawk「戰斧」巡弋飛彈", "longRange", 44, 86, 38, 6, 1, 8, 7, 91, "遠程火力資源；參數為遊戲平衡值"],
    ["AMBER", "Starlink商用衛星通訊支援", "communications", 32, 90, 22, 3, 2, 6, 3, 92, "備援通訊節點；參數為遊戲平衡值"]
  ];

  const STORM_STAGES = {
    systems: {
      title: "系統：建立可追溯的資產與支援網路",
      text: "先定義模型中存在哪些實體、群組與網路，例如指揮節點、航空／海上兵力包、後勤群、民事協調群及外部支援。本版本只使用抽象兵力包，不對應真實單位。",
      question: "分析問題：哪些系統若未被建模，會使研究結論產生系統性偏差？"
    },
    capabilities: {
      title: "能力：把系統轉成可比較的功能",
      text: "能力不是單一武器規格，而是感測、指管、機動、生存、持續與任務效果等屬性。相同資產在不同後勤、環境與指揮條件下，能產生不同效果。",
      question: "分析問題：哪些能力應使用固定值，哪些應使用機率分布或區間？"
    },
    planning: {
      title: "計畫：把目的、方法與資源連成行動方案",
      text: "行動方案決定資產如何分配、何時投入、保留多少預備與如何回應情報。研究重點是比較方案取捨，而不是尋找唯一正確答案。",
      question: "分析問題：方案比較是否使用相同假設、相同種子與相同成功門檻？"
    },
    execution: {
      title: "執行：讓五種表徵持續交換狀態",
      text: "每次模擬重複中，情報形成、命令下達、資產行動、互動裁決、資源消耗與環境摩擦反覆更新，直到到達時間或停止條件。",
      question: "分析問題：哪些狀態更新具有延遲、回饋或累積效果？"
    },
    impact: {
      title: "影響：以分布與多重指標解讀結果",
      text: "輸出不只包括任務效果，也包括剩餘準備、資源保留、民事風險與結果變異。多次重複可顯示平均、尾端風險及罕見失敗。",
      question: "分析問題：平均較高的方案，是否也可能具有更嚴重的低機率風險？"
    }
  };

  const STORM_REPRESENTATIONS = {
    c2: {
      title: "指揮管制 C2",
      subtitle: "命令、優先序、後勤與機動協調",
      description: "接收情報與資產狀態，形成任務、要求與新命令。本版本以指管品質、決策延遲及備援能力表示。",
      data: ["指管品質指數", "命令延遲", "備援程度", "資源配置規則"],
      classroom: "比較：提升指管品質，是否一定比增加資產更有效？"
    },
    assets: {
      title: "資產 Assets",
      subtitle: "執行任務、移動、感測並消耗資源",
      description: "代表航空、海上、陸上、支援與民事等合成兵力包。資產可處於可用、降級或失去任務能力狀態。",
      data: ["準備度", "任務效果", "機動能力", "後勤需求"],
      classroom: "辨識：資產數量與可持續執行能力並不是同一件事。"
    },
    intelligence: {
      title: "情報管理 Intelligence",
      subtitle: "來源、感知、信心與需求管理",
      description: "將不完整觀測轉成可供決策使用的情勢圖像。本版本把ISR品質、來源可靠度、環境遮蔽與分析誤差分開。",
      data: ["ISR品質", "來源可靠度", "分析信心", "資訊時效"],
      classroom: "說明：資訊更多是否必然使決策更好？錯誤信心有何影響？"
    },
    interactions: {
      title: "互動管理 Interactions",
      subtitle: "偵測、交互作用、消耗與損害",
      description: "管理不同資產之間的交互作用及狀態變化。本版本不使用真實射擊表，而以抽象摩擦、壓力與效果函數裁決。",
      data: ["交互作用條件", "效果機率", "消耗規則", "損害與恢復"],
      classroom: "檢查：模型是否錯把相關失敗當成彼此獨立？"
    },
    environment: {
      title: "環境 Environment",
      subtitle: "地形、天候、時間、交通與政治條件",
      description: "環境會限制感測、機動、持續性與民事活動。本版本使用概略區域和1至5級嚴苛度，不含精確座標。",
      data: ["天候／海象", "能見度", "交通條件", "民事與政治約束"],
      classroom: "比較：環境是外生條件，還是會被各方行動進一步改變？"
    }
  };

  const STORM_COAS = {
    balanced: {
      label: "均衡韌性防衛",
      tradeoff: "各項指標較平衡，效果峰值較低，但尾端風險通常較小。",
      c2: .03, isr: .02, readiness: .03, sustainment: .03, mobility: 0,
      mission: .01, resourceCost: 3, civilianDelta: -3
    },
    concentrated: {
      label: "集中主要方向",
      tradeoff: "短期任務效果較高，但資源消耗、民事暴露與後續持續性風險增加。",
      c2: .01, isr: -.02, readiness: .08, sustainment: -.07, mobility: .04,
      mission: .06, resourceCost: 13, civilianDelta: 8
    },
    logistics: {
      label: "後勤優先",
      tradeoff: "初期任務效果較保守，但能改善資源保留與後段準備度。",
      c2: 0, isr: 0, readiness: .03, sustainment: .12, mobility: .02,
      mission: -.02, resourceCost: -2, civilianDelta: -2
    },
    distributed: {
      label: "分散式 ISR 與指管",
      tradeoff: "提升情勢感知與韌性，但增加協調複雜度並占用部分後勤資源。",
      c2: .08, isr: .10, readiness: -.01, sustainment: -.02, mobility: .03,
      mission: .02, resourceCost: 6, civilianDelta: -4
    }
  };

  const state = {
    scenario: null,
    currentTurn: 1,
    status: {},
    orders: {},
    logs: [],
    revealedIntel: [],
    currentLibrary: "sources",
    aarReview: {
      turn: null,
      tab: "intel"
    },
    storm: {
      activeStage: "systems",
      activeRepresentation: "c2",
      lastExperiment: null,
      comparison: [],
      doe: null
    }
  };

  const $ = (id) => document.getElementById(id);
  const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));
  const round1 = (v) => Math.round(v * 10) / 10;
  const actorLabel = (id) => ({ BLUE: "藍方", RED: "紅方", AMBER: "美軍支援", WHITE: "白方" }[id] || id);
  const zoneName = (id) => DATA.zones.find(z => z.zone_id === id)?.zone_name || id;
  const ORDER_BUDGET = 35;
  const MIN_SUPPORT_ACTIONS = 2;
  const MAX_SUPPORT_ACTIONS = 4;
  const OPERATION_ACTORS = {
    BLUE: { color: "#39a0ff", glow: "rgba(57,160,255,.42)", home: [0.585, 0.53], label: "藍方" },
    RED: { color: "#ff5b52", glow: "rgba(255,91,82,.42)", home: [0.12, 0.47], label: "紅方" },
    AMBER: { color: "#ffd84a", glow: "rgba(255,216,74,.42)", home: [0.93, 0.42], label: "琥珀方" }
  };
  const OPERATION_ZONE_ANCHORS = {
    "Z-NW": [0.43, 0.2],
    "Z-CW": [0.43, 0.45],
    "Z-SW": [0.42, 0.73],
    "Z-NE": [0.72, 0.2],
    "Z-E": [0.76, 0.47],
    "Z-SE": [0.72, 0.75],
    "Z-ISL": [0.59, 0.5],
    "Z-REAR": [0.89, 0.68]
  };
  const OPERATION_TYPE_LABELS = {
    aviation: "航空機／空中行動",
    airdefense: "雷達盾牌／防空警戒",
    convoy: "船隊／商船護航",
    maritime: "軍艦／海上行動",
    subsurface: "潛艦／水下警戒",
    longrange: "閃電／抽象遠程火力",
    drone: "無人機／偵察中繼",
    satellite: "衛星／高空通訊",
    communications: "訊號波／通訊網路",
    intelligence: "雷達／情報支援",
    logistics: "卡車／後勤補充",
    energy: "閃電／能源電網",
    diplomacy: "對話框／外交協調",
    humanitarian: "十字符號／人道支援",
    disperse: "分岔箭頭／分散部署"
  };
  const OPERATION_EQUIPMENT_LABELS = {
    BLUE: {
      aviation: ["F-16V「毒蛇」", "F-CK-1「經國號」", "Mirage 2000-5"],
      airdefense: ["天劍二型／TC-2", "天弓三型"],
      maritime: ["雄風三型"],
      subsurface: ["P-3C「獵戶座」"],
      longrange: ["萬劍飛彈", "雷霆2000"],
      intelligence: ["E-2K「鷹眼」", "P-3C「獵戶座」"],
      drone: ["E-2K「鷹眼」"],
      logistics: ["C-130H「力士」"]
    },
    RED: {
      aviation: ["殲-20／J-20", "殲-16／J-16", "殲-10C／J-10C"],
      maritime: ["055型驅逐艦", "052D型驅逐艦", "075型兩棲攻擊艦"],
      longrange: ["東風-17／DF-17", "東風-26／DF-26", "轟-6K／H-6K"],
      intelligence: ["空警-500／KJ-500"],
      drone: ["空警-500／KJ-500"],
      logistics: ["運-20／Y-20"]
    },
    AMBER: {
      aviation: ["F-35A「閃電II」", "F/A-18E/F「超級大黃蜂」"],
      airdefense: ["SM-6標準六型"],
      convoy: ["Arleigh Burke級驅逐艦"],
      maritime: ["Arleigh Burke級驅逐艦"],
      subsurface: ["Virginia級潛艦", "P-8A「海神」"],
      longrange: ["Tomahawk「戰斧」"],
      intelligence: ["E-2D Advanced Hawkeye", "P-8A「海神」"],
      drone: ["E-2D Advanced Hawkeye"],
      satellite: ["Starlink衛星通訊"],
      communications: ["Starlink衛星通訊"],
      logistics: ["KC-46A「飛馬」", "C-17 Globemaster III"]
    }
  };
  const operationAnimation = {
    scene: null,
    sceneKey: "",
    elapsed: 0,
    duration: 12000,
    speed: 1,
    playing: false,
    startedAt: 0,
    frameId: 0,
    pendingAutoplayTurn: null,
    autoPlayedKey: ""
  };
  const aarReplayAnimation = {
    scene: null,
    sceneKey: "",
    elapsed: 0,
    duration: 12000,
    speed: 1,
    playing: false,
    startedAt: 0,
    frameId: 0
  };
  const OPERATION_MAP_ASPECT = 1015.733 / 1221.247;
  const operationMapImage = new Image();
  let operationMapReady = false;
  operationMapImage.decoding = "async";
  operationMapImage.onload = () => {
    operationMapReady = true;
    if ($("operationCanvas")) drawOperationFrame(operationAnimation.elapsed, operationAnimation.scene);
    if ($("aarReplayCanvas")) drawAarReplayFrame();
  };
  operationMapImage.onerror = () => {
    operationMapReady = false;
    if ($("operationTheaterStatus")) $("operationTheaterStatus").textContent = "臺海向量底圖載入失敗。";
  };
  operationMapImage.src = "assets/taiwan-location-map.svg";

  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function hashText(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function pick(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function sample(arr, count, rng) {
    const copy = [...arr];
    const result = [];
    while (copy.length && result.length < count) {
      result.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
    }
    return result;
  }

  function toast(message) {
    const node = $("toast");
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), 2400);
  }

  let sectionNavigatorFrame = 0;

  function positionSectionNavigator() {
    const navigator = $("sectionNavigator");
    if (!navigator || navigator.hidden) return;
    if (!window.matchMedia("(min-width: 1280px)").matches) {
      navigator.style.removeProperty("top");
      navigator.style.removeProperty("--section-navigator-max-height");
      navigator.classList.remove("is-scroll-centered");
      return;
    }
    const tabs = document.querySelector(".tabs");
    const tabsBottom = tabs ? tabs.getBoundingClientRect().bottom : 0;
    const clearance = Math.max(12, tabsBottom + 12);
    const availableHeight = Math.max(240, window.innerHeight - clearance - 12);
    navigator.style.setProperty("--section-navigator-max-height", `${Math.min(520, availableHeight)}px`);
    const navigatorHeight = navigator.getBoundingClientRect().height;
    const centeredTop = Math.max(clearance, (window.innerHeight - navigatorHeight) / 2);
    const shouldCenter = window.scrollY > 80;
    navigator.style.top = `${Math.round(shouldCenter ? centeredTop : clearance)}px`;
    navigator.classList.toggle("is-scroll-centered", shouldCenter);
  }

  function updateSectionNavigatorActive() {
    sectionNavigatorFrame = 0;
    const navigator = $("sectionNavigator");
    if (!navigator || navigator.hidden) return;
    positionSectionNavigator();
    const buttons = [...$("sectionNavigatorLinks").querySelectorAll("[data-section-target]")];
    const visibleTargets = buttons.map(button => ({
      button,
      target: $(button.dataset.sectionTarget)
    })).filter(item => item.target && item.target.offsetParent !== null);
    if (!visibleTargets.length) return;
    const threshold = Math.min(220, window.innerHeight * .32);
    let active = visibleTargets[0];
    visibleTargets.forEach(item => {
      if (item.target.getBoundingClientRect().top <= threshold) active = item;
    });
    buttons.forEach(button => {
      const isActive = button === active.button;
      button.classList.toggle("active", isActive);
      if (isActive) button.setAttribute("aria-current", "location");
      else button.removeAttribute("aria-current");
    });
  }

  function scheduleSectionNavigatorUpdate() {
    if (sectionNavigatorFrame) return;
    sectionNavigatorFrame = requestAnimationFrame(updateSectionNavigatorActive);
  }

  function renderSectionNavigator(tabId) {
    const navigator = $("sectionNavigator");
    const supported = ["builder", "simulation", "storm"].includes(tabId);
    const panel = supported ? $(tabId) : null;
    const sections = panel
      ? [...panel.querySelectorAll("[data-section-nav-label]")].filter(section => !section.hidden)
      : [];
    $("sectionNavigatorTurnControls").hidden = tabId !== "simulation";
    navigator.hidden = !sections.length;
    document.body.classList.toggle("has-section-navigator", sections.length > 0);
    if (!sections.length) {
      $("sectionNavigatorLinks").innerHTML = "";
      return;
    }
    $("sectionNavigatorTitle").textContent = ({
      builder: "一、想定區塊",
      simulation: "二、推演區塊",
      storm: "三、STORM 區塊"
    })[tabId];
    $("sectionNavigatorLinks").innerHTML = sections.map((section, index) => `
      <button type="button" data-section-target="${escapeAttr(section.id)}">
        <span>${index + 1}</span>
        <strong>${escapeHtml(section.dataset.sectionNavLabel)}</strong>
      </button>
    `).join("");
    requestAnimationFrame(updateSectionNavigatorActive);
  }

  function setTab(tabId) {
    document.querySelectorAll(".tab").forEach(btn => {
      const active = btn.dataset.tab === tabId;
      btn.classList.toggle("active", active);
      if (active) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    });
    document.querySelectorAll(".panel").forEach(panel => panel.classList.toggle("active", panel.id === tabId));
    renderSectionNavigator(tabId);
    if (tabId === "simulation") renderSimulation();
    if (tabId === "storm") renderStorm();
    if (tabId === "aar") renderAAR();
    if (tabId === "library") renderLibrary();
  }

  function averageForActor(actorId, field) {
    const rows = DATA.forcePackages.filter(p => p.actor_id === actorId);
    if (!rows.length) return 70;
    return rows.reduce((sum, row) => sum + Number(row[field] || 0), 0) / rows.length;
  }

  function initialStatus(scenario) {
    const amberEnabled = scenario.amberSupport !== "none";
    const resourceBalance = scenario.resourceBalance || { blue: 0, red: 0 };
    const resources = { ...RESOURCE_DEFAULTS, ...(scenario.resources || {}) };
    const droneIntelBonus = clamp((resources.blueDrones / RESOURCE_DEFAULTS.blueDrones - 1) * 3, -4, 4);
    const networkCommandBonus = clamp(((resources.starlinkNodes / RESOURCE_DEFAULTS.starlinkNodes) + (resources.highAltitudePlatforms / RESOURCE_DEFAULTS.highAltitudePlatforms) - 2) * 2, -5, 5);
    return {
      BLUE: {
        readiness: round1(clamp(averageForActor("BLUE", "readiness") + resourceBalance.blue * 0.12)),
        sustainment: round1(averageForActor("BLUE", "sustainment")),
        command: round1(clamp(averageForActor("BLUE", "command_quality") + networkCommandBonus)),
        intel: round1(clamp(64 - scenario.uncertainty * 3 + droneIntelBonus)),
        resources: scenario.inventoryEnabled ? scenario.abstractResources?.byActor?.BLUE?.overall ?? 100 : 100,
        civilianRisk: 25 + scenario.civilPressure * 5,
        powerAvailability: 100
      },
      RED: {
        readiness: round1(clamp(averageForActor("RED", "readiness") + resourceBalance.red * 0.12)),
        sustainment: round1(averageForActor("RED", "sustainment")),
        command: round1(averageForActor("RED", "command_quality")),
        intel: 68 - scenario.uncertainty * 2,
        resources: scenario.inventoryEnabled ? scenario.abstractResources?.byActor?.RED?.overall ?? 100 : 100,
        civilianRisk: 0
      },
      AMBER: {
        readiness: amberEnabled ? round1(averageForActor("AMBER", "readiness")) : 0,
        sustainment: amberEnabled ? round1(averageForActor("AMBER", "sustainment")) : 0,
        command: amberEnabled ? round1(averageForActor("AMBER", "command_quality")) : 0,
        intel: amberEnabled ? 82 : 0,
        resources: amberEnabled && scenario.inventoryEnabled
          ? scenario.abstractResources?.byActor?.AMBER?.overall ?? 0
          : scenario.amberSupport === "limited" ? 80 : scenario.amberSupport === "indirect" ? 60 : 0,
        civilianRisk: 0,
        precisionStockpile: 100
      }
    };
  }

  function readResourceInventory() {
    const number = (id, max) => clamp(Number($(id).value) || 0, 0, max);
    return {
      blueAircraft: number("blueAircraft", 240), blueInterceptors: number("blueInterceptors", 600),
      blueVessels: number("blueVessels", 80), blueLogistics: number("blueLogistics", 240),
      blueDrones: number("blueDrones", 1000), starlinkNodes: number("starlinkNodes", 200),
      highAltitudePlatforms: number("highAltitudePlatforms", 50),
      redAircraft: number("redAircraft", 360), redIncoming: number("redIncoming", 600),
      redVessels: number("redVessels", 100), redLogistics: number("redLogistics", 240)
    };
  }

  function inventoryTemplateRows() {
    return INVENTORY_TEMPLATE.map((values, index) => {
      const [actor, alias, category, nominal, availability, reserve, consumption, recovery, replenishment, delay, reliability, note] = values;
      return {
        id: `INV-${Date.now()}-${index + 1}`,
        actor, alias, category, nominal, current: nominal, availability, reserve,
        consumption, recovery, replenishment, delay, reliability, note,
        replenishmentApplied: false
      };
    });
  }

  function sanitizeInventoryRow(row, index = 0) {
    const actor = ["BLUE", "RED", "AMBER"].includes(row?.actor) ? row.actor : "BLUE";
    const category = Object.hasOwn(INVENTORY_CATEGORIES, row?.category) ? row.category : "logistics";
    const numeric = (key, fallback, max = 100000) => clamp(Number(row?.[key] ?? fallback) || 0, 0, max);
    const nominal = numeric("nominal", 0);
    return {
      id: String(row?.id || `INV-${Date.now()}-${index + 1}`).slice(0, 80),
      actor,
      alias: String(row?.alias || `${actor}-RESOURCE-${index + 1}`).replace(/[\r\n]+/g, " ").trim().slice(0, 80),
      category,
      nominal,
      current: clamp(Number(row?.current ?? nominal) || 0, 0, 100000),
      availability: numeric("availability", 100, 100),
      reserve: numeric("reserve", 20, 100),
      consumption: numeric("consumption", 1),
      recovery: numeric("recovery", 0),
      replenishment: numeric("replenishment", 0),
      delay: Math.round(numeric("delay", 0, 100)),
      reliability: numeric("reliability", 85, 100),
      note: String(row?.note || "").replace(/[\r\n]+/g, " ").trim().slice(0, 160),
      replenishmentApplied: Boolean(row?.replenishmentApplied)
    };
  }

  function renderDetailedInventoryRows(rows = inventoryTemplateRows()) {
    const host = $("detailedInventoryRows");
    if (!host) return;
    host.innerHTML = rows.map((raw, index) => {
      const row = sanitizeInventoryRow(raw, index);
      const numberInput = (field, value, max = 100000) => `<input class="inventory-${field}" type="number" min="0" max="${max}" step="1" value="${round1(value)}">`;
      return `<tr data-inventory-id="${escapeAttr(row.id)}">
        <td><select class="inventory-actor">
          ${["BLUE", "RED", "AMBER"].map(actor => `<option value="${actor}"${row.actor === actor ? " selected" : ""}>${actorLabel(actor)}</option>`).join("")}
        </select></td>
        <td><input class="inventory-alias" maxlength="80" value="${escapeAttr(row.alias)}" placeholder="例如 F-16V「毒蛇」"></td>
        <td><select class="inventory-category">
          ${Object.entries(INVENTORY_CATEGORIES).map(([key, label]) => `<option value="${key}"${row.category === key ? " selected" : ""}>${label}</option>`).join("")}
        </select></td>
        <td>${numberInput("nominal", row.nominal)}</td>
        <td>${numberInput("availability", row.availability, 100)}</td>
        <td>${numberInput("reserve", row.reserve, 100)}</td>
        <td>${numberInput("consumption", row.consumption)}</td>
        <td>${numberInput("recovery", row.recovery)}</td>
        <td>${numberInput("replenishment", row.replenishment)}</td>
        <td>${numberInput("delay", row.delay, 100)}</td>
        <td>${numberInput("reliability", row.reliability, 100)}</td>
        <td><input class="inventory-note" maxlength="160" value="${escapeAttr(row.note)}" placeholder="僅填合成說明"></td>
        <td><button type="button" class="danger remove-inventory-row" aria-label="移除此品項">×</button></td>
      </tr>`;
    }).join("");
    syncDetailedInventoryPreview();
  }

  function readDetailedInventoryRows() {
    return [...$("detailedInventoryRows").querySelectorAll("tr")].map((tr, index) => sanitizeInventoryRow({
      id: tr.dataset.inventoryId,
      actor: tr.querySelector(".inventory-actor").value,
      alias: tr.querySelector(".inventory-alias").value,
      category: tr.querySelector(".inventory-category").value,
      nominal: tr.querySelector(".inventory-nominal").value,
      current: tr.querySelector(".inventory-nominal").value,
      availability: tr.querySelector(".inventory-availability").value,
      reserve: tr.querySelector(".inventory-reserve").value,
      consumption: tr.querySelector(".inventory-consumption").value,
      recovery: tr.querySelector(".inventory-recovery").value,
      replenishment: tr.querySelector(".inventory-replenishment").value,
      delay: tr.querySelector(".inventory-delay").value,
      reliability: tr.querySelector(".inventory-reliability").value,
      note: tr.querySelector(".inventory-note").value
    }, index));
  }

  function calculateAbstractInventory(rows, previous = null) {
    const byActor = {};
    ["BLUE", "RED", "AMBER"].forEach(actor => {
      const actorRows = (rows || []).filter(row => row.actor === actor);
      const categories = {};
      Object.keys(INVENTORY_CATEGORIES).forEach(category => {
        const matching = actorRows.filter(row => row.category === category);
        if (!matching.length) return;
        const usable = matching.reduce((sum, row) => sum + row.current * row.availability / 100 * row.reliability / 100, 0);
        const reserve = matching.reduce((sum, row) => sum + row.current * row.reserve / 100, 0);
        const committable = Math.max(0, usable - reserve);
        const planned = matching.reduce((sum, row) => sum + row.consumption, 0);
        const endurance = planned > 0 ? committable / planned : 12;
        const score = round1(clamp(usable / INVENTORY_BASELINES[category] * 70 + Math.min(5, endurance) * 6));
        const previousScore = previous?.byActor?.[actor]?.categories?.[category]?.score;
        categories[category] = {
          score, usable: round1(usable), committable: round1(committable),
          endurance: round1(Math.min(99, endurance)),
          trend: Number.isFinite(previousScore) ? round1(score - previousScore) : 0
        };
      });
      const scores = Object.values(categories).map(item => item.score);
      byActor[actor] = {
        overall: scores.length ? round1(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0,
        categories
      };
    });
    return { byActor, generatedAt: new Date().toISOString(), scale: "SYNTHETIC_0_100" };
  }

  function renderInventoryAbstractPreview(abstractInventory) {
    const host = $("inventoryAbstractPreview");
    if (!host) return;
    host.innerHTML = ["BLUE", "RED", "AMBER"].map(actor => {
      const entry = abstractInventory.byActor[actor];
      const categories = Object.entries(entry.categories);
      return `<article class="inventory-actor-card ${actor}">
        <h5>${actorLabel(actor)} · 綜合 ${entry.overall}</h5>
        ${categories.length ? categories.map(([key, value]) => `<div class="inventory-score-row">
          <span>${INVENTORY_CATEGORIES[key]}</span>
          <span class="inventory-score-bar"><i style="width:${value.score}%"></i></span>
          <strong>${value.score}</strong>
        </div>`).join("") : `<p class="muted">尚無品項</p>`}
      </article>`;
    }).join("");
  }

  function syncInventoryPrivacy() {
    const mode = $("inventoryDataMode").value;
    const allow = $("allowSanitizedLlm").checked;
    const enabled = $("enableDetailedInventory").checked;
    const status = $("inventoryPrivacyStatus");
    status.classList.toggle("warning", mode === "sensitive_local" || !allow);
    if (!enabled) {
      status.textContent = "詳細帳本已停用；推演會沿用舊版合成資源指數。";
    } else if (mode === "sensitive_local" && !allow) {
      status.textContent = "本機隔離：品項明細與匿名摘要都不會送給 LLM；次回合想定包改由固定規則生成。";
    } else if (mode === "sensitive_local") {
      status.textContent = "敏感模式：原始名稱、數量、備註不離開瀏覽器；LLM 只能收到方別、類別、0–100 分數與趨勢。";
    } else if (!allow) {
      status.textContent = "LLM 摘要分享已關閉；次回合想定包改由固定規則生成。";
    } else {
      status.textContent = "公開名稱教學模式：裝備名稱只在本機增加臨場感；所有參數均為合成遊戲值。即使啟用 LLM，也只送出匿名化的 0–100 類別摘要。";
    }
  }

  function syncDetailedInventoryPreview() {
    if (!$("detailedInventoryRows")) return;
    const rows = readDetailedInventoryRows();
    renderInventoryAbstractPreview(calculateAbstractInventory(rows));
    syncInventoryPrivacy();
  }

  function calculateCombinedResourceBalance(resources, abstractResources) {
    const base = calculateResourceBalance(resources);
    const blueDetail = abstractResources?.byActor?.BLUE?.overall;
    const redDetail = abstractResources?.byActor?.RED?.overall;
    return {
      blue: round1(clamp(base.blue + (Number.isFinite(blueDetail) ? (blueDetail - 50) * .12 : 0), -15, 15)),
      red: round1(clamp(base.red + (Number.isFinite(redDetail) ? (redDetail - 50) * .12 : 0), -15, 15))
    };
  }

  function calculateResourceBalance(resources) {
    const normalized = { ...RESOURCE_DEFAULTS, ...(resources || {}) };
    const blueBase = ((normalized.blueAircraft / 48) + (normalized.blueInterceptors / 160) + (normalized.blueVessels / 14) + (normalized.blueLogistics / 72)) * 5 - 20;
    const networkBonus = ((normalized.blueDrones / 120) + (normalized.starlinkNodes / 24) + (normalized.highAltitudePlatforms / 6) - 3) * 2;
    const blue = blueBase + networkBonus;
    const red = ((normalized.redAircraft / 96) + (normalized.redIncoming / 180) + (normalized.redVessels / 24) + (normalized.redLogistics / 84)) * 5 - 20;
    return { blue: round1(clamp(blue, -15, 15)), red: round1(clamp(red, -15, 15)) };
  }

  function ensureScenarioResources(scenario) {
    scenario.resources = { ...RESOURCE_DEFAULTS, ...(scenario.resources || readResourceInventory()) };
    scenario.inventoryEnabled = Boolean(scenario.inventoryEnabled && Array.isArray(scenario.detailedInventory));
    scenario.inventoryMode ||= "synthetic";
    scenario.allowSanitizedLlm = scenario.allowSanitizedLlm !== false;
    scenario.useLlmNextTurn = scenario.useLlmNextTurn !== false;
    scenario.detailedInventory = (scenario.detailedInventory || []).map(sanitizeInventoryRow);
    scenario.initialDetailedInventory ||= JSON.parse(JSON.stringify(scenario.detailedInventory));
    scenario.resourceLedger ||= [];
    scenario.nextTurnPackages ||= [];
    scenario.events ||= [];
    scenario.intel ||= [];
    scenario.abstractResources = scenario.inventoryEnabled
      ? calculateAbstractInventory(scenario.detailedInventory, scenario.abstractResources)
      : null;
    scenario.resourceBalance = scenario.inventoryEnabled
      ? calculateCombinedResourceBalance(scenario.resources, scenario.abstractResources)
      : (scenario.resourceBalance || calculateResourceBalance(scenario.resources));
    scenario.strategicParameters = { ...STRATEGIC_DEFAULTS, ...(scenario.strategicParameters || {}) };
    scenario.turnOrderMode ||= "simultaneous";
    scenario.firstOrderVisibility ||= "sealed";
    return scenario;
  }

  function hydrateInventoryFormFromScenario(scenario) {
    if (!scenario || !$("detailedInventoryRows")) return;
    $("enableDetailedInventory").checked = Boolean(scenario.inventoryEnabled);
    $("inventoryDataMode").value = scenario.inventoryMode || "synthetic";
    $("useLlmNextTurn").checked = scenario.useLlmNextTurn !== false;
    $("allowSanitizedLlm").checked = scenario.allowSanitizedLlm !== false;
    if (scenario.detailedInventory?.length) {
      renderDetailedInventoryRows(scenario.detailedInventory);
    }
    syncInventoryPrivacy();
  }

  function readStrategicParameters() {
    return {
      coercionMode: $("coercionMode").value,
      energyReserveDays: clamp(Number($("energyReserveDays").value) || 0, 0, 60),
      residualPowerPct: clamp(Number($("residualPowerPct").value) || 0, 0, 100),
      precisionStockpileDays: clamp(Number($("precisionStockpileDays").value) || 0, 0, 60),
      nuclearStrikeCount: clamp(Number($("nuclearStrikeCount").value) || 0, 0, 20),
      globalEconomicShock: clamp(Number($("globalEconomicShock").value) || 1, 1, 5)
    };
  }

  function generateScenario(formValues) {
    const rng = mulberry32(formValues.seed);
    const focus = FOCUS_LIBRARY[formValues.focus];
    const difficulty = DIFFICULTY[formValues.difficulty];
    const eventCount = Math.max(4, Math.min(DATA.eventCards.length, Math.round(formValues.turns * 0.7 * difficulty.events)));
    const selectedEvents = sample(DATA.eventCards, eventCount, rng).map((event, index) => ({
      ...event,
      trigger_turn: Math.max(2, Math.min(formValues.turns, Math.round(2 + index * ((formValues.turns - 2) / Math.max(1, eventCount - 1))))),
      event_id: `${event.event_id}-${formValues.seed}`
    }));
    const template = SCENARIO_TEMPLATES[formValues.template];
    (template?.events || []).forEach((event, index) => selectedEvents.push({
      ...event,
      trigger_turn: Math.min(formValues.turns, Number(event.trigger_turn)),
      event_id: `CASE-${formValues.template}-${index + 1}-${formValues.seed}`,
      caseEvent: true
    }));

    const initialIntel = sample(DATA.intelligenceReports, Math.min(6, 2 + formValues.uncertainty), rng).map((r, idx) => ({
      ...r,
      report_id: `GEN-INT-${idx + 1}`,
      turn: Math.min(formValues.turns, Math.max(1, Math.ceil((idx + 1) * formValues.turns / 6))),
      confidence_pct: clamp(Number(r.confidence_pct) - formValues.uncertainty * 4 + Math.round(rng() * 12), 35, 95)
    }));

    const constraints = [
      formValues.teacherConstraints,
      "所有區域均為概略區域，不使用精確座標。",
      "白方可修正模型結果，但必須記錄裁決理由。",
      formValues.amberSupport === "none" ? "本想定不納入美軍支援。" :
        formValues.amberSupport === "indirect" ? "美軍僅提供ISR、後勤、網路與外交等間接支援。" :
        "美軍提供有限海空存在與防護支援，但受政治與升級風險限制。",
      formValues.weatherPreset === "adverse" ? "前半段海象及能見度明顯不利。" :
        formValues.weatherPreset === "stable" ? "天候大致穩定，但仍可能出現局部突變。" :
        "天候與海象在不同區域快速變化。"
    ].filter(Boolean);

    const overviewTemplates = [
      template?.overview,
      "紅方宣布在臺海周邊進行高強度聯合活動，商船改道、空運受限，雙方在資訊不完整下尋求維持自身目標。",
      "一系列海空活動與資訊操作使區域風險升高，藍方需要在有限資源下維持指揮、交通與民事韌性。",
      "區域出現有限封控、電磁干擾及外交施壓。各方必須判斷對手意圖，並避免局部事件失控。"
    ];

    return {
      id: `TS-${formValues.seed}`,
      name: formValues.name,
      seed: formValues.seed,
      focus: formValues.focus,
      focusTitle: focus.title,
      difficulty: formValues.difficulty,
      difficultyLabel: difficulty.label,
      turns: formValues.turns,
      hoursPerTurn: formValues.hoursPerTurn,
      uncertainty: formValues.uncertainty,
      civilPressure: formValues.civilPressure,
      amberSupport: formValues.amberSupport,
      weatherPreset: formValues.weatherPreset,
      turnOrderMode: formValues.turnOrderMode,
      firstOrderVisibility: formValues.firstOrderVisibility,
      templateKey: formValues.template,
      sourceLabel: template?.sourceLabel || "自訂合成想定",
      strategicParameters: formValues.strategicParameters,
      resources: formValues.resources,
      inventoryEnabled: formValues.inventoryEnabled,
      inventoryMode: formValues.inventoryMode,
      useLlmNextTurn: formValues.useLlmNextTurn,
      allowSanitizedLlm: formValues.allowSanitizedLlm,
      detailedInventory: formValues.detailedInventory,
      initialDetailedInventory: JSON.parse(JSON.stringify(formValues.detailedInventory)),
      abstractResources: formValues.inventoryEnabled ? calculateAbstractInventory(formValues.detailedInventory) : null,
      resourceLedger: [],
      nextTurnPackages: [],
      resourceBalance: formValues.inventoryEnabled
        ? calculateCombinedResourceBalance(formValues.resources, calculateAbstractInventory(formValues.detailedInventory))
        : calculateResourceBalance(formValues.resources),
      overview: template?.overview || pick(overviewTemplates.filter(Boolean), rng),
      objectives: template?.objectives || focus.objectives,
      successCriteria: template?.success || focus.success,
      constraints: [...constraints, ...(template?.extraConstraints || [])],
      events: selectedEvents,
      intel: initialIntel,
      createdAt: new Date().toISOString(),
      dataClass: "EDUCATIONAL_SYNTHETIC"
    };
  }

  function readScenarioForm() {
    return {
      name: $("scenarioName").value.trim() || "未命名想定",
      seed: Number($("scenarioSeed").value) || Date.now(),
      focus: $("focus").value,
      template: $("scenarioTemplate").value,
      difficulty: $("difficulty").value,
      turns: clamp(Number($("turns").value) || 12, 4, 24),
      hoursPerTurn: Number($("hoursPerTurn").value),
      uncertainty: Number($("uncertainty").value),
      civilPressure: Number($("civilPressure").value),
      amberSupport: $("amberSupport").value,
      weatherPreset: $("weatherPreset").value,
      turnOrderMode: $("turnOrderMode").value,
      firstOrderVisibility: $("firstOrderVisibility").value,
      strategicParameters: readStrategicParameters(),
      resources: readResourceInventory(),
      inventoryEnabled: $("enableDetailedInventory").checked,
      inventoryMode: $("inventoryDataMode").value,
      useLlmNextTurn: $("useLlmNextTurn").checked,
      allowSanitizedLlm: $("allowSanitizedLlm").checked,
      detailedInventory: readDetailedInventoryRows(),
      teacherConstraints: $("teacherConstraints").value.trim()
    };
  }

  function beginScenario(scenario) {
    state.scenario = ensureScenarioResources(scenario);
    state.currentTurn = 1;
    state.status = initialStatus(scenario);
    state.orders = {};
    state.logs = [];
    state.revealedIntel = [];
    state.aarReview = { turn: null, tab: "intel" };
    saveState(false);
    renderScenario();
    renderSimulation();
    renderAAR();
    toast("想定已生成，可進入回合推演。");
  }

  function renderScenario() {
    const container = $("scenarioPreview");
    if (!state.scenario) {
      container.className = "preview";
      container.innerHTML = `
        <div class="preview-summary preview-blank"><h3>想定摘要</h3><div class="empty-field"></div></div>
        <div class="preview-grid">
          <article class="card"><h3>目標</h3><div class="empty-field"></div></article>
          <article class="card"><h3>成功條件</h3><div class="empty-field"></div></article>
          <article class="card"><h3>限制與規則</h3><div class="empty-field"></div></article>
        </div>
        <article class="card" style="margin-top:1rem"><h3>合成資源基線</h3><div class="empty-field"></div></article>`;
      return;
    }
    const s = state.scenario;
    const strategic = { ...STRATEGIC_DEFAULTS, ...(s.strategicParameters || {}) };
    const detailedSummary = s.inventoryEnabled ? `
      <article class="card" style="margin-top:1rem">
        <div class="subheading"><h3>詳細庫存抽象換算</h3><span class="badge">${s.inventoryMode === "sensitive_local" ? "敏感／本機" : "公開名稱／合成參數"}</span></div>
        <div class="ledger-summary">
          ${["BLUE", "RED", "AMBER"].map(actor => `<span class="ledger-chip"><strong>${actorLabel(actor)}</strong> ${s.abstractResources?.byActor?.[actor]?.overall ?? 0}/100</span>`).join("")}
          <span class="ledger-chip">${s.detailedInventory.length} 個品項</span>
          <span class="ledger-chip">LLM：${s.useLlmNextTurn && s.allowSanitizedLlm ? "僅匿名摘要" : "不分享資源摘要"}</span>
        </div>
        <p class="muted">品項明細由固定規則換算並逐回合記帳；LLM 不負責數量計算，也不接收品項名稱、原始數量或備註。</p>
      </article>` : "";
    container.className = "preview";
    container.innerHTML = `
      <div class="preview-summary">
        <div class="subheading">
          <div>
            <p class="eyebrow">${escapeHtml(s.id)} · ${escapeHtml(s.difficultyLabel)}</p>
            <h3>${escapeHtml(s.name)}</h3>
          </div>
          <span class="badge">${s.turns}回合 × ${s.hoursPerTurn}小時</span>
        </div>
        <p>${escapeHtml(s.overview)}</p>
        <p class="muted">參考架構：${escapeHtml(s.sourceLabel || "自訂合成想定")}；所有數值均為教育推演假設。</p>
        <div class="tag-list">
          <span class="tag">${escapeHtml(s.focusTitle)}</span>
          <span class="tag">情報不確定度 ${s.uncertainty}/5</span>
          <span class="tag">民事壓力 ${s.civilPressure}/5</span>
          <span class="tag">${amberLabel(s.amberSupport)}</span>
          <span class="tag">${weatherLabel(s.weatherPreset)}</span>
          <span class="tag">${escapeHtml(turnOrderModeLabel(s.turnOrderMode))}</span>
          <span class="tag">${s.turnOrderMode === "simultaneous" ? "命令密封" : s.firstOrderVisibility === "public" ? "先手命令公開" : "先手命令不公開"}</span>
        </div>
      </div>
      <div class="preview-grid">
        <article class="card">
          <h3>目標</h3>
          <ul class="compact-list">${s.objectives.map(v => `<li>${escapeHtml(v)}</li>`).join("")}</ul>
        </article>
        <article class="card">
          <h3>成功條件</h3>
          <ul class="compact-list">${s.successCriteria.map(v => `<li>${escapeHtml(v)}</li>`).join("")}</ul>
        </article>
        <article class="card">
          <h3>限制與規則</h3>
          <ul class="compact-list">${s.constraints.map(v => `<li>${escapeHtml(v)}</li>`).join("")}</ul>
        </article>
      </div>
      <article class="card" style="margin-top:1rem">
        <div class="subheading"><h3>戰略壓力假設</h3><span class="muted">可在生成器中調整</span></div>
        <div class="preview-grid">
          <div><strong>衝突型態</strong><p class="muted">${escapeHtml(coercionModeLabel(strategic.coercionMode))}</p></div>
          <div><strong>能源與電力</strong><p class="muted">安全存量 ${strategic.energyReserveDays} 天<br>耗盡後電力 ${strategic.residualPowerPct}%</p></div>
          <div><strong>彈藥、核與經濟</strong><p class="muted">精準彈藥 ${strategic.precisionStockpileDays} 天 · 核攻擊 ${strategic.nuclearStrikeCount} 次（抽象）<br>全球經濟衝擊 ${strategic.globalEconomicShock}/5</p></div>
        </div>
      </article>
      <article class="card" style="margin-top:1rem">
        <div class="subheading"><h3>本想定合成資源基線</h3><span class="muted">只用於方案比較與隨機模擬</span></div>
        <div class="preview-grid">
          <div><strong>藍方</strong><p class="muted">航空架次 ${s.resources.blueAircraft} · 攔截彈 ${s.resources.blueInterceptors}<br>巡防平台 ${s.resources.blueVessels} · 補給批次 ${s.resources.blueLogistics}<br>無人機任務批次 ${s.resources.blueDrones}</p></div>
          <div><strong>紅方</strong><p class="muted">航空架次 ${s.resources.redAircraft} · 合成來襲目標 ${s.resources.redIncoming}<br>海上平台 ${s.resources.redVessels} · 補給批次 ${s.resources.redLogistics}</p></div>
          <div><strong>通訊與資源壓力</strong><p class="muted">星鏈節點 ${s.resources.starlinkNodes} · 高空通訊平臺 ${s.resources.highAltitudePlatforms}<br>藍方資源修正 ${s.resourceBalance.blue >= 0 ? "+" : ""}${s.resourceBalance.blue}<br>紅方資源修正 ${s.resourceBalance.red >= 0 ? "+" : ""}${s.resourceBalance.red}</p></div>
        </div>
      </article>
      ${detailedSummary}
      <div class="actions" style="margin-top:1rem">
        <button class="primary" id="goSimulationBtn">開始回合推演</button>
        <button class="secondary" id="regenerateEventsBtn">以相同設定重抽事件</button>
        <button class="danger" id="clearScenarioBtn">清除想定</button>
      </div>
    `;
    $("goSimulationBtn").addEventListener("click", () => setTab("simulation"));
    $("regenerateEventsBtn").addEventListener("click", () => {
      $("scenarioSeed").value = Number($("scenarioSeed").value) + 1;
      beginScenario(generateScenario(readScenarioForm()));
    });
    $("clearScenarioBtn").addEventListener("click", clearScenario);
  }

  function amberLabel(value) {
    return ({ none: "不納入美軍", indirect: "美軍間接支援", limited: "美軍有限支援" }[value] || value);
  }

  function weatherLabel(value) {
    return ({ stable: "穩定天候", variable: "多變天候", adverse: "不利天候" }[value] || value);
  }

  function coercionModeLabel(value) {
    return ({
      limited_blockade: "有限封控",
      law_enforcement_blockade: "海警與海上民兵執法封控",
      conventional_conflict: "傳統軍事衝突",
      nuclear_escalation: "核升級風險情境"
    }[value] || value);
  }

  function turnOrderModeLabel(value) {
    return ({
      simultaneous: "同時密封提交",
      red_first: "紅方先行",
      alternating: "輪替先行"
    }[value] || value);
  }

  function renderSimulation() {
    const hasScenario = !!state.scenario;
    $("simulationEmpty").hidden = hasScenario;
    $("simulationContent").hidden = !hasScenario;
    $("resolveTurnBtn").disabled = !hasScenario || state.currentTurn > (state.scenario?.turns || 0);
    if (!hasScenario) {
      scheduleSectionNavigatorUpdate();
      return;
    }

    $("turnBadge").textContent = state.currentTurn > state.scenario.turns
      ? "推演完成"
      : `第 ${state.currentTurn} / ${state.scenario.turns} 回合（T+${(state.currentTurn - 1) * state.scenario.hoursPerTurn}h）`;

    renderStatusCards();
    renderZoneMap();
    renderOperationTheater();
    renderOrderControls();
    renderCurrentOrders();
    renderTurnPanels();
    renderResourceLedger();
    renderNextTurnPackage();
    renderNarrative();
    updateLab();
    scheduleSectionNavigatorUpdate();
  }

  function renderStatusCards() {
    const cards = [
      ["BLUE", "藍方準備指數"],
      ["RED", "紅方準備指數"],
      ["AMBER", "外部支援準備"],
      ["CIV", "民事風險"]
    ];
    $("statusCards").innerHTML = cards.map(([id, label]) => {
      if (id === "CIV") {
        return `<article class="metric neutral"><small>${label}</small><strong>${round1(state.status.BLUE.civilianRisk)}</strong><small>0低風險／100高風險</small></article>`;
      }
      const actor = state.status[id];
      const strategicNote = id === "BLUE" && Number.isFinite(actor.powerAvailability)
        ? ` · 電力 ${round1(actor.powerAvailability)}%`
        : id === "AMBER" && Number.isFinite(actor.precisionStockpile)
          ? ` · 精準彈藥 ${round1(actor.precisionStockpile)}%`
          : "";
      return `<article class="metric ${id.toLowerCase()}">
        <small>${label}</small>
        <strong>${round1(actor.readiness)}</strong>
        <small>後勤 ${round1(actor.sustainment)} · 指管 ${round1(actor.command)} · 資源 ${round1(actor.resources)}${strategicNote}</small>
      </article>`;
    }).join("");
  }

  function renderZoneMap() {
    const currentOrders = state.orders[state.currentTurn] || {};
    const events = currentEvents();
    const zones = DATA.zones.filter(z => z.zone_id !== "Z-REAR" || state.scenario.amberSupport !== "none");
    $("zoneMap").innerHTML = zones.map(zone => {
      const actorMarkerCounts = new Map();
      Object.entries(currentOrders).forEach(([actorId, order]) => {
        const actor = order.actor || actorId;
        const count = orderItems(order).filter(item => item.zone === zone.zone_id).length;
        if (count) actorMarkerCounts.set(actor, count);
      });
      const actorMarkers = ["BLUE", "RED", "AMBER"].filter(actor => actorMarkerCounts.has(actor));
      const neutralSignals = events.filter(event => event.zone_id === zone.zone_id);
      return `<div class="zone" data-zone="${zone.zone_id}" title="${escapeHtml(zone.teaching_note || "")}">
        <div><span class="zone-name">${escapeHtml(zone.zone_name)}</span><br><small>${escapeHtml(zone.domain)} · ${escapeHtml(zone.distance_band)}</small></div>
        <div class="zone-signals">
          ${actorMarkers.map(actor => {
            const markerText = ({ BLUE: "藍", RED: "紅", AMBER: "黃" })[actor];
            const markerLabel = `${actorLabel(actor)}在此區域有 ${actorMarkerCounts.get(actor)} 項已提交行動`;
            return `<span class="zone-actor-marker ${actor}" role="img" aria-label="${escapeAttr(markerLabel)}" title="${escapeAttr(markerLabel)}">${markerText}</span>`;
          }).join("")}
          ${neutralSignals.map(() => `<i class="signal neutral" title="民事或天候事件"></i>`).join("")}
        </div>
      </div>`;
    }).join("");
  }

  function operationType(action) {
    const text = String(action || "");
    if (/商船護航|多國商船護航/.test(text)) return { type: "convoy", combat: false };
    if (/防空|強化防空警戒/.test(text)) return { type: "airdefense", combat: /交戰/.test(text) };
    if (/航空|空中|空中施壓/.test(text)) return { type: "aviation", combat: true };
    if (/遠程火力/.test(text)) return { type: "longrange", combat: true };
    if (/水下|反潛/.test(text)) return { type: "subsurface", combat: true };
    if (/無人機/.test(text)) return { type: "drone", combat: false };
    if (/星鏈|衛星|高空平臺|高空通訊/.test(text)) return { type: "satellite", combat: false };
    if (/備援通訊|網路防護|通訊/.test(text)) return { type: "communications", combat: false };
    if (/海上|臨檢|封控區|海警|民兵/.test(text)) {
      return { type: "maritime", combat: /拒止|封控|臨檢|攔截/.test(text) };
    }
    if (/後勤|工業補充|供應鏈/.test(text)) return { type: "logistics", combat: false };
    if (/能源|電網/.test(text)) return { type: "energy", combat: false };
    if (/外交/.test(text)) return { type: "diplomacy", combat: false };
    if (/人道/.test(text)) return { type: "humanitarian", combat: false };
    if (/情報|ISR/.test(text)) return { type: "intelligence", combat: false };
    if (/分散部署/.test(text)) return { type: "disperse", combat: false };
    if (/經濟/.test(text)) return { type: "logistics", combat: false };
    return { type: "communications", combat: false };
  }

  function operationEquipmentOptions(actor, type) {
    return OPERATION_EQUIPMENT_LABELS[actor]?.[type] || [];
  }

  function operationEquipmentLabel(actor, type, seedText = "") {
    const options = operationEquipmentOptions(actor, type);
    if (!options.length) return "";
    return options[hashText(`${actor}-${type}-${seedText}`) % options.length];
  }

  function renderOperationIconLegend() {
    const legend = $("operationIconLegend");
    if (!legend || legend.dataset.rendered === "true") return;
    const factionLabels = {
      BLUE: "藍方（臺灣）",
      RED: "紅方（中國大陸）",
      AMBER: "黃方（外部支援）"
    };
    legend.innerHTML = ["BLUE", "RED", "AMBER"].map(actor => `
      <section class="operation-icon-faction ${actor}" aria-label="${factionLabels[actor]}圖標">
        <h6>${factionLabels[actor]}</h6>
        <div class="operation-icon-list">
          ${ACTIONS[actor].map(([action]) => {
            const type = operationType(action).type;
            const equipment = operationEquipmentOptions(actor, type);
            return `<div class="operation-icon-item" title="${escapeAttr(action)}">
              <canvas data-operation-icon="${type}" data-operation-actor="${actor}" aria-hidden="true"></canvas>
              <div><strong>${escapeHtml(action)}</strong><span>${escapeHtml(equipment.length ? `敘事裝備：${equipment.join("／")}` : OPERATION_TYPE_LABELS[type] || "抽象行動圖標")}</span></div>
            </div>`;
          }).join("")}
        </div>
      </section>
    `).join("");
    legend.querySelectorAll("canvas[data-operation-icon]").forEach(canvas => {
      const actor = OPERATION_ACTORS[canvas.dataset.operationActor];
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const size = 32;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawOperationPictogram(ctx, canvas.dataset.operationIcon, size / 2, size / 2, 11, actor.color, 0);
    });
    legend.dataset.rendered = "true";
  }

  function operationSceneForLog(log) {
    if (!log?.orders) return null;
    const actions = [];
    ["BLUE", "RED", "AMBER"].forEach((actor, actorIndex) => {
      const order = log.orders[actor];
      if (!order) return;
      orderItems(order).forEach((item, itemIndex) => {
        const kind = operationType(item.action);
        actions.push({
          actor,
          actorIndex,
          itemIndex,
          primary: itemIndex === 0,
          action: item.action,
          zone: item.zone,
          resource: Number(item.resource) || 0,
          priority: Number(item.priority) || 3,
          type: kind.type,
          equipment: operationEquipmentLabel(actor, kind.type, `${log.turn}-${item.action}-${itemIndex}`),
          combat: kind.combat,
          start: 650 + actorIndex * 450 + itemIndex * 380
        });
      });
    });
    const conflicts = detectOperationConflicts(actions);
    const key = `${state.scenario?.seed || 0}-${log.turn}-${hashText(JSON.stringify(log.orders))}`;
    return {
      key,
      log,
      actions,
      conflicts,
      duration: conflicts.length ? 14500 : 12000
    };
  }

  function latestOperationScene() {
    return operationSceneForLog(state.logs[state.logs.length - 1]);
  }

  function detectOperationConflicts(actions) {
    const byZone = new Map();
    actions.filter(action => action.combat).forEach(action => {
      if (!byZone.has(action.zone)) byZone.set(action.zone, []);
      byZone.get(action.zone).push(action);
    });
    const conflicts = [];
    byZone.forEach((items, zone) => {
      const actors = new Set(items.map(item => item.actor));
      const opposed = actors.has("RED") && (actors.has("BLUE") || actors.has("AMBER"));
      if (!opposed) return;
      const intensity = items.reduce((sum, item) => sum + Math.max(3, item.resource) * (.72 + item.priority * .13), 0);
      const explicitEngagement = items.some(item => /交戰|攔截|拒止|反制/.test(item.action));
      if (actors.size >= 3 || intensity >= 38 || (explicitEngagement && intensity >= 28)) {
        conflicts.push({ zone, items, intensity: round1(intensity), actors: [...actors] });
      }
    });
    if (!conflicts.length) {
      const combatActions = actions.filter(action => action.combat);
      const actors = new Set(combatActions.map(action => action.actor));
      const opposed = actors.has("RED") && (actors.has("BLUE") || actors.has("AMBER"));
      const theaterIntensity = combatActions.reduce((sum, item) => sum + Math.max(3, item.resource) * (.72 + item.priority * .13), 0);
      const explicitEngagement = combatActions.some(item => /交戰|攔截|拒止|反制/.test(item.action));
      if (opposed && (theaterIntensity >= 72 || (explicitEngagement && theaterIntensity >= 58))) {
        const focalAction = [...combatActions].sort((a, b) => (b.resource * b.priority) - (a.resource * a.priority))[0];
        conflicts.push({
          zone: focalAction.zone,
          items: combatActions,
          intensity: round1(theaterIntensity),
          actors: [...actors],
          theaterWide: true
        });
      }
    }
    return conflicts;
  }

  function renderOperationTheater() {
    const canvas = $("operationCanvas");
    if (!canvas) return;
    renderOperationIconLegend();
    const scene = latestOperationScene();
    const replay = $("operationReplayBtn");
    const pause = $("operationPauseBtn");
    const empty = $("operationCanvasEmpty");
    const currentOrders = state.orders[state.currentTurn] || {};

    if (!scene) {
      stopOperationAnimation();
      operationAnimation.scene = null;
      operationAnimation.sceneKey = "";
      operationAnimation.autoPlayedKey = "";
      operationAnimation.pendingAutoplayTurn = null;
      replay.disabled = true;
      pause.disabled = true;
      empty.hidden = false;
      empty.setAttribute("aria-hidden", "false");
      $("operationTheaterStatus").textContent = `等待第 ${state.currentTurn} 回合結算後顯示三方行動。`;
      $("operationActorSummary").innerHTML = ["BLUE", "RED", "AMBER"]
        .filter(actor => actor !== "AMBER" || state.scenario?.amberSupport !== "none")
        .map(actor => `<div class="operation-actor-chip ${actor}"><strong>${actorLabel(actor)}</strong><span>${currentOrders[actor] ? "命令已提交；內容於規則允許時揭露" : "等待命令"}</span></div>`)
        .join("");
      $("operationCanvasDescription").textContent = "尚無已結算回合；動畫不會提前揭露密封命令。";
      drawOperationFrame(0, null);
      return;
    }

    replay.disabled = false;
    replay.textContent = "重播";
    pause.disabled = false;
    empty.hidden = true;
    empty.setAttribute("aria-hidden", "true");
    const changed = scene.key !== operationAnimation.sceneKey;
    if (changed) {
      stopOperationAnimation();
      operationAnimation.scene = scene;
      operationAnimation.sceneKey = scene.key;
      operationAnimation.duration = scene.duration;
      operationAnimation.elapsed = scene.duration;
    } else {
      operationAnimation.scene = scene;
      operationAnimation.duration = scene.duration;
    }

    const conflictText = scene.conflicts.length
      ? ` · 偵測到 ${scene.conflicts.length} 個重大衝突區域`
      : " · 未達重大衝突高亮門檻";
    $("operationTheaterStatus").textContent = `最近結算：第 ${scene.log.turn} 回合${conflictText}`;
    $("operationActorSummary").innerHTML = ["BLUE", "RED", "AMBER"]
      .filter(actor => scene.log.orders[actor])
      .map(actor => {
        const order = scene.log.orders[actor];
        const primary = orderPrimary(order);
        const supports = orderSupports(order);
        const primaryType = operationType(primary.action).type;
        const equipment = operationEquipmentLabel(actor, primaryType, `${scene.log.turn}-${primary.action}-0`);
        return `<div class="operation-actor-chip ${actor}">
          <strong>${actorLabel(actor)} · ${escapeHtml(primary.action)}</strong>
          <span>${equipment ? `${escapeHtml(equipment)} · ` : ""}${escapeHtml(zoneName(primary.zone))} · 支援 ${supports.length} 項</span>
        </div>`;
      }).join("");
    $("operationCanvasDescription").textContent = `第 ${scene.log.turn} 回合抽象三方行動示意。${scene.conflicts.length ? `重大衝突區域：${scene.conflicts.map(item => zoneName(item.zone)).join("、")}。` : "本回合沒有達到重大衝突高亮門檻。"}公開裝備名稱僅作敘事標籤；不代表真實座標、數量、性能、部隊部署或交戰程序。`;
    if (!operationAnimation.playing) drawOperationFrame(operationAnimation.elapsed, scene);
    const theaterExpanded = !$("operationTheater").classList.contains("collapsed");
    const simulationVisible = $("simulation").classList.contains("active") && theaterExpanded;
    const shouldAutoplay = theaterExpanded && (
      operationAnimation.pendingAutoplayTurn === scene.log.turn
      || (simulationVisible && operationAnimation.autoPlayedKey !== scene.key)
    );
    if (shouldAutoplay) {
      operationAnimation.pendingAutoplayTurn = null;
      operationAnimation.autoPlayedKey = scene.key;
      requestAnimationFrame(() => startOperationAnimation(true));
    }
  }

  function stopOperationAnimation() {
    if (operationAnimation.frameId) cancelAnimationFrame(operationAnimation.frameId);
    operationAnimation.frameId = 0;
    operationAnimation.playing = false;
    const pause = $("operationPauseBtn");
    if (pause) pause.textContent = "暫停";
    const frame = $("operationCanvasFrame");
    if (frame) frame.classList.remove("major-conflict-active");
  }

  function startOperationAnimation(restart = false) {
    const scene = operationAnimation.scene || latestOperationScene();
    if (!scene) return;
    operationAnimation.scene = scene;
    operationAnimation.sceneKey = scene.key;
    operationAnimation.duration = scene.duration;
    if (restart) operationAnimation.elapsed = 0;
    stopOperationAnimation();
    operationAnimation.playing = true;
    operationAnimation.startedAt = performance.now() - operationAnimation.elapsed / operationAnimation.speed;
    $("operationPauseBtn").textContent = "暫停";
    operationAnimation.frameId = requestAnimationFrame(stepOperationAnimation);
  }

  function stepOperationAnimation(now) {
    if (!operationAnimation.playing || !operationAnimation.scene) return;
    operationAnimation.elapsed = Math.min(
      operationAnimation.duration,
      (now - operationAnimation.startedAt) * operationAnimation.speed
    );
    drawOperationFrame(operationAnimation.elapsed, operationAnimation.scene);
    if (operationAnimation.elapsed < operationAnimation.duration) {
      operationAnimation.frameId = requestAnimationFrame(stepOperationAnimation);
    } else {
      operationAnimation.playing = false;
      operationAnimation.frameId = 0;
      $("operationPauseBtn").textContent = "重新播放";
      $("operationCanvasFrame").classList.remove("major-conflict-active");
    }
  }

  function toggleOperationAnimation() {
    if (!operationAnimation.scene) return;
    if (!operationAnimation.playing) {
      startOperationAnimation(operationAnimation.elapsed >= operationAnimation.duration);
      return;
    }
    operationAnimation.elapsed = Math.min(
      operationAnimation.duration,
      (performance.now() - operationAnimation.startedAt) * operationAnimation.speed
    );
    stopOperationAnimation();
    $("operationPauseBtn").textContent = "繼續";
    drawOperationFrame(operationAnimation.elapsed, operationAnimation.scene);
  }

  function setOperationSpeed() {
    const nextSpeed = Number($("operationSpeed").value) || 1;
    if (operationAnimation.playing) {
      operationAnimation.elapsed = Math.min(
        operationAnimation.duration,
        (performance.now() - operationAnimation.startedAt) * operationAnimation.speed
      );
      operationAnimation.speed = nextSpeed;
      operationAnimation.startedAt = performance.now() - operationAnimation.elapsed / nextSpeed;
    } else {
      operationAnimation.speed = nextSpeed;
    }
  }

  async function toggleOperationFullscreen() {
    const theater = $("operationTheater");
    if (!theater || !document.fullscreenEnabled) {
      toast("此瀏覽器不支援全螢幕模式。");
      return;
    }
    try {
      if (document.fullscreenElement === theater) await document.exitFullscreen();
      else await theater.requestFullscreen();
    } catch {
      toast("無法切換全螢幕模式，請檢查瀏覽器權限。");
    }
  }

  function syncOperationFullscreen() {
    const button = $("operationFullscreenBtn");
    const theater = $("operationTheater");
    if (!button || !theater) return;
    const active = document.fullscreenElement === theater;
    button.textContent = active ? "退出全螢幕" : "全螢幕";
    button.setAttribute("aria-pressed", String(active));
    requestAnimationFrame(() => drawOperationFrame(operationAnimation.elapsed, operationAnimation.scene));
  }

  async function toggleOperationTheaterVisibility() {
    const theater = $("operationTheater");
    const button = $("operationToggleVisibilityBtn");
    if (!theater || !button) return;
    const collapsing = !theater.classList.contains("collapsed");
    if (collapsing && document.fullscreenElement === theater) {
      try { await document.exitFullscreen(); } catch { /* Continue with the inline collapsed state. */ }
    }
    if (collapsing && operationAnimation.playing) {
      operationAnimation.elapsed = Math.min(
        operationAnimation.duration,
        (performance.now() - operationAnimation.startedAt) * operationAnimation.speed
      );
      stopOperationAnimation();
      $("operationPauseBtn").textContent = "繼續";
    }
    theater.classList.toggle("collapsed", collapsing);
    button.textContent = collapsing ? "顯示動畫" : "隱藏";
    button.setAttribute("aria-expanded", String(!collapsing));
    if (!collapsing) {
      renderOperationTheater();
      requestAnimationFrame(() => drawOperationFrame(operationAnimation.elapsed, operationAnimation.scene));
    }
  }

  function operationCanvasContext(canvasId = "operationCanvas", frameId = "operationCanvasFrame") {
    const canvas = $(canvasId);
    const frame = $(frameId);
    if (!canvas || !frame) return null;
    const rect = frame.getBoundingClientRect();
    const width = Math.max(320, Math.round(rect.width || 640));
    const height = Math.max(240, Math.round(rect.height || 400));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  }

  function drawOperationFrame(elapsed, scene, options = {}) {
    const canvasId = options.canvasId || "operationCanvas";
    const frameId = options.frameId || "operationCanvasFrame";
    const playing = options.playing ?? operationAnimation.playing;
    const surface = operationCanvasContext(canvasId, frameId);
    if (!surface) return;
    const frame = $(frameId);
    const { ctx, width, height } = surface;
    ctx.clearRect(0, 0, width, height);
    drawOperationBackground(ctx, width, height);
    drawOperationMap(ctx, width, height);
    if (!scene) {
      frame.classList.remove("major-conflict", "major-conflict-active");
      return;
    }

    scene.actions.forEach(action => drawOperationAction(ctx, width, height, action, elapsed));
    const conflictActive = scene.conflicts.length && elapsed >= 6200 && elapsed <= 11100;
    const conflictVisible = scene.conflicts.length && elapsed >= 6000;
    frame.classList.toggle("major-conflict", !!conflictVisible);
    frame.classList.toggle("major-conflict-active", !!(conflictActive && playing));
    if (conflictVisible) {
      scene.conflicts.forEach((conflict, index) => drawOperationConflict(ctx, width, height, conflict, elapsed, index));
      drawCanvasConflictFrame(ctx, width, height, elapsed, conflictActive);
    }
    if (elapsed >= scene.duration - 2400) drawOperationOutcome(ctx, width, height, scene, elapsed);
  }

  function drawOperationBackground(ctx, width, height) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#071c2b");
    gradient.addColorStop(.55, "#0c3043");
    gradient.addColorStop(1, "#061724");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.strokeStyle = "rgba(148,205,226,.08)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 10]);
    for (let x = width * .08; x < width; x += width * .1) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = height * .12; y < height; y += height * .12) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawOperationMap(ctx, width, height) {
    ctx.save();
    const mapHeight = height * 1.04;
    const mapWidth = mapHeight * OPERATION_MAP_ASPECT;
    const mapX = width * .59 - mapWidth * .74;
    const mapY = height * .51 - mapHeight * .56;
    if (operationMapReady) {
      ctx.globalAlpha = .64;
      ctx.filter = "grayscale(1) sepia(.28) hue-rotate(145deg) saturate(1.35) brightness(.78) contrast(1.18)";
      ctx.drawImage(operationMapImage, mapX, mapY, mapWidth, mapHeight);
      ctx.filter = "none";
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = "rgba(204,230,239,.52)";
      ctx.font = `700 ${Math.max(9, width * .012)}px sans-serif`;
      ctx.fillText("臺海向量底圖載入中…", width * .39, height * .5);
    }

    ctx.font = `700 ${Math.max(10, width * .015)}px sans-serif`;
    ctx.fillStyle = "rgba(218,239,246,.78)";
    ctx.fillText("大陸沿岸", mapX + mapWidth * .09, mapY + mapHeight * .13);
    ctx.fillText("臺灣", mapX + mapWidth * .8, mapY + mapHeight * .51);
    ctx.font = `650 ${Math.max(8, width * .011)}px sans-serif`;
    ctx.fillText("金門", mapX + mapWidth * .045, mapY + mapHeight * .46);
    ctx.fillText("澎湖", mapX + mapWidth * .35, mapY + mapHeight * .62);
    ctx.font = `700 ${Math.max(10, width * .015)}px sans-serif`;
    ctx.fillText("外部支援區", width * .83, height * .12);

    ctx.font = `600 ${Math.max(8, width * .011)}px sans-serif`;
    Object.entries(OPERATION_ZONE_ANCHORS).forEach(([zone, point]) => {
      const x = point[0] * width;
      const y = point[1] * height;
      ctx.strokeStyle = "rgba(164,210,225,.22)";
      ctx.beginPath(); ctx.arc(x, y, Math.max(10, width * .018), 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(200,228,237,.5)";
      ctx.fillText(zoneName(zone), x + 7, y - 8);
    });
    ctx.restore();
  }

  function drawOperationAction(ctx, width, height, action, elapsed) {
    if (elapsed < action.start) return;
    const actor = OPERATION_ACTORS[action.actor];
    const home = { x: actor.home[0] * width, y: actor.home[1] * height };
    const anchor = OPERATION_ZONE_ANCHORS[action.zone] || OPERATION_ZONE_ANCHORS["Z-CW"];
    const spread = action.itemIndex ? (action.itemIndex % 2 ? 1 : -1) * Math.min(18, width * .023) : 0;
    const target = { x: anchor[0] * width + spread, y: anchor[1] * height + spread * .35 };
    const travelDuration = action.primary ? 3500 : 2700;
    const rawProgress = clamp((elapsed - action.start) / travelDuration, 0, 1);
    const progress = rawProgress < .5 ? 2 * rawProgress * rawProgress : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;
    const bend = (action.actorIndex - 1) * height * .08 + (action.itemIndex % 2 ? height * .04 : -height * .03);
    const control = {
      x: (home.x + target.x) / 2,
      y: (home.y + target.y) / 2 + bend
    };
    const point = quadraticPoint(home, control, target, progress);
    const ahead = quadraticPoint(home, control, target, Math.min(1, progress + .015));
    const rotation = Math.atan2(ahead.y - point.y, ahead.x - point.x);

    ctx.save();
    ctx.globalAlpha = action.primary ? .82 : .48;
    ctx.strokeStyle = actor.color;
    ctx.lineWidth = action.primary ? 2.1 : 1.25;
    ctx.setLineDash(action.type === "subsurface" ? [3, 7] : [7, 7]);
    ctx.beginPath();
    for (let index = 0; index <= 24 * progress; index++) {
      const sample = quadraticPoint(home, control, target, index / 24);
      if (index === 0) ctx.moveTo(sample.x, sample.y);
      else ctx.lineTo(sample.x, sample.y);
    }
    ctx.stroke();
    ctx.restore();

    const iconSize = (action.primary ? 22 : 15) + Math.min(5, action.resource / 8);
    drawOperationPictogram(ctx, action.type, point.x, point.y, iconSize, actor.color, rotation);
    if (action.primary && action.equipment && width >= 620) {
      drawOperationEquipmentTag(ctx, width, action.equipment, point.x, point.y, actor.color);
    }
    if (progress >= .96) drawOperationEffect(ctx, action, target.x, target.y, elapsed);
  }

  function drawOperationEquipmentTag(ctx, width, label, x, y, color) {
    const display = label.length > 26 ? `${label.slice(0, 25)}…` : label;
    ctx.save();
    ctx.font = `700 ${Math.max(10, width * .011)}px sans-serif`;
    const paddingX = 8;
    const boxHeight = 22;
    const boxWidth = Math.min(210, ctx.measureText(display).width + paddingX * 2);
    const boxX = clamp(x - boxWidth / 2, 6, width - boxWidth - 6);
    const boxY = Math.max(6, y - 43);
    ctx.fillStyle = "rgba(3,18,29,.88)";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    roundedRectPath(ctx, boxX, boxY, boxWidth, boxHeight, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.fillText(display, boxX + paddingX, boxY + boxHeight / 2);
    ctx.restore();
  }

  function quadraticPoint(start, control, end, progress) {
    const inverse = 1 - progress;
    return {
      x: inverse * inverse * start.x + 2 * inverse * progress * control.x + progress * progress * end.x,
      y: inverse * inverse * start.y + 2 * inverse * progress * control.y + progress * progress * end.y
    };
  }

  function drawOperationPictogram(ctx, type, x, y, size, color, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(["aviation", "longrange"].includes(type) ? rotation : 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(1.4, size * .08);
    ctx.strokeStyle = color;
    ctx.fillStyle = "rgba(5,24,36,.88)";
    ctx.shadowColor = color;
    ctx.shadowBlur = size * .45;
    ctx.beginPath(); ctx.arc(0, 0, size * .66, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    if (type === "aviation") {
      ctx.beginPath();
      ctx.moveTo(size * .5, 0); ctx.lineTo(-size * .2, -size * .12); ctx.lineTo(-size * .48, -size * .42);
      ctx.lineTo(-size * .56, -size * .35); ctx.lineTo(-size * .38, 0); ctx.lineTo(-size * .56, size * .35);
      ctx.lineTo(-size * .48, size * .42); ctx.lineTo(-size * .2, size * .12); ctx.closePath(); ctx.fill();
    } else if (type === "convoy" || type === "maritime") {
      ctx.beginPath(); ctx.moveTo(-size * .45, size * .12); ctx.lineTo(size * .45, size * .12);
      ctx.lineTo(size * .28, size * .38); ctx.lineTo(-size * .28, size * .38); ctx.closePath(); ctx.stroke();
      ctx.strokeRect(-size * .18, -size * .18, size * .36, size * .3);
      ctx.beginPath(); ctx.moveTo(-size * .5, size * .5); ctx.quadraticCurveTo(0, size * .36, size * .5, size * .5); ctx.stroke();
      if (type === "convoy") {
        ctx.beginPath(); ctx.arc(-size * .34, -size * .32, size * .09, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, -size * .32, size * .09, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(size * .34, -size * .32, size * .09, 0, Math.PI * 2); ctx.fill();
      }
    } else if (type === "airdefense" || type === "intelligence") {
      ctx.beginPath(); ctx.arc(0, size * .18, size * .38, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, size * .18); ctx.lineTo(size * .28, -size * .15); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, size * .18, size * .08, 0, Math.PI * 2); ctx.fill();
      if (type === "airdefense") {
        ctx.beginPath(); ctx.moveTo(-size * .38, -size * .22); ctx.quadraticCurveTo(0, -size * .5, size * .38, -size * .22);
        ctx.lineTo(size * .3, size * .12); ctx.quadraticCurveTo(0, size * .45, -size * .3, size * .12); ctx.closePath(); ctx.stroke();
      }
    } else if (type === "satellite") {
      ctx.strokeRect(-size * .15, -size * .16, size * .3, size * .32);
      ctx.strokeRect(-size * .52, -size * .22, size * .25, size * .44);
      ctx.strokeRect(size * .27, -size * .22, size * .25, size * .44);
      ctx.beginPath(); ctx.moveTo(-size * .27, 0); ctx.lineTo(-size * .15, 0); ctx.moveTo(size * .15, 0); ctx.lineTo(size * .27, 0); ctx.stroke();
    } else if (type === "communications") {
      for (let radius = .18; radius <= .48; radius += .15) {
        ctx.beginPath(); ctx.arc(0, size * .2, size * radius, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(0, size * .2, size * .08, 0, Math.PI * 2); ctx.fill();
    } else if (type === "drone") {
      ctx.strokeRect(-size * .16, -size * .1, size * .32, size * .2);
      [[-.4,-.35],[.4,-.35],[-.4,.35],[.4,.35]].forEach(([dx, dy]) => {
        ctx.beginPath(); ctx.moveTo(dx * size * .45, dy * size * .45); ctx.lineTo(dx * size, dy * size); ctx.stroke();
        ctx.beginPath(); ctx.arc(dx * size, dy * size, size * .13, 0, Math.PI * 2); ctx.stroke();
      });
    } else if (type === "subsurface") {
      ctx.beginPath(); ctx.ellipse(0, size * .12, size * .48, size * .24, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-size * .08, -size * .12); ctx.lineTo(-size * .08, -size * .34); ctx.lineTo(size * .12, -size * .34); ctx.stroke();
    } else if (type === "longrange" || type === "energy") {
      ctx.beginPath(); ctx.moveTo(size * .08, -size * .5); ctx.lineTo(-size * .3, size * .05);
      ctx.lineTo(-size * .02, size * .05); ctx.lineTo(-size * .12, size * .5);
      ctx.lineTo(size * .34, -size * .12); ctx.lineTo(size * .08, -size * .12); ctx.closePath(); ctx.fill();
    } else if (type === "logistics") {
      ctx.strokeRect(-size * .5, -size * .2, size * .55, size * .42);
      ctx.beginPath(); ctx.moveTo(size * .05, -size * .08); ctx.lineTo(size * .32, -size * .08);
      ctx.lineTo(size * .48, size * .22); ctx.lineTo(size * .05, size * .22); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-size * .3, size * .32, size * .1, 0, Math.PI * 2);
      ctx.moveTo(size * .42, size * .32); ctx.arc(size * .32, size * .32, size * .1, 0, Math.PI * 2); ctx.stroke();
    } else if (type === "diplomacy") {
      roundedRectPath(ctx, -size * .46, -size * .32, size * .92, size * .58, size * .12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-size * .18, size * .25); ctx.lineTo(-size * .31, size * .48); ctx.lineTo(size * .02, size * .26); ctx.stroke();
      [-.22, 0, .22].forEach(dx => { ctx.beginPath(); ctx.arc(dx * size, -size * .03, size * .055, 0, Math.PI * 2); ctx.fill(); });
    } else if (type === "humanitarian") {
      ctx.fillRect(-size * .1, -size * .42, size * .2, size * .84);
      ctx.fillRect(-size * .42, -size * .1, size * .84, size * .2);
    } else if (type === "disperse") {
      [-.48, 0, .48].forEach((dx, index) => {
        ctx.beginPath(); ctx.moveTo(0, size * .36); ctx.lineTo(dx * size, -size * .28);
        ctx.lineTo(dx * size + (index === 0 ? .12 : -.12) * size, -size * .2); ctx.moveTo(dx * size, -size * .28);
        ctx.lineTo(dx * size + (index === 2 ? -.12 : .12) * size, -size * .15); ctx.stroke();
      });
    }
    ctx.restore();
  }

  function drawOperationEffect(ctx, action, x, y, elapsed) {
    const actor = OPERATION_ACTORS[action.actor];
    const pulse = .5 + .5 * Math.sin(elapsed / (action.primary ? 260 : 410) + action.itemIndex);
    ctx.save();
    ctx.strokeStyle = actor.color;
    ctx.globalAlpha = .18 + pulse * .35;
    ctx.lineWidth = action.primary ? 2 : 1;
    if (["satellite", "communications", "intelligence", "airdefense", "drone"].includes(action.type)) {
      for (let index = 1; index <= 3; index++) {
        ctx.beginPath(); ctx.arc(x, y, 10 + index * 9 + pulse * 5, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (action.type === "disperse") {
      for (let index = 0; index < 5; index++) {
        const angle = index * Math.PI * 2 / 5;
        ctx.beginPath(); ctx.arc(x + Math.cos(angle) * (15 + pulse * 10), y + Math.sin(angle) * (15 + pulse * 10), 2.5, 0, Math.PI * 2); ctx.fillStyle = actor.color; ctx.fill();
      }
    } else {
      ctx.beginPath(); ctx.arc(x, y, 13 + pulse * 12, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function drawOperationConflict(ctx, width, height, conflict, elapsed, index) {
    const anchor = OPERATION_ZONE_ANCHORS[conflict.zone] || OPERATION_ZONE_ANCHORS["Z-CW"];
    const x = anchor[0] * width;
    const y = anchor[1] * height;
    const phase = clamp((elapsed - 6200 - index * 220) / 1600, 0, 1);
    const flash = .5 + .5 * Math.sin(elapsed / 105 + index);
    const boxWidth = Math.min(width * .25, 180);
    const boxHeight = Math.min(height * .28, 120);
    ctx.save();
    ctx.strokeStyle = `rgba(255,${Math.round(128 + flash * 90)},64,${.4 + flash * .55})`;
    ctx.lineWidth = 2 + flash * 3;
    ctx.setLineDash([10, 5]);
    roundedRectPath(ctx, x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, 12);
    ctx.stroke();
    ctx.setLineDash([]);

    if (elapsed >= 7200 && elapsed <= 10300) {
      const burst = clamp((elapsed - 7200) / 900, 0, 1);
      for (let ray = 0; ray < 16; ray++) {
        const angle = ray * Math.PI * 2 / 16 + index * .17;
        const inner = 6 + burst * 8;
        const outer = 18 + burst * (22 + (ray % 3) * 6);
        ctx.strokeStyle = ray % 2 ? `rgba(255,214,74,${1 - burst * .45})` : `rgba(255,91,82,${1 - burst * .4})`;
        ctx.lineWidth = ray % 3 === 0 ? 3 : 1.5;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
        ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
        ctx.stroke();
      }
      ctx.fillStyle = `rgba(255,245,190,${.8 * flash})`;
      ctx.beginPath(); ctx.arc(x, y, 7 + flash * 10, 0, Math.PI * 2); ctx.fill();
    }
    if (elapsed >= 8200) {
      const smokeAge = clamp((elapsed - 8200) / 2500, 0, 1);
      for (let cloud = 0; cloud < 7; cloud++) {
        const angle = cloud * 2.17 + index;
        const distance = 6 + cloud * 3 + smokeAge * 14;
        ctx.fillStyle = `rgba(180,196,201,${.3 * (1 - smokeAge * .55)})`;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * distance, y - smokeAge * 18 + Math.sin(angle) * distance * .45, 7 + cloud * 1.2 + smokeAge * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = "rgba(255,232,184,.92)";
    ctx.font = `800 ${Math.max(9, width * .012)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`重大衝突 · ${zoneName(conflict.zone)}`, x, y - boxHeight / 2 - 8);
    ctx.restore();
  }

  function drawCanvasConflictFrame(ctx, width, height, elapsed, active) {
    const pulse = active ? .5 + .5 * Math.sin(elapsed / 125) : .35;
    ctx.save();
    ctx.strokeStyle = `rgba(255,${Math.round(120 + pulse * 105)},56,${.35 + pulse * .6})`;
    ctx.lineWidth = 2 + pulse * 4;
    ctx.shadowColor = "rgba(255,73,56,.85)";
    ctx.shadowBlur = active ? 12 + pulse * 20 : 8;
    roundedRectPath(ctx, 7, 7, width - 14, height - 14, 14);
    ctx.stroke();
    ctx.restore();
  }

  function drawOperationOutcome(ctx, width, height, scene, elapsed) {
    const fade = clamp((elapsed - (scene.duration - 2400)) / 600, 0, 1);
    const boxHeight = Math.min(76, height * .2);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = "rgba(3,17,27,.86)";
    roundedRectPath(ctx, width * .055, height - boxHeight - 16, width * .89, boxHeight, 10);
    ctx.fill();
    ctx.strokeStyle = scene.conflicts.length ? "rgba(255,177,74,.75)" : "rgba(105,190,224,.55)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#eef8fb";
    ctx.font = `800 ${Math.max(11, width * .015)}px sans-serif`;
    ctx.fillText(`第 ${scene.log.turn} 回合裁決`, width * .075, height - boxHeight + 8);
    ctx.font = `600 ${Math.max(9, width * .012)}px sans-serif`;
    drawCanvasWrappedText(ctx, scene.log.outcome, width * .075, height - boxHeight + 29, width * .82, Math.max(13, width * .017), 2);
    ctx.restore();
  }

  function drawCanvasWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const characters = [...String(text || "")];
    let line = "";
    let lineIndex = 0;
    characters.forEach((character, index) => {
      if (lineIndex >= maxLines) return;
      const candidate = line + character;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        ctx.fillText(line, x, y + lineIndex * lineHeight);
        lineIndex += 1;
        line = character;
      } else {
        line = candidate;
      }
      if (index === characters.length - 1 && lineIndex < maxLines) ctx.fillText(line, x, y + lineIndex * lineHeight);
    });
  }

  function roundedRectPath(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function renderOrderControls() {
    const zoneSelect = $("orderZone");
    if (!zoneSelect.options.length) {
      zoneSelect.innerHTML = DATA.zones
        .filter(z => z.zone_id !== "Z-REAR" || state.scenario.amberSupport !== "none")
        .map(z => `<option value="${z.zone_id}">${escapeHtml(z.zone_name)}</option>`).join("");
    }
    renderSupportActions();
    const finished = state.currentTurn > state.scenario.turns;
    [...$("orderForm").elements].forEach(el => el.disabled = finished);
    const actorSelect = $("orderActor");
    const amberOption = actorSelect.querySelector('option[value="AMBER"]');
    if (amberOption) amberOption.disabled = state.scenario.amberSupport === "none";
    const current = state.orders[state.currentTurn] || {};
    const nextActor = nextRequiredActor(current);
    if (!finished && state.scenario.turnOrderMode !== "simultaneous" && nextActor && actorSelect.value !== nextActor) {
      actorSelect.value = nextActor;
    }
    updateActionOptions();
    const selectedActor = actorSelect.value;
    const canSubmit = !finished && canActorSubmit(selectedActor, current);
    const submitButton = $("orderForm").querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = !canSubmit;
    $("orderSequenceHint").textContent = orderSequenceHint(current);
    $("resolveTurnBtn").disabled = finished;
  }

  function updateActionOptions() {
    const actor = $("orderActor").value;
    $("orderAction").innerHTML = ACTIONS[actor].map(([name]) => `<option>${escapeHtml(name)}</option>`).join("");
    renderSupportActions();
    if (state.scenario) {
      const current = state.orders[state.currentTurn] || {};
      const submitButton = $("orderForm").querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = state.currentTurn > state.scenario.turns || !canActorSubmit(actor, current);
      $("orderSequenceHint").textContent = orderSequenceHint(current);
    }
  }

  function activeOrderActors() {
    return state.scenario?.amberSupport === "none" ? ["BLUE", "RED"] : ["BLUE", "RED", "AMBER"];
  }

  function turnOrderSequence() {
    const actors = activeOrderActors();
    if (state.scenario?.turnOrderMode === "simultaneous") return actors;
    const first = state.scenario?.turnOrderMode === "red_first" || state.currentTurn % 2 === 1 ? "RED" : "BLUE";
    const second = first === "RED" ? "BLUE" : "RED";
    return [first, second, ...actors.filter(actor => actor === "AMBER")];
  }

  function nextRequiredActor(current = state.orders[state.currentTurn] || {}) {
    return turnOrderSequence().find(actor => !current[actor]) || null;
  }

  function canActorSubmit(actor, current = state.orders[state.currentTurn] || {}) {
    if (!activeOrderActors().includes(actor)) return false;
    if (state.scenario?.turnOrderMode === "simultaneous") return true;
    return actor === nextRequiredActor(current);
  }

  function orderVisibleBeforeResolution(actor) {
    if (!state.scenario || state.scenario.turnOrderMode === "simultaneous") return false;
    return state.scenario.firstOrderVisibility === "public" && actor === turnOrderSequence()[0];
  }

  function orderSequenceHint(current = state.orders[state.currentTurn] || {}) {
    if (!state.scenario) return "";
    if (state.scenario.turnOrderMode === "simultaneous") {
      return "同時密封提交：各方可依任意順序提交，命令內容於結算前不公開。";
    }
    const sequence = turnOrderSequence();
    const next = nextRequiredActor(current);
    const visibility = state.scenario.firstOrderVisibility === "public" ? "先手命令公開給後手" : "先手命令保持密封";
    return `${actorLabel(sequence[0])}先行；${visibility}。${next ? `目前輪到${actorLabel(next)}。` : "本回合命令均已提交。"}`;
  }

  function riskLabel(value) {
    return ({ low: "低", medium: "中", high: "高" }[value] || "中");
  }

  function defaultOrderItem(actor, primary = false) {
    return {
      action: ACTIONS[actor][0][0],
      zone: "Z-CW",
      resource: primary ? 20 : 5,
      priority: primary ? 4 : 3,
      condition: "情勢未出現重大惡化",
      risk: "medium"
    };
  }

  // Retain compatibility with saved single-action orders and older JSON exports.
  function orderPrimary(order) {
    return order?.primary || {
      action: order?.action || "未指定行動", zone: order?.zone || "Z-CW",
      resource: Number(order?.resource) || 0, priority: 4,
      condition: "舊版命令未記錄條件", risk: "medium"
    };
  }

  function orderSupports(order) {
    return Array.isArray(order?.supports) ? order.supports : [];
  }

  function orderItems(order) {
    return order ? [orderPrimary(order), ...orderSupports(order)] : [];
  }

  function orderTotalResource(order) {
    return orderItems(order).reduce((total, item) => total + (Number(item.resource) || 0), 0);
  }

  function supportActionMarkup(actor, item, index, disabled) {
    const actions = ACTIONS[actor].map(([name]) => `<option value="${escapeAttr(name)}" ${name === item.action ? "selected" : ""}>${escapeHtml(name)}</option>`).join("");
    const zones = DATA.zones.filter(z => z.zone_id !== "Z-REAR" || state.scenario.amberSupport !== "none")
      .map(z => `<option value="${z.zone_id}" ${z.zone_id === item.zone ? "selected" : ""}>${escapeHtml(z.zone_name)}</option>`).join("");
    return `<fieldset class="support-action" data-support-index="${index}" ${disabled ? "disabled" : ""}>
      <legend>支援行動 ${index + 1}</legend>
      <label>行動<select class="support-action-name">${actions}</select></label>
      <label>區域<select class="support-action-zone">${zones}</select></label>
      <label>資源點數<input class="support-action-resource" type="number" min="3" max="25" value="${item.resource}"></label>
      <label>優先級<select class="support-action-priority">${[5,4,3,2,1].map(value => `<option value="${value}" ${Number(item.priority) === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
      <label>風險<select class="support-action-risk"><option value="low" ${item.risk === "low" ? "selected" : ""}>低</option><option value="medium" ${item.risk === "medium" ? "selected" : ""}>中</option><option value="high" ${item.risk === "high" ? "selected" : ""}>高</option></select></label>
      <label class="support-condition">條件<input class="support-action-condition" maxlength="100" value="${escapeAttr(item.condition || "情勢未出現重大惡化")}"></label>
      <button type="button" class="danger remove-support-action" ${index < MIN_SUPPORT_ACTIONS ? "disabled title=\"至少需兩項支援行動\"" : ""}>移除</button>
    </fieldset>`;
  }

  function renderSupportActions() {
    const host = $("supportActionsList");
    if (!host || !state.scenario) return;
    const actor = $("orderActor").value;
    const finished = state.currentTurn > state.scenario.turns;
    let draft = host._draft;
    if (!draft || draft.actor !== actor) {
      draft = { actor, supports: Array.from({ length: MIN_SUPPORT_ACTIONS }, () => defaultOrderItem(actor)) };
      host._draft = draft;
    }
    host.innerHTML = draft.supports.map((item, index) => supportActionMarkup(actor, item, index, finished)).join("");
    $("addSupportActionBtn").disabled = finished || draft.supports.length >= MAX_SUPPORT_ACTIONS;
    updateOrderBudget();
  }

  function readSupportActions() {
    return [...document.querySelectorAll("#supportActionsList .support-action")].map(row => ({
      action: row.querySelector(".support-action-name").value,
      zone: row.querySelector(".support-action-zone").value,
      resource: Number(row.querySelector(".support-action-resource").value) || 0,
      priority: Number(row.querySelector(".support-action-priority").value) || 3,
      condition: row.querySelector(".support-action-condition").value.trim(),
      risk: row.querySelector(".support-action-risk").value
    }));
  }

  function updateOrderBudget() {
    const status = $("orderBudgetStatus");
    if (!status) return;
    const primary = Number($("orderResource").value) || 0;
    const supportTotal = readSupportActions().reduce((sum, item) => sum + item.resource, 0);
    const total = primary + supportTotal;
    const remaining = ORDER_BUDGET - total;
    status.classList.toggle("budget-over", remaining < 0);
    status.textContent = `本命令包：主行動 ${primary} 點＋支援 ${supportTotal} 點＝${total}/${ORDER_BUDGET} 點；${remaining >= 0 ? `尚餘 ${remaining} 點` : `超出 ${Math.abs(remaining)} 點，無法提交`}。`;
  }

  function renderCurrentOrders() {
    const current = state.orders[state.currentTurn] || {};
    const orderList = $("currentOrders");
    const values = Object.values(current);
    if (!values.length) {
      orderList.innerHTML = `<p class="muted">本回合尚未提交命令。</p>`;
      return;
    }
    orderList.innerHTML = values.map(order => {
      if (!orderVisibleBeforeResolution(order.actor)) {
        return `<div class="order-item ${order.actor}"><strong>${actorLabel(order.actor)}：命令已密封提交</strong><div>內容將於本回合結算後揭露。</div></div>`;
      }
      const primary = orderPrimary(order);
      const supports = orderSupports(order);
      return `<div class="order-item ${order.actor}">
        <strong>${actorLabel(order.actor)}：主行動 ${escapeHtml(primary.action)}</strong>
        <div>${zoneName(primary.zone)} · ${primary.resource}/${ORDER_BUDGET} 點 · 優先 ${primary.priority} · 風險 ${riskLabel(primary.risk)}${order.aiGenerated ? " · AI建議" : ""}</div>
        <div class="order-support-summary">支援：${supports.map(item => `${escapeHtml(item.action)}（${item.resource}點／優先${item.priority}／${riskLabel(item.risk)}）`).join("；") || "無（舊版紀錄）"}</div>
        <small>合計 ${orderTotalResource(order)}/${ORDER_BUDGET} 點 · 條件：${escapeHtml(primary.condition || "未填寫")} · ${escapeHtml(order.rationale || "未填寫理由")}</small>
      </div>`;
    }).join("");
  }

  function currentIntel() {
    if (!state.scenario) return [];
    return state.scenario.intel.filter(i => Number(i.turn) === state.currentTurn);
  }

  function weatherForTurn(turn) {
    if (!state.scenario) return [];
    const baseTurn = ((Number(turn) - 1) % 12) + 1;
    const rows = DATA.weather.filter(w => Number(w.turn) === baseTurn);
    const modifier = state.scenario.weatherPreset === "adverse" ? 1 :
      state.scenario.weatherPreset === "stable" ? -1 : 0;
    return rows.map(w => ({
      ...w,
      sea_state_1_5: clamp(Number(w.sea_state_1_5) + modifier, 1, 5),
      visibility_1_5: clamp(Number(w.visibility_1_5) - modifier, 1, 5)
    }));
  }

  function currentWeather() {
    return weatherForTurn(state.currentTurn);
  }

  function currentEvents() {
    if (!state.scenario) return [];
    return state.scenario.events.filter(event => Number(event.trigger_turn) === state.currentTurn);
  }

  function renderTurnPanels() {
    const intel = currentIntel();
    $("intelPanel").innerHTML = intel.length ? intel.map(i => `
      <div class="turn-log">
        <strong>${escapeHtml(i.report_type)} · ${zoneName(i.zone_id)}</strong>
        <p>${escapeHtml(i.report_text)}</p>
        <small>來源 ${escapeHtml(i.source_reliability)} · 信心 ${i.confidence_pct}%</small>
      </div>`).join("") : `<p class="muted">本回合沒有新增情報；需判斷資訊缺口。</p>`;

    const weather = currentWeather();
    const worst = [...weather].sort((a, b) => Number(b.sea_state_1_5) - Number(a.sea_state_1_5))[0];
    $("weatherPanel").innerHTML = worst ? `
      <p><strong>${zoneName(worst.zone_id)}</strong>環境最不利。</p>
      <ul class="compact-list">
        <li>海象：${worst.sea_state_1_5}/5</li>
        <li>能見度：${worst.visibility_1_5}/5</li>
        <li>風速：約 ${worst.wind_kts} 節（合成）</li>
        <li>降水機率：${worst.precip_probability_pct}%（合成）</li>
      </ul>` : `<p class="muted">無資料。</p>`;

    const events = currentEvents();
    const eventList = events.length ? events.map(event => `
      <div class="turn-log">
        <strong>${escapeHtml(event.event_name)}</strong>
        <p>${escapeHtml(event.description)}</p>
        <small>${escapeHtml(event.category)} · ${zoneName(event.zone_id)}${event.whiteInjected ? " · 白方臨時發布" : ""}</small>
      </div>`).join("") : `<p class="muted">本回合沒有預排事件。</p>`;
    const zones = DATA.zones
      .filter(zone => zone.zone_id !== "Z-REAR" || state.scenario.amberSupport !== "none")
      .map(zone => `<option value="${zone.zone_id}">${escapeHtml(zone.zone_name)}</option>`).join("");
    const finished = state.currentTurn > state.scenario.turns;
    $("eventPanel").innerHTML = `${eventList}
      <form id="whiteEventForm" class="white-event-form">
        <h4>白方臨時導調事件</h4>
        <label>事件名稱<input id="whiteEventName" required maxlength="80" placeholder="例如：民間通訊壅塞" ${finished ? "disabled" : ""}></label>
        <label>類別
          <select id="whiteEventCategory" ${finished ? "disabled" : ""}>
            <option>民事</option><option>情報</option><option>氣象</option><option>後勤</option><option>外交</option><option>指管</option><option>資訊</option><option>其他</option>
          </select>
        </label>
        <label>影響區域<select id="whiteEventZone" ${finished ? "disabled" : ""}>${zones}</select></label>
        <label>導調說明<textarea id="whiteEventDescription" required maxlength="300" rows="3" placeholder="說明白方發布的情境變化與應注意事項。" ${finished ? "disabled" : ""}></textarea></label>
        <button type="submit" class="secondary" ${finished ? "disabled" : ""}>立即發布本回合事件</button>
      </form>`;
  }

  function publishWhiteEvent(event) {
    event.preventDefault();
    if (!state.scenario || state.currentTurn > state.scenario.turns) return;
    const name = $("whiteEventName").value.trim();
    const description = $("whiteEventDescription").value.trim();
    const zone = $("whiteEventZone").value;
    if (!name || !description || !DATA.zones.some(item => item.zone_id === zone)) return;
    state.scenario.events.push({
      event_id: `WHITE-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      trigger_turn: state.currentTurn,
      event_name: name.slice(0, 80),
      category: $("whiteEventCategory").value,
      zone_id: zone,
      affected_actor: "WHITE",
      description: description.slice(0, 300),
      whiteInjected: true,
      publishedAt: new Date().toISOString()
    });
    saveState(false);
    renderSimulation();
    toast("白方臨時事件已發布並納入本回合。");
  }

  function submitOrder(event) {
    event.preventDefault();
    if (!state.scenario || state.currentTurn > state.scenario.turns) return;
    const actor = $("orderActor").value;
    const current = state.orders[state.currentTurn] || {};
    if (!canActorSubmit(actor, current)) {
      const next = nextRequiredActor(current);
      toast(next ? `目前應由${actorLabel(next)}先提交命令。` : "本回合命令均已提交。");
      return;
    }
    if (actor === "AMBER" && state.scenario.amberSupport === "none") {
      toast("本想定未納入美軍支援。");
      return;
    }
    const primary = {
      action: $("orderAction").value,
      zone: $("orderZone").value,
      resource: Number($("orderResource").value) || 0,
      priority: Number($("orderPriority").value) || 4,
      condition: $("orderCondition").value.trim(),
      risk: $("orderRisk").value
    };
    const supports = readSupportActions();
    const total = primary.resource + supports.reduce((sum, item) => sum + item.resource, 0);
    const validItems = [primary, ...supports].every((item, index) => ACTIONS[actor].some(([name]) => name === item.action)
      && DATA.zones.some(zone => zone.zone_id === item.zone)
      && Number.isInteger(item.resource) && item.resource >= (index === 0 ? 10 : 3) && item.resource <= (index === 0 ? ORDER_BUDGET : 25)
      && item.priority >= 1 && item.priority <= 5 && item.condition && ["low", "medium", "high"].includes(item.risk));
    if (supports.length < MIN_SUPPORT_ACTIONS || supports.length > MAX_SUPPORT_ACTIONS || !validItems || total > ORDER_BUDGET) {
      toast(`命令包須有 1 項主行動、${MIN_SUPPORT_ACTIONS}–${MAX_SUPPORT_ACTIONS} 項支援行動；每項需完整填寫，且合計不得超過 ${ORDER_BUDGET} 點。`);
      return;
    }
    const order = {
      actor, primary, supports, resourceBudget: ORDER_BUDGET,
      rationale: $("orderRationale").value.trim(), submittedAt: new Date().toISOString()
    };
    state.orders[state.currentTurn] ||= {};
    state.orders[state.currentTurn][actor] = order;
    const nextActor = nextRequiredActor(state.orders[state.currentTurn]);
    if (state.scenario.turnOrderMode !== "simultaneous" && nextActor) $("orderActor").value = nextActor;
    $("orderRationale").value = "";
    $("supportActionsList")._draft = null;
    saveState(false);
    renderSimulation();
    toast(`${actorLabel(actor)}命令已提交。`);
  }

  function fallbackAutoFill(missingActors) {
    const rng = mulberry32(state.scenario.seed + state.currentTurn * 991);
    missingActors.forEach(actor => {
      const pickItem = (resource, priority) => ({
        action: pick(ACTIONS[actor], rng)[0],
        zone: pick(DATA.zones.filter(z => z.zone_id !== "Z-REAR" || actor === "AMBER"), rng).zone_id,
        resource, priority, condition: "情勢未出現重大惡化", risk: "medium"
      });
      state.orders[state.currentTurn][actor] = {
        actor, primary: pickItem(Math.round(14 + rng() * 5), 4),
        supports: [pickItem(Math.round(4 + rng() * 3), 3), pickItem(Math.round(4 + rng() * 3), 2)],
        resourceBudget: ORDER_BUDGET,
        rationale: "本機合成規則：依本回合的合成態勢補齊代表性行動。",
        submittedAt: new Date().toISOString()
      };
    });
  }

  function autoOrderPrompt(missingActors) {
    const availableActions = Object.fromEntries(missingActors.map(actor => [actor, ACTIONS[actor].map(([name]) => name)]));
    const zones = DATA.zones.filter(z => z.zone_id !== "Z-REAR" || missingActors.includes("AMBER")).map(z => ({ id: z.zone_id, name: z.zone_name, domain: z.domain }));
    const events = currentEvents();
    const weather = currentWeather().map(w => ({ zone: w.zone_id, sea: w.sea_state_1_5, visibility: w.visibility_1_5 }));
    return `你是兵推回合助理。只能使用下列完全合成、虛構的模擬資料；不得補入真實部隊、武器型號、座標、部署、射程、目標或可執行的現實作戰建議。\n\n請只回傳嚴格 JSON：{"orders":[{"actor":"BLUE|RED|AMBER","primary":{"action":"允許動作之一","zone":"允許區域之一","resource":10到35的整數,"priority":1到5,"condition":"繁體中文、100字內","risk":"low|medium|high"},"supports":[{"action":"允許動作之一","zone":"允許區域之一","resource":3到25的整數,"priority":1到5,"condition":"繁體中文、100字內","risk":"low|medium|high"},{"action":"...第二項支援行動"}],"rationale":"繁體中文、80字內"}]}。每個角色恰有 1 個主行動與 2–4 個支援行動，所有行動 resource 合計不得超過 ${ORDER_BUDGET}。\n\n必須補齊的角色：${JSON.stringify(missingActors)}\n允許動作：${JSON.stringify(availableActions)}\n允許區域：${JSON.stringify(zones)}\n當前狀態：${JSON.stringify({ turn: state.currentTurn, turnOrderMode: state.scenario.turnOrderMode, firstOrderVisibility: state.scenario.firstOrderVisibility, status: state.status, abstractResources: state.scenario.inventoryEnabled ? sanitizedAbstractSummary(state.scenario.abstractResources) : null, syntheticLegacyResources: state.scenario.inventoryEnabled ? null : state.scenario.resources, strategicParameters: state.scenario.strategicParameters, currentOrders: state.orders[state.currentTurn], events: events.map(event => ({ name: event.event_name, category: event.category, zone: event.zone_id, description: event.description })), weather })}`;
  }

  function applyAiOrders(result, missingActors) {
    const rows = Array.isArray(result?.orders) ? result.orders : [];
    const allowedZones = new Set(DATA.zones.filter(z => z.zone_id !== "Z-REAR" || missingActors.includes("AMBER")).map(z => z.zone_id));
    const accepted = new Set();
    rows.forEach(row => {
      const actor = String(row?.actor || "");
      const primary = row?.primary;
      const supports = Array.isArray(row?.supports) ? row.supports : [];
      const validItem = (item, min) => item && ACTIONS[actor].some(([name]) => name === item.action) && allowedZones.has(item.zone)
        && Number.isInteger(Number(item.resource)) && Number(item.resource) >= min && Number(item.priority) >= 1 && Number(item.priority) <= 5
        && String(item.condition || "").trim() && ["low", "medium", "high"].includes(item.risk);
      const total = [primary, ...supports].reduce((sum, item) => sum + Number(item?.resource || 0), 0);
      if (!missingActors.includes(actor) || accepted.has(actor) || !validItem(primary, 10) || supports.length < MIN_SUPPORT_ACTIONS || supports.length > MAX_SUPPORT_ACTIONS || !supports.every(item => validItem(item, 3)) || total > ORDER_BUDGET) return;
      state.orders[state.currentTurn][actor] = {
        actor,
        primary: { ...primary, resource: Math.round(Number(primary.resource)), priority: Math.round(Number(primary.priority)), condition: String(primary.condition).trim().slice(0, 100) },
        supports: supports.map(item => ({ ...item, resource: Math.round(Number(item.resource)), priority: Math.round(Number(item.priority)), condition: String(item.condition).trim().slice(0, 100) })),
        resourceBudget: ORDER_BUDGET,
        rationale: String(row.rationale || "AI 未提供理由。").replace(/[\r\n]+/g, " ").slice(0, 180),
        aiGenerated: true, submittedAt: new Date().toISOString()
      };
      accepted.add(actor);
    });
    return missingActors.filter(actor => !accepted.has(actor));
  }

  async function autoFillOrders() {
    if (!state.scenario) return;
    state.orders[state.currentTurn] ||= {};
    const actors = state.scenario.amberSupport === "none" ? ["BLUE", "RED"] : ["BLUE", "RED", "AMBER"];
    let missingActors = actors.filter(actor => !state.orders[state.currentTurn][actor]);
    if (!missingActors.length) return toast("所有角色本回合都已有命令。");
    const apiKey = $("llmApiKey").value.trim();
    let aiUsed = false;
    if (apiKey) {
      const initialMissing = missingActors.length;
      const button = $("autoOrdersBtn");
      button.disabled = true;
      try {
        const provider = $("llmProvider").value;
        const result = extractJson(await requestLlm(provider, $("llmModel").value.trim(), apiKey, autoOrderPrompt(missingActors), $("llmReasoning").value));
        missingActors = applyAiOrders(result, missingActors);
        aiUsed = missingActors.length < initialMissing;
      } catch (error) {
        toast(`AI 補齊失敗，改用本機合成規則：${error.message}`);
      } finally { button.disabled = false; }
    }
    if (missingActors.length) fallbackAutoFill(missingActors);
    saveState(false);
    renderSimulation();
    toast(aiUsed ? "已由 AI 依當前狀態補齊命令與理由。" : "已以本機合成規則補齊尚未提交的角色命令。");
  }

  function actionEffect(actor, actionName) {
    return ACTIONS[actor].find(([name]) => name === actionName)?.[1] || {};
  }

  function orderScore(order, status, rng) {
    if (!order) return 0;
    const items = orderItems(order);
    const effort = items.reduce((sum, item, index) => {
      const roleWeight = index === 0 ? 1 : 0.58;
      const priorityWeight = 0.8 + Number(item.priority || 3) * 0.08;
      const riskWeight = item.risk === "high" ? 1.06 : item.risk === "low" ? 0.96 : 1;
      return sum + Math.sqrt(item.resource) * 2.3 * roleWeight * priorityWeight * riskWeight;
    }, 0);
    const readiness = status.readiness * 0.22;
    const command = status.command * 0.16;
    const sustain = status.sustainment * 0.12;
    const riskBonus = orderTotalResource(order) > 25 ? 4 : 0;
    const resourceModifier = state.scenario?.resourceBalance?.[order.actor.toLowerCase()] || 0;
    return effort + readiness + command + sustain + riskBonus + resourceModifier + (rng() - 0.5) * 14;
  }

  function applyOwnAction(actor, order) {
    if (!order) return;
    const status = state.status[actor];
    orderItems(order).forEach((item, index) => {
      const effect = actionEffect(actor, item.action);
      const roleWeight = index === 0 ? 1 : 0.58;
      const priorityWeight = 0.8 + Number(item.priority || 3) * 0.08;
      const scale = (item.resource / 20) * roleWeight * priorityWeight;
      status.readiness = clamp(status.readiness + (effect.readiness || 0) * scale);
      status.sustainment = clamp(status.sustainment + (effect.sustainment || 0) * scale);
      status.command = clamp(status.command + (effect.command || 0) * scale);
      status.intel = clamp(status.intel + (effect.intel || 0) * scale);
      if (actor === "BLUE" || actor === "RED") {
        state.status.BLUE.civilianRisk = clamp(state.status.BLUE.civilianRisk + (effect.civilian || 0) * scale);
      }
    });
    if (!state.scenario.inventoryEnabled) {
      status.resources = clamp(status.resources - orderTotalResource(order) * 0.72);
    }
  }

  function applyEvent(event) {
    if (!event) return;
    const affected = event.affected_actor === "ALL"
      ? ["BLUE", "RED", ...(state.scenario.amberSupport === "none" ? [] : ["AMBER"])]
      : [event.affected_actor].filter(id => state.status[id]);

    affected.forEach(actor => {
      state.status[actor].readiness = clamp(state.status[actor].readiness + Number(event.readiness_delta || 0));
      state.status[actor].sustainment = clamp(state.status[actor].sustainment + Number(event.sustainment_delta || 0));
      state.status[actor].command = clamp(state.status[actor].command + Number(event.command_delta || 0));
    });
    state.status.BLUE.civilianRisk = clamp(state.status.BLUE.civilianRisk + Number(event.civilian_risk_delta || 0));
  }

  function applyStrategicPressure() {
    const parameters = { ...STRATEGIC_DEFAULTS, ...(state.scenario.strategicParameters || {}) };
    const elapsedDays = state.currentTurn * state.scenario.hoursPerTurn / 24;
    const energyDays = Number(parameters.energyReserveDays);
    const powerFloor = Number(parameters.residualPowerPct);
    if (energyDays > 0 && elapsedDays > energyDays * 0.6) {
      const decline = clamp((elapsedDays - energyDays * 0.6) / Math.max(0.1, energyDays * 0.4), 0, 1);
      state.status.BLUE.powerAvailability = round1(100 - (100 - powerFloor) * decline);
      const powerPenalty = (100 - state.status.BLUE.powerAvailability) / 100;
      state.status.BLUE.sustainment = clamp(state.status.BLUE.sustainment - powerPenalty * 3.5);
      state.status.BLUE.readiness = clamp(state.status.BLUE.readiness - powerPenalty * 2);
    }

    const precisionDays = Number(parameters.precisionStockpileDays);
    if (precisionDays > 0 && state.scenario.amberSupport !== "none") {
      state.status.AMBER.precisionStockpile = round1(clamp(100 * (1 - elapsedDays / precisionDays), 0, 100));
      if (state.status.AMBER.precisionStockpile <= 25) {
        state.status.AMBER.readiness = clamp(state.status.AMBER.readiness - 1.2);
        state.status.AMBER.sustainment = clamp(state.status.AMBER.sustainment - 1);
      }
    }

    const economicShock = Number(parameters.globalEconomicShock) - 1;
    if (economicShock > 0) {
      state.status.BLUE.civilianRisk = clamp(state.status.BLUE.civilianRisk + economicShock * 0.55);
      state.status.BLUE.sustainment = clamp(state.status.BLUE.sustainment - economicShock * 0.35);
      if (state.scenario.amberSupport !== "none") {
        state.status.AMBER.sustainment = clamp(state.status.AMBER.sustainment - economicShock * 0.18);
      }
    }
  }

  function inventoryCategoryForAction(action) {
    const type = operationType(action).type;
    return ({
      aviation: "aviation",
      airdefense: "airDefense",
      longrange: "longRange",
      maritime: "maritime",
      convoy: "maritime",
      subsurface: "subsurface",
      drone: "isr",
      intelligence: "isr",
      satellite: "communications",
      communications: "communications",
      logistics: "logistics",
      humanitarian: "logistics",
      energy: "energy",
      diplomacy: "communications",
      disperse: "logistics"
    }[type] || "logistics");
  }

  function applyDetailedInventoryTurn(orders, events) {
    if (!state.scenario.inventoryEnabled) return null;
    const previousAbstract = state.scenario.abstractResources;
    const rows = state.scenario.detailedInventory.map(sanitizeInventoryRow);
    const entries = rows.map(row => ({
      id: row.id, actor: row.actor, alias: row.alias, category: row.category,
      opening: round1(row.current), recovery: 0, replenishment: 0,
      actionConsumption: 0, eventLoss: 0, closing: 0
    }));
    const entryById = new Map(entries.map(entry => [entry.id, entry]));

    rows.forEach(row => {
      const entry = entryById.get(row.id);
      const recovered = Math.min(row.recovery, Math.max(0, row.nominal - row.current));
      row.current += recovered;
      entry.recovery = round1(recovered);
      if (!row.replenishmentApplied && row.replenishment > 0 && state.currentTurn > row.delay) {
        row.current += row.replenishment;
        row.replenishmentApplied = true;
        entry.replenishment = round1(row.replenishment);
      }
    });

    const spend = (actor, category, demand, field, protectReserve) => {
      const matching = rows.filter(row => row.actor === actor && row.category === category);
      if (!matching.length || demand <= 0) return 0;
      const capacities = matching.map(row => protectReserve
        ? Math.max(0, row.current - row.nominal * row.reserve / 100)
        : Math.max(0, row.current));
      let remaining = Math.min(demand, capacities.reduce((sum, value) => sum + value, 0));
      let spent = 0;
      matching.forEach((row, index) => {
        const capacityTotal = capacities.reduce((sum, value) => sum + value, 0);
        const target = index === matching.length - 1
          ? remaining
          : Math.min(remaining, demand * (capacityTotal ? capacities[index] / capacityTotal : 0));
        const used = Math.min(capacities[index], target);
        row.current = Math.max(0, row.current - used);
        entryById.get(row.id)[field] += used;
        remaining -= used;
        spent += used;
      });
      return spent;
    };

    Object.entries(orders).forEach(([actor, order]) => {
      orderItems(order).forEach((item, index) => {
        const category = inventoryCategoryForAction(item.action);
        const matching = rows.filter(row => row.actor === actor && row.category === category);
        const baseConsumption = matching.length
          ? matching.reduce((sum, row) => sum + row.consumption, 0) / matching.length
          : 0;
        const roleWeight = index === 0 ? 1 : .58;
        const demand = baseConsumption * Math.max(.35, Number(item.resource || 0) / 20) * roleWeight;
        spend(actor, category, demand, "actionConsumption", true);
      });
    });

    events.forEach(event => {
      const affected = event.affected_actor === "ALL"
        ? ["BLUE", "RED", ...(state.scenario.amberSupport === "none" ? [] : ["AMBER"])]
        : [event.affected_actor].filter(actor => ["BLUE", "RED", "AMBER"].includes(actor));
      const category = inventoryCategoryForAction(`${event.category || ""} ${event.event_name || ""} ${event.description || ""}`);
      const severity = Math.abs(Number(event.readiness_delta || 0)) + Math.abs(Number(event.sustainment_delta || 0)) + Math.abs(Number(event.command_delta || 0));
      affected.forEach(actor => {
        const matching = rows.filter(row => row.actor === actor && row.category === category);
        const baseConsumption = matching.length
          ? matching.reduce((sum, row) => sum + row.consumption, 0) / matching.length
          : 0;
        spend(actor, category, baseConsumption * severity / 25, "eventLoss", false);
      });
    });

    rows.forEach(row => {
      row.current = round1(row.current);
      const entry = entryById.get(row.id);
      entry.actionConsumption = round1(entry.actionConsumption);
      entry.eventLoss = round1(entry.eventLoss);
      entry.closing = row.current;
    });

    const abstractAfter = calculateAbstractInventory(rows, previousAbstract);
    state.scenario.detailedInventory = rows;
    state.scenario.abstractResources = abstractAfter;
    state.scenario.resourceBalance = calculateCombinedResourceBalance(state.scenario.resources, abstractAfter);
    ["BLUE", "RED", "AMBER"].forEach(actor => {
      if (state.status[actor]) state.status[actor].resources = abstractAfter.byActor[actor].overall;
    });
    const ledger = {
      turn: state.currentTurn,
      entries,
      abstractBefore: previousAbstract,
      abstractAfter,
      totals: {
        consumed: round1(entries.reduce((sum, entry) => sum + entry.actionConsumption, 0)),
        eventLoss: round1(entries.reduce((sum, entry) => sum + entry.eventLoss, 0)),
        recovered: round1(entries.reduce((sum, entry) => sum + entry.recovery, 0)),
        replenished: round1(entries.reduce((sum, entry) => sum + entry.replenishment, 0))
      }
    };
    state.scenario.resourceLedger.push(ledger);
    return ledger;
  }

  function sanitizedAbstractSummary(abstractResources) {
    const summary = {};
    ["BLUE", "RED", "AMBER"].forEach(actor => {
      const entry = abstractResources?.byActor?.[actor];
      summary[actor] = {
        overall: round1(entry?.overall || 0),
        categories: Object.fromEntries(Object.entries(entry?.categories || {}).map(([category, value]) => [
          category,
          { score: round1(value.score), trend: round1(value.trend || 0) }
        ]))
      };
    });
    return summary;
  }

  function fallbackNextTurnPackage(log, nextTurn) {
    const summary = sanitizedAbstractSummary(log.abstractResourcesAfter);
    const pressures = [];
    Object.entries(summary).forEach(([actor, actorData]) => {
      Object.entries(actorData.categories).forEach(([category, value]) => {
        if (value.score < 60 || value.trend < -3) {
          pressures.push({
            actor,
            category,
            score: value.score,
            trend: value.trend,
            text: `${actorLabel(actor)}的${INVENTORY_CATEGORIES[category]}為 ${value.score}，本回合變化 ${value.trend >= 0 ? "+" : ""}${value.trend}。`
          });
        }
      });
    });
    pressures.sort((a, b) => a.score - b.score || a.trend - b.trend);
    const focal = pressures[0];
    const zone = orderPrimary(log.orders.BLUE)?.zone || orderPrimary(log.orders.RED)?.zone || "Z-ISL";
    const headline = nextTurn > state.scenario.turns
      ? "推演結束：轉入事後檢討"
      : focal ? `${actorLabel(focal.actor)}的${INVENTORY_CATEGORIES[focal.category]}形成下一回合壓力`
        : "各方資源仍可支應，但需留意累積消耗";
    return {
      turn: nextTurn,
      headline,
      summary: nextTurn > state.scenario.turns
        ? "已完成最後一回合，不再注入新事件；請檢視資源帳本與決策取捨。"
        : "依固定規則比較本回合結算後的抽象資源、趨勢與保留水準，形成下一回合導調重點。",
      resourcePressures: pressures.slice(0, 5),
      intelUpdates: nextTurn > state.scenario.turns ? [] : [{
        type: "資源態勢",
        zone,
        confidence: 72,
        text: focal
          ? `匿名化彙整顯示${actorLabel(focal.actor)}的${INVENTORY_CATEGORIES[focal.category]}承受持續壓力；實際原因仍需多源確認。`
          : "匿名化彙整未顯示單一資源類別立即失衡，但累積消耗仍可能縮小後續選項。"
      }],
      candidateEvents: nextTurn > state.scenario.turns ? [] : [{
        name: focal ? `${INVENTORY_CATEGORIES[focal.category]}調度壓力` : "跨域資源協調壓力",
        category: focal ? INVENTORY_CATEGORIES[focal.category] : "後勤",
        zone,
        severity: focal && focal.score < 35 ? "high" : "medium",
        description: "各方需在維持當前任務、補充恢復與保留後續彈性之間重新排序。"
      }],
      decisionDilemmas: nextTurn > state.scenario.turns ? ["哪些投入真正改善目標，哪些只增加了短期消耗？"] : [
        "應優先維持當前任務，或降低強度以保存後續回合資源？",
        "哪些情報缺口若未補足，會使資源配置建立在錯誤信心上？",
        "如何在任務效果、民事風險與升級控制之間設定可檢驗的停損條件？"
      ],
      generatedBy: "RULE_ENGINE",
      privacy: "SANITIZED_AGGREGATE_ONLY"
    };
  }

  function nextTurnPackagePrompt(log, fallback) {
    const abstractSummary = sanitizedAbstractSummary(log.abstractResourcesAfter);
    const orderSummary = Object.fromEntries(Object.entries(log.orders).map(([actor, order]) => [
      actor,
      orderItems(order).map(item => ({
        category: inventoryCategoryForAction(item.action),
        zone: item.zone,
        effortBand: item.resource >= 20 ? "high" : item.resource >= 10 ? "medium" : "low"
      }))
    ]));
    return `你是教育兵推的次回合想定編輯器。只能使用下列完全合成且已匿名化的 0–100 摘要。不得推測或補入真實武器名稱、數量、單位、座標、部署、性能、射程、目標或作戰程序。不得改寫任何數值或直接裁決損失；數值已由規則引擎結算。

只回傳嚴格 JSON：
{"headline":"60字內","summary":"180字內","resourcePressures":[{"actor":"BLUE|RED|AMBER","category":"允許類別","score":0到100,"trend":-100到100,"text":"100字內"}],"intelUpdates":[{"type":"50字內","zone":"允許區域","confidence":35到95,"text":"160字內，標示不確定性"}],"candidateEvents":[{"name":"60字內","category":"50字內","zone":"允許區域","severity":"low|medium|high","description":"160字內"}],"decisionDilemmas":["3項，每項120字內"]}

允許類別：${JSON.stringify(Object.keys(INVENTORY_CATEGORIES))}
允許區域：${JSON.stringify(DATA.zones.map(zone => zone.zone_id))}
下一回合：${fallback.turn}
匿名資源摘要：${JSON.stringify(abstractSummary)}
狀態摘要：${JSON.stringify({
      BLUE: { readiness: round1(log.statusAfter.BLUE.readiness), sustainment: round1(log.statusAfter.BLUE.sustainment), command: round1(log.statusAfter.BLUE.command), civilianRisk: round1(log.statusAfter.BLUE.civilianRisk) },
      RED: { readiness: round1(log.statusAfter.RED.readiness), sustainment: round1(log.statusAfter.RED.sustainment), command: round1(log.statusAfter.RED.command) },
      AMBER: { readiness: round1(log.statusAfter.AMBER.readiness), sustainment: round1(log.statusAfter.AMBER.sustainment), command: round1(log.statusAfter.AMBER.command) }
    })}
行動摘要：${JSON.stringify(orderSummary)}
本回合事件分類：${JSON.stringify(currentEvents().map(event => ({ category: event.category, zone: event.zone_id })))}

請聚焦資源趨勢、情報缺口、延續行動與決策難題。事件只提供敘事導調，不得包含數值增減。`;
  }

  function normalizeNextTurnPackage(result, fallback) {
    const validZones = new Set(DATA.zones.map(zone => zone.zone_id));
    const validCategories = new Set(Object.keys(INVENTORY_CATEGORIES));
    const cleanText = (value, fallbackText, max) => String(value || fallbackText || "").replace(/[\r\n]+/g, " ").trim().slice(0, max);
    return {
      ...fallback,
      headline: cleanText(result?.headline, fallback.headline, 60),
      summary: cleanText(result?.summary, fallback.summary, 180),
      resourcePressures: Array.isArray(result?.resourcePressures) ? result.resourcePressures.slice(0, 6).filter(item =>
        ["BLUE", "RED", "AMBER"].includes(item?.actor) && validCategories.has(item?.category)
      ).map(item => ({
        actor: item.actor,
        category: item.category,
        score: round1(clamp(Number(item.score) || 0)),
        trend: round1(clamp(Number(item.trend) || 0, -100, 100)),
        text: cleanText(item.text, "", 100)
      })) : fallback.resourcePressures,
      intelUpdates: Array.isArray(result?.intelUpdates) ? result.intelUpdates.slice(0, 3).filter(item => validZones.has(item?.zone)).map(item => ({
        type: cleanText(item.type, "資源態勢", 50),
        zone: item.zone,
        confidence: Math.round(clamp(Number(item.confidence) || 60, 35, 95)),
        text: cleanText(item.text, "", 160)
      })).filter(item => item.text) : fallback.intelUpdates,
      candidateEvents: Array.isArray(result?.candidateEvents) ? result.candidateEvents.slice(0, 3).filter(item => validZones.has(item?.zone)).map(item => ({
        name: cleanText(item.name, "資源協調壓力", 60),
        category: cleanText(item.category, "後勤", 50),
        zone: item.zone,
        severity: ["low", "medium", "high"].includes(item.severity) ? item.severity : "medium",
        description: cleanText(item.description, "", 160)
      })).filter(item => item.description) : fallback.candidateEvents,
      decisionDilemmas: cleanLlmList(result?.decisionDilemmas, fallback.decisionDilemmas, 4).map(item => item.slice(0, 120)),
      generatedBy: "LLM_SANITIZED",
      privacy: "SANITIZED_AGGREGATE_ONLY"
    };
  }

  function applyNextTurnPackageArtifacts(packageData) {
    if (packageData.turn > state.scenario.turns) return;
    packageData.intelUpdates.forEach((item, index) => state.scenario.intel.push({
      report_id: `NEXT-INT-${packageData.turn}-${Date.now()}-${index}`,
      turn: packageData.turn,
      report_type: item.type,
      zone_id: item.zone,
      report_text: item.text,
      source_reliability: packageData.generatedBy === "LLM_SANITIZED" ? "AI 合成摘要" : "規則引擎",
      confidence_pct: item.confidence,
      nextTurnGenerated: true
    }));
    packageData.candidateEvents.forEach((item, index) => state.scenario.events.push({
      event_id: `NEXT-EVT-${packageData.turn}-${Date.now()}-${index}`,
      trigger_turn: packageData.turn,
      event_name: item.name,
      category: item.category,
      zone_id: item.zone,
      affected_actor: "WHITE",
      description: item.description,
      severity: item.severity,
      nextTurnGenerated: true
    }));
  }

  async function generateNextTurnPackage(log) {
    const nextTurn = log.turn + 1;
    const fallback = fallbackNextTurnPackage(log, nextTurn);
    const apiKey = $("llmApiKey").value.trim();
    const permitted = state.scenario.useLlmNextTurn && state.scenario.allowSanitizedLlm && apiKey && nextTurn <= state.scenario.turns;
    if (!permitted) {
      fallback.fallbackReason = !state.scenario.useLlmNextTurn ? "LLM 次回合生成未啟用"
        : !state.scenario.allowSanitizedLlm ? "匿名摘要分享未獲允許"
          : !apiKey ? "未設定 API Key" : "已完成最後回合";
      applyNextTurnPackageArtifacts(fallback);
      return fallback;
    }
    try {
      const provider = $("llmProvider").value;
      const result = extractJson(await requestLlm(provider, $("llmModel").value.trim(), apiKey, nextTurnPackagePrompt(log, fallback), $("llmReasoning").value));
      const normalized = normalizeNextTurnPackage(result, fallback);
      normalized.provider = LLM_PRESETS[provider].label;
      normalized.model = $("llmModel").value.trim();
      applyNextTurnPackageArtifacts(normalized);
      return normalized;
    } catch (error) {
      fallback.fallbackReason = `LLM 失敗：${error.message}`;
      applyNextTurnPackageArtifacts(fallback);
      toast("次回合想定包改由固定規則生成。");
      return fallback;
    }
  }

  async function resolveTurn() {
    if (!state.scenario || state.currentTurn > state.scenario.turns) return;
    const resolveButton = $("resolveTurnBtn");
    resolveButton.disabled = true;
    resolveButton.textContent = "結算與生成中…";
    await autoFillOrders();
    const orders = state.orders[state.currentTurn] || {};
    const rng = mulberry32(state.scenario.seed + state.currentTurn * 7919 + hashText(JSON.stringify(orders)));
    const difficulty = DIFFICULTY[state.scenario.difficulty];
    const intel = currentIntel();
    const events = currentEvents();
    const weather = currentWeather();
    const avgSea = weather.reduce((sum, w) => sum + Number(w.sea_state_1_5), 0) / Math.max(1, weather.length);
    const avgVisibility = weather.reduce((sum, w) => sum + Number(w.visibility_1_5), 0) / Math.max(1, weather.length);

    Object.values(orders).forEach(order => applyOwnAction(order.actor, order));
    events.forEach(applyEvent);
    applyStrategicPressure();

    const blueScore = orderScore(orders.BLUE, state.status.BLUE, rng) + state.status.BLUE.intel * 0.13;
    const redScore = orderScore(orders.RED, state.status.RED, rng) + state.status.RED.intel * 0.13;
    const amberContribution = orders.AMBER ? orderScore(orders.AMBER, state.status.AMBER, rng) * (
      state.scenario.amberSupport === "limited" ? 0.24 : 0.15
    ) : 0;
    const environmentPenalty = (avgSea - 2.5) * 1.8 + (3.5 - avgVisibility) * 1.2;
    const balance = blueScore + amberContribution - redScore - environmentPenalty * difficulty.pressure;

    const blueLoss = clamp(4.8 + difficulty.pressure * 2.2 - balance * 0.055 + rng() * 3, 1, 13);
    const redLoss = clamp(4.4 + balance * 0.05 + rng() * 3, 1, 13);
    state.status.BLUE.readiness = clamp(state.status.BLUE.readiness - blueLoss);
    state.status.RED.readiness = clamp(state.status.RED.readiness - redLoss);

    // Sustainment deterioration and limited recovery
    ["BLUE", "RED"].forEach(actor => {
      const load = (orderTotalResource(orders[actor]) || 10) * 0.08;
      state.status[actor].sustainment = clamp(state.status[actor].sustainment - load - rng() * 1.5);
      state.status[actor].command = clamp(state.status[actor].command - Math.max(0, state.scenario.uncertainty - 2) * 0.5 + rng());
    });

    if (orders.AMBER && state.scenario.amberSupport !== "none") {
      const amberActions = orderItems(orders.AMBER).map(item => item.action);
      state.status.BLUE.intel = clamp(state.status.BLUE.intel + (amberActions.includes("提供ISR支援") ? 4 : 1));
      state.status.BLUE.sustainment = clamp(state.status.BLUE.sustainment + (amberActions.includes("提升後勤準備") ? 4 : 0.8));
    }

    const outcome = balance > 12 ? "藍方在本回合取得較佳態勢，但仍須保存資源。" :
      balance < -12 ? "紅方施壓取得較明顯效果，藍方需調整部署與資訊判讀。" :
      "本回合態勢膠著，雙方均付出資源與持續性成本。";

    const resourceLedger = applyDetailedInventoryTurn(orders, events);
    const log = {
      turn: state.currentTurn,
      elapsedHours: (state.currentTurn - 1) * state.scenario.hoursPerTurn,
      event: events.length ? events.map(event => event.event_name).join("；") : "無預排事件",
      events: JSON.parse(JSON.stringify(events)),
      orders: JSON.parse(JSON.stringify(orders)),
      blueScore: round1(blueScore),
      redScore: round1(redScore),
      amberContribution: round1(amberContribution),
      environment: { avgSea: round1(avgSea), avgVisibility: round1(avgVisibility) },
      outcome,
      resourceLedger,
      abstractResourcesAfter: JSON.parse(JSON.stringify(state.scenario.abstractResources || null)),
      statusAfter: JSON.parse(JSON.stringify(state.status)),
      keyRisk: state.status.BLUE.civilianRisk > 65 ? "民事風險升高" :
        state.status.BLUE.sustainment < 50 ? "藍方持續性不足" :
        state.status.BLUE.resources < 30 ? "藍方資源接近下限" :
        state.status.BLUE.intel < 50 ? "情報品質不足" : "需持續監控"
    };
    state.logs.push(log);
    const nextTurnPackage = await generateNextTurnPackage(log);
    log.nextTurnPackage = nextTurnPackage;
    log.turnSnapshot = {
      version: 1,
      intel: JSON.parse(JSON.stringify(intel)),
      weather: JSON.parse(JSON.stringify(weather)),
      events: JSON.parse(JSON.stringify(events)),
      orders: JSON.parse(JSON.stringify(orders)),
      resourceLedger: JSON.parse(JSON.stringify(resourceLedger || null)),
      abstractResourcesAfter: JSON.parse(JSON.stringify(state.scenario.abstractResources || null)),
      nextTurnPackage: JSON.parse(JSON.stringify(nextTurnPackage || null))
    };
    state.scenario.nextTurnPackages.push(nextTurnPackage);
    operationAnimation.pendingAutoplayTurn = log.turn;
    state.currentTurn += 1;
    saveState(false);
    renderSimulation();
    renderAAR();
    resolveButton.textContent = "結算本回合";
    toast(state.currentTurn > state.scenario.turns ? "推演完成，可進行事後檢討。" : "本回合已結算。");
  }

  function renderNarrative() {
    const logs = [...state.logs].reverse();
    $("turnNarrative").innerHTML = logs.length ? logs.map(log => `
      <div class="turn-log">
        <h4>第 ${log.turn} 回合 · T+${log.elapsedHours}h</h4>
        <p><strong>事件：</strong>${escapeHtml(log.event)}</p>
        <p><strong>裁決：</strong>${escapeHtml(log.outcome)}</p>
        <p><strong>關鍵風險：</strong>${escapeHtml(log.keyRisk)}</p>
        <small>藍方準備 ${round1(log.statusAfter.BLUE.readiness)} · 紅方準備 ${round1(log.statusAfter.RED.readiness)} · 民事風險 ${round1(log.statusAfter.BLUE.civilianRisk)}</small>
      </div>`).join("") : `<p class="muted">尚未結算任何回合。</p>`;
  }

  function renderResourceLedger() {
    const host = $("resourceLedgerPanel");
    if (!host) return;
    if (!state.scenario.inventoryEnabled) {
      host.innerHTML = `<p class="muted">本想定未啟用詳細資源帳本，沿用舊版 0–100 資源指數。</p>`;
      return;
    }
    const ledger = state.scenario.resourceLedger?.at(-1);
    const abstractInventory = state.scenario.abstractResources;
    const chips = ["BLUE", "RED", "AMBER"].map(actor => {
      const overall = abstractInventory?.byActor?.[actor]?.overall ?? 0;
      return `<span class="ledger-chip"><strong>${actorLabel(actor)}</strong> ${overall}/100</span>`;
    }).join("");
    if (!ledger) {
      host.innerHTML = `<div class="ledger-summary">${chips}</div><p class="muted">等待第一個回合結算。結算後會顯示期初、恢復、補充、行動消耗、事件損失與期末數量。</p>`;
      return;
    }
    const changed = ledger.entries.filter(entry =>
      entry.recovery || entry.replenishment || entry.actionConsumption || entry.eventLoss
    );
    host.innerHTML = `<div class="ledger-summary">${chips}
        <span class="ledger-chip">行動消耗 ${ledger.totals.consumed}</span>
        <span class="ledger-chip">事件損失 ${ledger.totals.eventLoss}</span>
        <span class="ledger-chip">恢復／補充 ${round1(ledger.totals.recovered + ledger.totals.replenished)}</span>
      </div>
      ${changed.length ? `<div class="table-wrap"><table class="ledger-table">
        <thead><tr><th>品項</th><th>方別／類別</th><th>期初</th><th>恢復</th><th>補充</th><th>行動消耗</th><th>事件損失</th><th>期末</th></tr></thead>
        <tbody>${changed.map(entry => `<tr>
          <td>${escapeHtml(entry.alias)}</td>
          <td>${actorLabel(entry.actor)}／${INVENTORY_CATEGORIES[entry.category]}</td>
          <td>${entry.opening}</td><td>+${entry.recovery}</td><td>+${entry.replenishment}</td>
          <td>−${entry.actionConsumption}</td><td>−${entry.eventLoss}</td><td><strong>${entry.closing}</strong></td>
        </tr>`).join("")}</tbody>
      </table></div>` : `<p class="muted">第 ${ledger.turn} 回合沒有對已登錄品項造成數量變化。</p>`}`;
  }

  function renderNextTurnPackage() {
    const host = $("nextTurnPackagePanel");
    const badge = $("nextTurnPackageSource");
    if (!host || !badge) return;
    const packageData = state.scenario.nextTurnPackages?.at(-1);
    if (!packageData) {
      badge.textContent = "尚未生成";
      host.innerHTML = `<p class="muted">回合結算後，系統會依剩餘資源、趨勢、事件與狀態形成下一回合想定包。</p>`;
      return;
    }
    badge.textContent = packageData.generatedBy === "LLM_SANITIZED" ? "LLM／匿名摘要" : "固定規則";
    const pressures = packageData.resourcePressures || [];
    const events = packageData.candidateEvents || [];
    const intel = packageData.intelUpdates || [];
    host.innerHTML = `<h4>第 ${packageData.turn} 回合 · ${escapeHtml(packageData.headline)}</h4>
      <p>${escapeHtml(packageData.summary)}</p>
      ${pressures.length ? `<h5>資源壓力</h5>${pressures.map(item => `<div class="package-pressure">
        <span>${actorLabel(item.actor)}／${INVENTORY_CATEGORIES[item.category]}</span>
        <span class="inventory-score-bar"><i style="width:${clamp(item.score)}%"></i></span>
        <strong>${round1(item.score)}${Number(item.trend) ? ` (${item.trend > 0 ? "+" : ""}${round1(item.trend)})` : ""}</strong>
      </div>`).join("")}` : ""}
      ${intel.length ? `<h5>新情報</h5><ul class="package-list">${intel.map(item => `<li><strong>${escapeHtml(item.type)}／${zoneName(item.zone)}</strong>：${escapeHtml(item.text)}（信心 ${item.confidence}%）</li>`).join("")}</ul>` : ""}
      ${events.length ? `<h5>候選事件</h5><ul class="package-list">${events.map(item => `<li><strong>${escapeHtml(item.name)}</strong>：${escapeHtml(item.description)}</li>`).join("")}</ul>` : ""}
      <h5>決策難題</h5>
      <ul class="package-list">${(packageData.decisionDilemmas || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <p class="package-source-note">資料邊界：${packageData.privacy === "SANITIZED_AGGREGATE_ONLY" ? "僅使用匿名化聚合值" : "本機規則"}${packageData.fallbackReason ? `；${escapeHtml(packageData.fallbackReason)}` : ""}。</p>`;
  }

  function updateLab() {
    const incoming = Number($("labIncoming").value);
    const shots = Number($("labShots").value);
    const baseP = Number($("labBaseP").value) / 100;
    const detection = Number($("labDetection").value) / 100;
    const readiness = Number($("labReadiness").value) / 100;
    const sea = Number($("labSea").value);
    const jamming = Number($("labJamming").value) / 100;

    $("labBasePValue").value = `${Math.round(baseP * 100)}%`;
    $("labDetectionValue").value = `${Math.round(detection * 100)}%`;
    $("labReadinessValue").value = `${Math.round(readiness * 100)}%`;
    $("labSeaValue").value = sea;
    $("labJammingValue").value = `${Math.round(jamming * 100)}%`;

    const adjusted = Math.min(.95, baseP * (.6 + .4 * detection) * (.75 + .25 * readiness) * (1 - .08 * (sea - 1)) * (1 - .12 * jamming));
    const atLeastOne = 1 - Math.pow(1 - adjusted, shots);
    const residual = Math.max(0, incoming * (1 - atLeastOne));
    const efficiency = atLeastOne / shots;

    $("labResults").innerHTML = `
      <article class="metric blue"><small>修正後單次機率</small><strong>${percent(adjusted)}</strong><small>僅為合成值</small></article>
      <article class="metric blue"><small>至少一次成功</small><strong>${percent(atLeastOne)}</strong><small>假設各次近似獨立</small></article>
      <article class="metric neutral"><small>期望剩餘目標</small><strong>${round1(residual)}</strong><small>用於方案比較</small></article>
      <article class="metric amber"><small>每次投入效率</small><strong>${percent(efficiency)}</strong><small>增加投入存在邊際效益遞減</small></article>`;
  }

  function turnReviewSnapshot(log) {
    if (log?.turnSnapshot) return log.turnSnapshot;
    const turn = Number(log?.turn || 0);
    return {
      version: 0,
      reconstructed: true,
      intel: (state.scenario?.intel || []).filter(item => Number(item.turn) === turn),
      weather: weatherForTurn(turn),
      events: timelineEvents(log),
      orders: log?.orders || {},
      resourceLedger: log?.resourceLedger || null,
      abstractResourcesAfter: log?.abstractResourcesAfter || null,
      nextTurnPackage: log?.nextTurnPackage
        || (state.scenario?.nextTurnPackages || []).find(item => Number(item.turn) === turn + 1)
        || null
    };
  }

  function reviewEmpty(message) {
    return `<div class="aar-review-empty">${escapeHtml(message)}</div>`;
  }

  function renderReviewIntel(snapshot) {
    const rows = snapshot.intel || [];
    if (!rows.length) return reviewEmpty("本回合沒有新增情報；這本身也是需要檢討的資訊缺口。");
    return `<div class="aar-review-log-grid">${rows.map(item => `<article class="turn-log">
      <strong>${escapeHtml(item.report_type || "情報")} · ${escapeHtml(zoneName(item.zone_id))}</strong>
      <p>${escapeHtml(item.report_text || "無文字內容")}</p>
      <small>來源 ${escapeHtml(item.source_reliability || "未標示")} · 信心 ${Number(item.confidence_pct) || 0}%</small>
    </article>`).join("")}</div>`;
  }

  function renderReviewWeather(snapshot) {
    const rows = snapshot.weather || [];
    if (!rows.length) return reviewEmpty("本回合沒有天候與環境資料。");
    return `<div class="table-wrap"><table class="aar-review-table">
      <thead><tr><th>區域</th><th>海象</th><th>能見度</th><th>風速</th><th>降水機率</th></tr></thead>
      <tbody>${rows.map(item => `<tr>
        <td><strong>${escapeHtml(zoneName(item.zone_id))}</strong></td>
        <td>${Number(item.sea_state_1_5) || 0}/5</td>
        <td>${Number(item.visibility_1_5) || 0}/5</td>
        <td>約 ${Number(item.wind_kts) || 0} 節（合成）</td>
        <td>${Number(item.precip_probability_pct) || 0}%（合成）</td>
      </tr>`).join("")}</tbody>
    </table></div>`;
  }

  function renderReviewEvents(snapshot) {
    const rows = snapshot.events || [];
    if (!rows.length) return reviewEmpty("本回合沒有預排或臨時導調事件。");
    return `<div class="aar-review-log-grid">${rows.map(event => `<article class="turn-log aar-event-log">
      <strong>${escapeHtml(event.event_name || "未命名事件")}</strong>
      <p>${escapeHtml(event.description || "舊版紀錄未保存事件說明。")}</p>
      <small>${escapeHtml(event.category || "未分類")} · ${escapeHtml(zoneName(event.zone_id || "Z-ISL"))}
        · 影響 ${escapeHtml(actorLabel(event.affected_actor || "ALL"))}${event.whiteInjected ? " · 白方臨時發布" : ""}</small>
    </article>`).join("")}</div>`;
  }

  function renderReviewLedger(snapshot) {
    const ledger = snapshot.resourceLedger;
    if (!ledger) return reviewEmpty("本回合未啟用詳細資源帳本，或舊版紀錄未保存帳本明細。");
    const entries = ledger.entries || [];
    const changedCount = entries.filter(entry =>
      entry.recovery || entry.replenishment || entry.actionConsumption || entry.eventLoss
    ).length;
    const totals = ledger.totals || {};
    const actorScores = ["BLUE", "RED", "AMBER"].map(actor => {
      const score = snapshot.abstractResourcesAfter?.byActor?.[actor]?.overall;
      return Number.isFinite(score)
        ? `<span class="ledger-chip"><strong>${actorLabel(actor)}</strong> ${round1(score)}/100</span>`
        : "";
    }).join("");
    return `<div class="ledger-summary">${actorScores}
      <span class="ledger-chip">行動消耗 ${round1(Number(totals.consumed || 0))}</span>
      <span class="ledger-chip">事件損失 ${round1(Number(totals.eventLoss || 0))}</span>
      <span class="ledger-chip">恢復／補充 ${round1(Number(totals.recovered || 0) + Number(totals.replenished || 0))}</span>
      <span class="ledger-chip">異動品項 ${changedCount}/${entries.length}</span>
    </div>
    ${entries.length ? `<div class="table-wrap"><table class="ledger-table aar-review-table">
      <thead><tr><th>品項</th><th>方別／類別</th><th>期初</th><th>恢復</th><th>補充</th><th>行動消耗</th><th>事件損失</th><th>期末</th></tr></thead>
      <tbody>${entries.map(entry => `<tr>
        <td>${escapeHtml(entry.alias || "未命名品項")}</td>
        <td>${escapeHtml(actorLabel(entry.actor))}／${escapeHtml(INVENTORY_CATEGORIES[entry.category] || entry.category || "未分類")}</td>
        <td>${Number(entry.opening) || 0}</td><td>+${Number(entry.recovery) || 0}</td><td>+${Number(entry.replenishment) || 0}</td>
        <td>−${Number(entry.actionConsumption) || 0}</td><td>−${Number(entry.eventLoss) || 0}</td><td><strong>${Number(entry.closing) || 0}</strong></td>
      </tr>`).join("")}</tbody>
    </table></div>` : reviewEmpty("本回合帳本沒有已登錄品項。")}`;
  }

  function renderReviewNextPackage(snapshot) {
    const packageData = snapshot.nextTurnPackage;
    if (!packageData) return reviewEmpty("本回合沒有保存次回合想定包，或已是想定的最後一回合。");
    const pressures = packageData.resourcePressures || [];
    const intel = packageData.intelUpdates || [];
    const events = packageData.candidateEvents || [];
    const source = packageData.generatedBy === "LLM_SANITIZED" ? "LLM／匿名摘要" : "固定規則";
    return `<div class="aar-package-heading"><span class="badge">${source}</span>
      <h4>第 ${Number(packageData.turn) || "—"} 回合 · ${escapeHtml(packageData.headline || "次回合想定")}</h4></div>
      <p>${escapeHtml(packageData.summary || "")}</p>
      ${pressures.length ? `<h5>資源壓力</h5>${pressures.map(item => `<div class="package-pressure">
        <span>${escapeHtml(actorLabel(item.actor))}／${escapeHtml(INVENTORY_CATEGORIES[item.category] || item.category || "未分類")}</span>
        <span class="inventory-score-bar"><i style="width:${clamp(Number(item.score) || 0)}%"></i></span>
        <strong>${round1(Number(item.score) || 0)}${Number(item.trend) ? ` (${item.trend > 0 ? "+" : ""}${round1(Number(item.trend))})` : ""}</strong>
      </div>`).join("")}` : ""}
      ${intel.length ? `<h5>新情報</h5><ul class="package-list">${intel.map(item => `<li><strong>${escapeHtml(item.type || "情報")}／${escapeHtml(zoneName(item.zone))}</strong>：${escapeHtml(item.text || "")}（信心 ${Number(item.confidence) || 0}%）</li>`).join("")}</ul>` : ""}
      ${events.length ? `<h5>候選事件</h5><ul class="package-list">${events.map(item => `<li><strong>${escapeHtml(item.name || "事件")}</strong>：${escapeHtml(item.description || "")}</li>`).join("")}</ul>` : ""}
      <h5>決策難題</h5>
      <ul class="package-list">${(packageData.decisionDilemmas || []).map(item => `<li>${escapeHtml(item)}</li>`).join("") || "<li>未保存決策難題。</li>"}</ul>
      <p class="package-source-note">資料邊界：${packageData.privacy === "SANITIZED_AGGREGATE_ONLY" ? "僅使用匿名化聚合值" : "本機規則"}${packageData.fallbackReason ? `；${escapeHtml(packageData.fallbackReason)}` : ""}。</p>`;
  }

  function renderReviewOrders(snapshot) {
    const orders = snapshot.orders || {};
    const actors = ["BLUE", "RED", "AMBER"].filter(actor => orders[actor]);
    if (!actors.length) return reviewEmpty("本回合沒有保存三方命令。");
    return `<div class="aar-order-grid">${actors.map(actor => {
      const order = orders[actor];
      const items = orderItems(order);
      return `<article class="aar-order-card ${actor}">
        <header><strong>${escapeHtml(actorLabel(actor))}</strong><span>投入 ${orderTotalResource(order)}/${ORDER_BUDGET}</span></header>
        <div class="table-wrap"><table class="aar-order-table">
          <thead><tr><th>類型</th><th>行動</th><th>區域</th><th>投入</th><th>優先</th><th>風險</th><th>條件</th></tr></thead>
          <tbody>${items.map((item, index) => `<tr>
            <td>${index === 0 ? "主要" : "支援"}</td>
            <td><strong>${escapeHtml(item.action || "未填寫")}</strong></td>
            <td>${escapeHtml(zoneName(item.zone))}</td>
            <td>${Number(item.resource) || 0}</td>
            <td>${Number(item.priority) || "—"}</td>
            <td>${escapeHtml(riskLabel(item.risk))}</td>
            <td>${escapeHtml(item.condition || "未填寫")}</td>
          </tr>`).join("")}</tbody>
        </table></div>
        <p class="footnote"><strong>理由：</strong>${escapeHtml(order.rationale || "未填寫理由")}${order.aiGenerated ? " · AI 建議命令" : ""}</p>
      </article>`;
    }).join("")}</div>`;
  }

  function aarReplayIconLegendMarkup(log) {
    return `<div class="operation-icon-guide">
      <div class="operation-icon-guide-heading">
        <h5>本回合圖標說明</h5>
        <span>依藍、紅、黃三方列出本回合實際使用的行動圖標</span>
      </div>
      <div class="operation-icon-legend">${["BLUE", "RED", "AMBER"].map(actor => {
        const items = orderItems(log.orders?.[actor]);
        return `<section class="operation-icon-faction ${actor}">
          <h6>${escapeHtml(actorLabel(actor))}</h6>
          <div class="operation-icon-list">${items.length ? items.map((item, index) => {
            const type = operationType(item.action).type;
            return `<div class="operation-icon-item">
              <canvas data-aar-replay-icon="${escapeAttr(type)}" data-aar-replay-actor="${actor}" aria-hidden="true"></canvas>
              <div><strong>${escapeHtml(item.action)}</strong><span>${escapeHtml(OPERATION_TYPE_LABELS[type] || type)} · ${index === 0 ? "主要行動" : "支援行動"}</span></div>
            </div>`;
          }).join("") : `<div class="operation-icon-item"><div></div><div><strong>本回合未提交</strong><span>沒有可顯示的行動圖標</span></div></div>`}</div>
        </section>`;
      }).join("")}</div>
    </div>`;
  }

  function aarReplayMarkup(log) {
    return `<section id="aarReplayTheater" class="operation-theater aar-replay-theater" aria-label="第 ${log.turn} 回合三方作戰示意動畫">
      <div class="operation-theater-heading">
        <div>
          <h4>第 ${log.turn} 回合三方作戰示意動畫</h4>
          <p id="aarReplayStatus" class="muted">選定回合的唯讀動畫重播。</p>
        </div>
        <div class="operation-playback">
          <button id="aarReplayBtn" type="button" class="secondary">重播</button>
          <button id="aarReplayPauseBtn" type="button" class="secondary">暫停</button>
          <label>速度
            <select id="aarReplaySpeed" aria-label="事後檢討動畫播放速度">
              <option value="0.5">0.5×</option>
              <option value="1" selected>1×</option>
              <option value="1.5">1.5×</option>
              <option value="2">2×</option>
            </select>
          </label>
          <button id="aarReplayFullscreenBtn" type="button" class="secondary">全螢幕</button>
        </div>
      </div>
      <div id="aarReplayCanvasFrame" class="operation-canvas-frame">
        <canvas id="aarReplayCanvas" role="img" aria-label="第 ${log.turn} 回合三方行動路徑與衝突示意"></canvas>
      </div>
      <div id="aarReplayActorSummary" class="operation-actor-summary"></div>
      <p id="aarReplayDescription" class="operation-equipment-disclaimer"></p>
      ${aarReplayIconLegendMarkup(log)}
      <p class="operation-map-credit">底圖：Wikimedia Commons 向量地圖，僅供教學示意。</p>
    </section>`;
  }

  function renderAarReplay(log) {
    const scene = operationSceneForLog(log);
    aarReplayAnimation.scene = scene;
    aarReplayAnimation.sceneKey = scene?.key || "";
    aarReplayAnimation.duration = scene?.duration || 12000;
    aarReplayAnimation.elapsed = aarReplayAnimation.duration;
    aarReplayAnimation.speed = 1;
    aarReplayAnimation.playing = false;
    const fullscreen = $("aarReplayFullscreenBtn");
    if (fullscreen) fullscreen.disabled = !document.fullscreenEnabled;
    if (!scene) {
      $("aarReplayStatus").textContent = "本回合沒有可重建的命令動畫。";
      $("aarReplayBtn").disabled = true;
      $("aarReplayPauseBtn").disabled = true;
      drawAarReplayFrame();
      return;
    }
    const conflictText = scene.conflicts.length
      ? `偵測到 ${scene.conflicts.length} 個重大衝突區域`
      : "未達重大衝突高亮門檻";
    $("aarReplayStatus").textContent = `第 ${log.turn} 回合 · ${conflictText}`;
    $("aarReplayActorSummary").innerHTML = ["BLUE", "RED", "AMBER"].filter(actor => log.orders?.[actor]).map(actor => {
      const order = log.orders[actor];
      const primary = orderPrimary(order);
      const type = operationType(primary.action).type;
      const equipment = operationEquipmentLabel(actor, type, `${log.turn}-${primary.action}-0`);
      return `<div class="operation-actor-chip ${actor}">
        <strong>${escapeHtml(actorLabel(actor))} · ${escapeHtml(primary.action)}</strong>
        <span>${equipment ? `${escapeHtml(equipment)} · ` : ""}${escapeHtml(zoneName(primary.zone))} · 支援 ${orderSupports(order).length} 項</span>
      </div>`;
    }).join("");
    $("aarReplayDescription").textContent = `第 ${log.turn} 回合抽象行動示意。${scene.conflicts.length ? `重大衝突區域：${scene.conflicts.map(item => zoneName(item.zone)).join("、")}。` : ""}公開裝備名稱僅為教學遊戲的敘事標籤，不代表真實座標、數量、性能、部署或交戰程序。`;
    $("aarReplayTheater").querySelectorAll("canvas[data-aar-replay-icon]").forEach(canvas => {
      const actor = OPERATION_ACTORS[canvas.dataset.aarReplayActor];
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const size = 32;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawOperationPictogram(ctx, canvas.dataset.aarReplayIcon, size / 2, size / 2, 11, actor.color, 0);
    });
    requestAnimationFrame(drawAarReplayFrame);
  }

  function drawAarReplayFrame() {
    drawOperationFrame(aarReplayAnimation.elapsed, aarReplayAnimation.scene, {
      canvasId: "aarReplayCanvas",
      frameId: "aarReplayCanvasFrame",
      playing: aarReplayAnimation.playing
    });
  }

  function stopAarReplayAnimation() {
    if (aarReplayAnimation.frameId) cancelAnimationFrame(aarReplayAnimation.frameId);
    aarReplayAnimation.frameId = 0;
    aarReplayAnimation.playing = false;
    const frame = $("aarReplayCanvasFrame");
    if (frame) frame.classList.remove("major-conflict-active");
  }

  function startAarReplayAnimation(restart = false) {
    if (!aarReplayAnimation.scene) return;
    if (restart) aarReplayAnimation.elapsed = 0;
    stopAarReplayAnimation();
    aarReplayAnimation.playing = true;
    aarReplayAnimation.startedAt = performance.now() - aarReplayAnimation.elapsed / aarReplayAnimation.speed;
    if ($("aarReplayPauseBtn")) $("aarReplayPauseBtn").textContent = "暫停";
    aarReplayAnimation.frameId = requestAnimationFrame(stepAarReplayAnimation);
  }

  function stepAarReplayAnimation(now) {
    if (!aarReplayAnimation.playing || !aarReplayAnimation.scene) return;
    aarReplayAnimation.elapsed = Math.min(
      aarReplayAnimation.duration,
      (now - aarReplayAnimation.startedAt) * aarReplayAnimation.speed
    );
    drawAarReplayFrame();
    if (aarReplayAnimation.elapsed < aarReplayAnimation.duration) {
      aarReplayAnimation.frameId = requestAnimationFrame(stepAarReplayAnimation);
    } else {
      stopAarReplayAnimation();
      if ($("aarReplayPauseBtn")) $("aarReplayPauseBtn").textContent = "重新播放";
    }
  }

  function toggleAarReplayAnimation() {
    if (!aarReplayAnimation.scene) return;
    if (!aarReplayAnimation.playing) {
      startAarReplayAnimation(aarReplayAnimation.elapsed >= aarReplayAnimation.duration);
      return;
    }
    aarReplayAnimation.elapsed = Math.min(
      aarReplayAnimation.duration,
      (performance.now() - aarReplayAnimation.startedAt) * aarReplayAnimation.speed
    );
    stopAarReplayAnimation();
    if ($("aarReplayPauseBtn")) $("aarReplayPauseBtn").textContent = "繼續";
    drawAarReplayFrame();
  }

  function setAarReplaySpeed() {
    const nextSpeed = Number($("aarReplaySpeed")?.value) || 1;
    if (aarReplayAnimation.playing) {
      aarReplayAnimation.elapsed = Math.min(
        aarReplayAnimation.duration,
        (performance.now() - aarReplayAnimation.startedAt) * aarReplayAnimation.speed
      );
      aarReplayAnimation.speed = nextSpeed;
      aarReplayAnimation.startedAt = performance.now() - aarReplayAnimation.elapsed / nextSpeed;
    } else {
      aarReplayAnimation.speed = nextSpeed;
    }
  }

  async function toggleAarReplayFullscreen() {
    const theater = $("aarReplayTheater");
    if (!theater || !document.fullscreenEnabled) {
      toast("此瀏覽器不支援全螢幕模式。");
      return;
    }
    try {
      if (document.fullscreenElement === theater) await document.exitFullscreen();
      else await theater.requestFullscreen();
    } catch {
      toast("無法切換全螢幕模式，請檢查瀏覽器權限。");
    }
  }

  function syncAarReplayFullscreen() {
    const button = $("aarReplayFullscreenBtn");
    const theater = $("aarReplayTheater");
    if (!button || !theater) return;
    const active = document.fullscreenElement === theater;
    button.textContent = active ? "退出全螢幕" : "全螢幕";
    button.setAttribute("aria-pressed", String(active));
    requestAnimationFrame(drawAarReplayFrame);
  }

  function renderAarReviewContent(log) {
    const host = $("aarReviewContent");
    if (!host || !log) return;
    stopAarReplayAnimation();
    const snapshot = turnReviewSnapshot(log);
    const tab = state.aarReview.tab;
    if (tab === "intel") host.innerHTML = renderReviewIntel(snapshot);
    else if (tab === "weather") host.innerHTML = renderReviewWeather(snapshot);
    else if (tab === "events") host.innerHTML = renderReviewEvents(snapshot);
    else if (tab === "ledger") host.innerHTML = renderReviewLedger(snapshot);
    else if (tab === "next") host.innerHTML = renderReviewNextPackage(snapshot);
    else if (tab === "orders") host.innerHTML = renderReviewOrders(snapshot);
    else {
      host.innerHTML = aarReplayMarkup(log);
      renderAarReplay(log);
    }
    host.dataset.reviewTurn = String(log.turn);
    host.dataset.reviewTab = tab;
  }

  function renderAarReview() {
    const logs = state.logs || [];
    if (!logs.length) return;
    state.aarReview ||= { turn: null, tab: "intel" };
    const availableTabs = ["intel", "weather", "events", "ledger", "next", "animation", "orders"];
    if (!availableTabs.includes(state.aarReview.tab)) state.aarReview.tab = "intel";
    const availableTurns = logs.map(log => Number(log.turn));
    if (!availableTurns.includes(Number(state.aarReview.turn))) {
      state.aarReview.turn = availableTurns[availableTurns.length - 1];
    }
    const selectedIndex = availableTurns.indexOf(Number(state.aarReview.turn));
    const selectedLog = logs[selectedIndex];
    $("aarReviewTurnSelect").innerHTML = logs.map(log =>
      `<option value="${log.turn}" ${Number(log.turn) === Number(state.aarReview.turn) ? "selected" : ""}>第 ${log.turn} 回合 · T+${log.elapsedHours}h</option>`
    ).join("");
    $("aarReviewPrevBtn").disabled = selectedIndex <= 0;
    $("aarReviewNextBtn").disabled = selectedIndex >= logs.length - 1;
    const snapshot = turnReviewSnapshot(selectedLog);
    $("aarReviewMeta").textContent = `第 ${selectedLog.turn} 回合 · T+${selectedLog.elapsedHours}h · ${snapshot.reconstructed ? "由舊紀錄重建" : "完整快照"} · ${selectedLog.outcome}`;
    $("aarReviewTabs").querySelectorAll("[data-aar-review-tab]").forEach(button => {
      const active = button.dataset.aarReviewTab === state.aarReview.tab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    renderAarReviewContent(selectedLog);
  }

  function selectAarReviewTurn(turn, scrollIntoView = false) {
    if (!(state.logs || []).some(log => Number(log.turn) === Number(turn))) return;
    state.aarReview ||= { turn: null, tab: "intel" };
    state.aarReview.turn = Number(turn);
    renderAarReview();
    if (scrollIntoView) $("aarTurnReview")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderAAR() {
    const hasLogs = state.logs.length > 0;
    $("aarEmpty").hidden = hasLogs;
    $("aarContent").hidden = !hasLogs;
    if (!hasLogs) {
      stopAarReplayAnimation();
      aarReplayAnimation.scene = null;
      state.aarReview = { turn: null, tab: "intel" };
      return;
    }

    const last = state.logs[state.logs.length - 1];
    const totalBlueResource = 100 - last.statusAfter.BLUE.resources;
    const totalRedResource = 100 - last.statusAfter.RED.resources;
    const maxRisk = Math.max(...state.logs.map(l => l.statusAfter.BLUE.civilianRisk));
    const lowIntelTurns = state.logs.filter(l => l.statusAfter.BLUE.intel < 55).length;

    $("aarMetrics").innerHTML = `
      <article class="metric blue"><small>藍方最終準備</small><strong>${round1(last.statusAfter.BLUE.readiness)}</strong><small>起始約 ${round1(initialStatus(state.scenario).BLUE.readiness)}</small></article>
      <article class="metric red"><small>紅方最終準備</small><strong>${round1(last.statusAfter.RED.readiness)}</strong><small>資源投入 ${round1(totalRedResource)}</small></article>
      <article class="metric neutral"><small>最高民事風險</small><strong>${round1(maxRisk)}</strong><small>高於65建議列為重大檢討</small></article>
      <article class="metric amber"><small>藍方資源投入</small><strong>${round1(totalBlueResource)}</strong><small>剩餘 ${round1(last.statusAfter.BLUE.resources)}</small></article>`;

    const insights = [];
    const biggestDrop = [...state.logs].sort((a, b) => {
      const pa = a.turn === 1 ? initialStatus(state.scenario).BLUE.readiness : state.logs[a.turn - 2].statusAfter.BLUE.readiness;
      const pb = b.turn === 1 ? initialStatus(state.scenario).BLUE.readiness : state.logs[b.turn - 2].statusAfter.BLUE.readiness;
      return (pb - b.statusAfter.BLUE.readiness) - (pa - a.statusAfter.BLUE.readiness);
    })[0];
    insights.push(`<li><strong>準備度壓力：</strong>第 ${biggestDrop.turn} 回合是藍方準備度下降最明顯的時段。</li>`);
    insights.push(`<li><strong>情報風險：</strong>共有 ${lowIntelTurns} 回合的藍方情報指數低於55，應檢查是否在證據不足時做出高風險決策。</li>`);
    insights.push(`<li><strong>資源管理：</strong>藍方累計投入約 ${round1(totalBlueResource)} 點，最終保留 ${round1(last.statusAfter.BLUE.resources)} 點。</li>`);
    insights.push(`<li><strong>民事影響：</strong>最高民事風險為 ${round1(maxRisk)}；應比較軍事效果與商運、人道、輿情成本。</li>`);
    if (state.scenario.amberSupport !== "none") {
      insights.push(`<li><strong>外部支援：</strong>檢查美軍支援是否被用於補足情報／後勤缺口，而非被當成無限制資源。</li>`);
    }
    $("aarInsights").innerHTML = `<ul class="compact-list">${insights.join("")}</ul>`;
    renderAarReview();

    $("timelineBody").innerHTML = state.logs.map(log => {
      const o = log.orders || {};
      return `<tr>
        <td>${log.turn}<br><small>T+${log.elapsedHours}h</small>
          <button type="button" class="timeline-review-btn" data-review-turn="${log.turn}">回看此回合</button>
        </td>
        <td>${escapeHtml(log.event)}</td>
        <td class="faction-count-cell">${renderTurnFactionCountTables(log)}</td>
        <td>${formatOrder(o.BLUE)}</td>
        <td>${formatOrder(o.RED)}</td>
        <td>${formatOrder(o.AMBER)}</td>
        <td>${escapeHtml(log.outcome)}<br><small>${escapeHtml(log.keyRisk)}</small></td>
      </tr>`;
    }).join("");
  }

  function timelineEvents(log) {
    if (Array.isArray(log.events)) return log.events;
    const matching = (state.scenario?.events || []).filter(event => Number(event.trigger_turn) === Number(log.turn));
    if (matching.length) return matching;
    if (!log.event || log.event === "無預排事件") return [];
    return String(log.event).split("；").filter(Boolean).map((eventName, index) => ({
      event_id: `LEGACY-${log.turn}-${index}`,
      event_name: eventName,
      affected_actor: "ALL",
      zone_id: "Z-ISL"
    }));
  }

  function timelineEventsForActor(log, actor) {
    return timelineEvents(log).filter(event =>
      ["ALL", "WHITE", actor].includes(event.affected_actor || "ALL")
    );
  }

  function timelineLedgerTotals(log, actor) {
    const entries = log.resourceLedger?.entries?.filter(entry => entry.actor === actor) || [];
    return {
      consumed: round1(entries.reduce((sum, entry) => sum + Number(entry.actionConsumption || 0), 0)),
      eventLoss: round1(entries.reduce((sum, entry) => sum + Number(entry.eventLoss || 0), 0))
    };
  }

  function timelineWaveLabel(index) {
    const labels = ["第一波", "第二波", "第三波", "第四波", "第五波", "第六波"];
    return labels[index] || `第 ${index + 1} 波`;
  }

  function renderFactionCountTable(log, actor) {
    const order = log.orders?.[actor];
    const actions = orderItems(order);
    const events = timelineEventsForActor(log, actor);
    const ledger = timelineLedgerTotals(log, actor);
    const startHour = Number(log.elapsedHours || 0);
    const endHour = startHour + Number(state.scenario?.hoursPerTurn || 0);
    const timeWindow = `T+${startHour}–${endHour}h`;
    const rows = [
      ...actions.map((item, index) => ({
        sequence: timelineWaveLabel(index),
        name: item.action,
        zone: item.zone,
        resource: Number(item.resource || 0),
        kind: index === 0 ? "主要行動" : "支援行動"
      })),
      ...events.map((event, index) => ({
        sequence: `事件 ${index + 1}`,
        name: event.event_name || "未命名事件",
        zone: event.zone_id || "Z-ISL",
        resource: 0,
        kind: event.affected_actor === "ALL" || event.affected_actor === "WHITE" ? "共同事件" : "影響事件"
      }))
    ];
    const resourceTotal = orderTotalResource(order);
    const actorClass = actor.toLowerCase();
    const body = rows.length ? rows.map(row => `<tr>
      <td>${timeWindow}</td>
      <td><strong>${escapeHtml(row.sequence)}</strong><small>${escapeHtml(row.kind)}</small></td>
      <td>${escapeHtml(row.name)}</td>
      <td>${escapeHtml(zoneName(row.zone))}</td>
      <td>${row.resource || "—"}</td>
    </tr>`).join("") : `<tr><td colspan="5" class="faction-count-empty">本回合未投入行動，亦無適用事件。</td></tr>`;
    return `<section class="faction-count-card ${actorClass}" aria-label="${actorLabel(actor)}第 ${log.turn} 回合事件計數表">
      <header><span>${actorLabel(actor)}</span><strong>第 ${log.turn} 回合計數表</strong></header>
      <div class="faction-count-table-wrap"><table>
        <caption class="sr-only">${actorLabel(actor)}第 ${log.turn} 回合行動與事件計數</caption>
        <thead><tr><th>作戰時序</th><th>波次</th><th>行動／事件</th><th>區域</th><th>投入</th></tr></thead>
        <tbody>${body}</tbody>
      </table></div>
      <footer>
        <span>行動 <strong>${actions.length}</strong></span>
        <span>事件 <strong>${events.length}</strong></span>
        <span>投入 <strong>${resourceTotal}</strong></span>
        <span>消耗 <strong>${ledger.consumed}</strong></span>
        <span>事件損失 <strong>${ledger.eventLoss}</strong></span>
      </footer>
    </section>`;
  }

  function renderTurnFactionCountTables(log) {
    return `<div class="faction-count-grid">
      ${["BLUE", "RED", "AMBER"].map(actor => renderFactionCountTable(log, actor)).join("")}
    </div>`;
  }

  function formatOrder(order) {
    if (!order) return "—";
    const primary = orderPrimary(order);
    const supports = orderSupports(order);
    const supportText = supports.length
      ? `<br><small>支援：${supports.map(item => escapeHtml(item.action)).join("；")}</small>`
      : "";
    return `<strong>主：${escapeHtml(primary.action)}</strong><br><small>${zoneName(primary.zone)} · 資源 ${orderTotalResource(order)}/${ORDER_BUDGET}</small>${supportText}`;
  }

  function renderLibrary() {
    const query = $("librarySearch").value.trim().toLowerCase();
    const tab = state.currentLibrary;
    let headers = [];
    let rows = [];
    let rowClass = "";

    if (tab === "sources") {
      headers = ["來源", "發布者", "類別", "存取", "用途", "限制"];
      rows = DATA.publicSources.filter(row => matchesQuery(row, query)).map(row => [
        `<a href="${escapeAttr(row.url)}" target="_blank" rel="noopener">${escapeHtml(row.name)}</a>`,
        escapeHtml(row.publisher), escapeHtml(row.category), escapeHtml(row.access_type),
        escapeHtml(row.suggested_use), escapeHtml(row.limitations)
      ]);
      rowClass = "real-row";
    } else if (tab === "capabilities") {
      headers = ["能力名稱", "角色", "領域", "任務", "感測", "涵蓋", "生存", "持續", "備註"];
      rows = DATA.capabilities.filter(row => matchesQuery(row, query)).map(row => [
        escapeHtml(row.capability_name), actorLabel(row.actor_id), escapeHtml(row.domain), escapeHtml(row.role),
        row.sensor_index, row.reach_index, row.survivability_index, row.sustainment_index, escapeHtml(row.note)
      ]);
      rowClass = "synthetic-row";
    } else if (tab === "forces") {
      headers = ["兵力包", "角色", "領域", "起始區域", "準備", "效果", "生存", "後勤", "指管"];
      rows = DATA.forcePackages.filter(row => matchesQuery(row, query)).map(row => [
        escapeHtml(row.package_name), actorLabel(row.actor_id), escapeHtml(row.domain), zoneName(row.start_zone),
        row.readiness, row.combat_effect, row.survivability, row.sustainment, row.command_quality
      ]);
      rowClass = "synthetic-row";
    } else {
      headers = ["日期", "軍機", "軍艦", "公務船", "越線／進入", "摘要"];
      rows = DATA.publicActivitySample.filter(row => matchesQuery(row, query)).map(row => [
        row.report_date, row.pla_aircraft, row.plan_ships, row.official_ships, row.aircraft_cross_or_enter, escapeHtml(row.summary)
      ]);
      rowClass = "real-row";
    }

    $("libraryContent").innerHTML = `
      <div class="card table-card">
        <div class="table-wrap">
          <table>
            <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
            <tbody>${rows.map(row => `<tr class="${rowClass}">${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
        </div>
        <p class="footnote">共 ${rows.length} 筆。公開來源僅作為背景與來源目錄；合成資料可自行修改。</p>
      </div>`;
  }

  function normalRandom(rng) {
    const u1 = Math.max(rng(), 1e-12);
    const u2 = Math.max(rng(), 1e-12);
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  function average(values) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  }

  function standardDeviation(values) {
    if (values.length < 2) return 0;
    const m = average(values);
    return Math.sqrt(values.reduce((sum, value) => sum + Math.pow(value - m, 2), 0) / (values.length - 1));
  }

  function quantile(values, probability) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const position = (sorted.length - 1) * probability;
    const lower = Math.floor(position);
    const upper = Math.ceil(position);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
  }

  function stormReadParams() {
    return {
      coa: $("stormCoa").value,
      replications: Number($("stormReplications").value),
      c2: Number($("stormC2").value),
      isr: Number($("stormIsr").value),
      readiness: Number($("stormReadiness").value),
      sustainment: Number($("stormSustainment").value),
      mobility: Number($("stormMobility").value),
      environment: Number($("stormEnvironment").value),
      pressure: Number($("stormPressure").value),
      civil: Number($("stormCivil").value),
      seed: Number($("stormSeed").value) || 20260727,
      threshold: Number($("stormThreshold").value)
    };
  }

  function simulateStormReplication(params, rng) {
    const coa = STORM_COAS[params.coa] || STORM_COAS.balanced;
    const c2 = clamp(params.c2 / 100 + coa.c2, .2, 1.1);
    const isr = clamp(params.isr / 100 + coa.isr, .2, 1.1);
    const readiness = clamp(params.readiness / 100 + coa.readiness, .2, 1.1);
    const sustainment = clamp(params.sustainment / 100 + coa.sustainment, .2, 1.1);
    const mobility = clamp(params.mobility / 100 + coa.mobility, .2, 1.1);
    const environment = params.environment / 5;
    const pressure = params.pressure / 5;
    const civilExposure = params.civil / 5;

    const intelligence = clamp(
      100 * (.54 * isr + .22 * c2 + .13 * mobility + .11 * sustainment - .16 * environment) +
      normalRandom(rng) * 5.5
    );
    const command = clamp(
      100 * (.58 * c2 + .16 * (intelligence / 100) + .14 * mobility + .12 * sustainment - .09 * pressure) +
      normalRandom(rng) * 4.3
    );
    const assets = clamp(
      100 * (.46 * readiness + .23 * sustainment + .16 * mobility + .15 * (command / 100) -
        .18 * pressure - .08 * environment) +
      normalRandom(rng) * 5.2
    );
    const interactions = clamp(
      100 * (.27 * (intelligence / 100) + .24 * (command / 100) + .27 * (assets / 100) +
        .22 * mobility - .25 * pressure - .11 * environment) +
      normalRandom(rng) * 6
    );
    const environmentScore = clamp(
      100 * (1 - .66 * environment + .12 * mobility + .09 * sustainment - .08 * pressure) +
      normalRandom(rng) * 4.2
    );

    const missionEffect = clamp(
      .20 * intelligence + .22 * command + .27 * assets + .19 * interactions + .12 * environmentScore +
      coa.mission * 100 + normalRandom(rng) * 2.2
    );
    const readinessRemaining = clamp(
      params.readiness + coa.readiness * 35 + params.sustainment * .11 + params.mobility * .04 -
      pressure * 19 - environment * 10 + normalRandom(rng) * 4.5
    );
    const resourceReserve = clamp(
      72 + params.sustainment * .19 + params.mobility * .05 - pressure * 19 - environment * 9 -
      coa.resourceCost + normalRandom(rng) * 4
    );
    const civilianRisk = clamp(
      10 + civilExposure * 38 + pressure * 23 + environment * 8 + coa.civilianDelta -
      intelligence * .09 - command * .07 + normalRandom(rng) * 4.5
    );
    const success = missionEffect >= params.threshold &&
      readinessRemaining >= 38 &&
      resourceReserve >= 20 &&
      civilianRisk < 85;

    return {
      missionEffect,
      readinessRemaining,
      resourceReserve,
      civilianRisk,
      success,
      representations: { command, assets, intelligence, interactions, environment: environmentScore }
    };
  }

  function stormBatch(params, replications = params.replications, seed = params.seed) {
    const rng = mulberry32(seed >>> 0);
    const runs = [];
    for (let i = 0; i < replications; i++) runs.push(simulateStormReplication(params, rng));
    const scores = runs.map(run => run.missionEffect);
    const sd = standardDeviation(scores);
    const ciHalf = 1.645 * sd / Math.sqrt(Math.max(1, runs.length));
    const contributionKeys = ["command", "assets", "intelligence", "interactions", "environment"];
    const contributions = Object.fromEntries(
      contributionKeys.map(key => [key, average(runs.map(run => run.representations[key]))])
    );
    return {
      params: { ...params },
      replications,
      scores,
      summary: {
        successRate: average(runs.map(run => run.success ? 1 : 0)),
        missionMean: average(scores),
        missionSd: sd,
        q05: quantile(scores, .05),
        median: quantile(scores, .5),
        q95: quantile(scores, .95),
        ciLow: average(scores) - ciHalf,
        ciHigh: average(scores) + ciHalf,
        readinessMean: average(runs.map(run => run.readinessRemaining)),
        resourceMean: average(runs.map(run => run.resourceReserve)),
        civilianMean: average(runs.map(run => run.civilianRisk))
      },
      contributions
    };
  }

  function stormSensitivity(params) {
    const factors = [
      ["c2", "C2品質", 10],
      ["isr", "ISR品質", 10],
      ["readiness", "資產準備度", 10],
      ["sustainment", "後勤持續性", 10],
      ["mobility", "機動能力", 10],
      ["environment", "環境嚴苛度", 1],
      ["pressure", "對手施壓", 1],
      ["civil", "民事暴露", 1]
    ];
    return factors.map(([key, label, delta], index) => {
      const low = { ...params, [key]: clamp(params[key] - delta, key === "environment" || key === "pressure" || key === "civil" ? 1 : 40, key === "environment" || key === "pressure" || key === "civil" ? 5 : 100) };
      const high = { ...params, [key]: clamp(params[key] + delta, key === "environment" || key === "pressure" || key === "civil" ? 1 : 40, key === "environment" || key === "pressure" || key === "civil" ? 5 : 100) };
      const lowMean = stormBatch(low, 70, params.seed + index * 101).summary.missionMean;
      const highMean = stormBatch(high, 70, params.seed + index * 101).summary.missionMean;
      return { key, label, effect: highMean - lowMean, lowMean, highMean };
    }).sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect));
  }

  function runStormExperiment(event) {
    if (event) event.preventDefault();
    const params = stormReadParams();
    const batch = stormBatch(params);
    batch.sensitivity = stormSensitivity(params);
    state.storm.lastExperiment = batch;
    if (!state.storm.comparison.length) compareStormCoas(false);
    saveState(false);
    renderStormResults();
    toast(`已完成 ${params.replications} 次合成重複。`);
  }

  function compareStormCoas(showMessage = true) {
    const base = stormReadParams();
    const replications = Math.min(200, Math.max(60, base.replications));
    state.storm.comparison = Object.keys(STORM_COAS).map(coa => {
      const result = stormBatch({ ...base, coa }, replications, base.seed);
      return { coa, ...result.summary };
    });
    saveState(false);
    renderStormComparison();
    if (showMessage) toast("已使用相同條件比較四種行動方案。");
  }

  function runStormDoe() {
    const base = stormReadParams();
    const levels = [-1, 1];
    const rows = [];
    let point = 1;
    levels.forEach(a => levels.forEach(b => levels.forEach(c => {
      const params = {
        ...base,
        c2: clamp(base.c2 + a * 10, 40, 100),
        isr: clamp(base.isr + b * 10, 40, 100),
        sustainment: clamp(base.sustainment + c * 10, 40, 100)
      };
      const result = stormBatch(params, Math.min(100, Math.max(40, base.replications)), base.seed);
      rows.push({
        point: point++,
        a, b, c,
        c2: params.c2,
        isr: params.isr,
        sustainment: params.sustainment,
        ...result.summary
      });
    })));

    const effect = signFn => {
      const high = rows.filter(signFn).map(row => row.missionMean);
      const low = rows.filter(row => !signFn(row)).map(row => row.missionMean);
      return average(high) - average(low);
    };
    const effects = [
      { label: "A：C2", effect: effect(row => row.a === 1) },
      { label: "B：ISR", effect: effect(row => row.b === 1) },
      { label: "C：後勤", effect: effect(row => row.c === 1) },
      { label: "AB：C2×ISR", effect: effect(row => row.a * row.b === 1) },
      { label: "AC：C2×後勤", effect: effect(row => row.a * row.c === 1) },
      { label: "BC：ISR×後勤", effect: effect(row => row.b * row.c === 1) },
      { label: "ABC：三因子", effect: effect(row => row.a * row.b * row.c === 1) }
    ].sort((x, y) => Math.abs(y.effect) - Math.abs(x.effect));

    state.storm.doe = { rows, effects, base };
    saveState(false);
    renderStormDoe();
    toast("已完成8個設計點的2³因子實驗。");
  }

  function stormLoadScenario() {
    if (!state.scenario) {
      toast("目前沒有想定可帶入。");
      return;
    }
    const blue = state.status.BLUE || initialStatus(state.scenario).BLUE;
    $("stormC2").value = Math.round(blue.command || 72);
    $("stormIsr").value = Math.round(blue.intel || 68);
    $("stormReadiness").value = Math.round(blue.readiness || 76);
    $("stormSustainment").value = Math.round(blue.sustainment || 74);
    $("stormMobility").value = Math.round(averageForActor("BLUE", "survivability") || 70);
    $("stormEnvironment").value = state.scenario.weatherPreset === "adverse" ? 4 : state.scenario.weatherPreset === "stable" ? 2 : 3;
    $("stormPressure").value = state.scenario.difficulty === "advanced" ? 4 : state.scenario.difficulty === "intro" ? 2 : 3;
    $("stormCivil").value = state.scenario.civilPressure || 3;
    $("stormSeed").value = state.scenario.seed || 20260727;
    $("stormThreshold").value = state.scenario.difficulty === "advanced" ? 64 : state.scenario.difficulty === "intro" ? 56 : 60;
    stormUpdateLabels();
    toast("已將目前想定的抽象狀態帶入STORM實驗室。");
  }

  function stormUpdateLabels() {
    [
      ["stormC2", "stormC2Value"],
      ["stormIsr", "stormIsrValue"],
      ["stormReadiness", "stormReadinessValue"],
      ["stormSustainment", "stormSustainmentValue"],
      ["stormMobility", "stormMobilityValue"],
      ["stormEnvironment", "stormEnvironmentValue"],
      ["stormPressure", "stormPressureValue"],
      ["stormCivil", "stormCivilValue"],
      ["stormThreshold", "stormThresholdValue"]
    ].forEach(([input, output]) => {
      if ($(input) && $(output)) $(output).value = $(input).value;
    });
  }

  function renderStormStage() {
    const key = state.storm.activeStage || "systems";
    const item = STORM_STAGES[key];
    document.querySelectorAll(".storm-flow-node").forEach(node => node.classList.toggle("active", node.dataset.stormStage === key));
    $("stormStageExplanation").innerHTML = `
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
      <p class="muted"><strong>${escapeHtml(item.question)}</strong></p>`;
  }

  function renderStormRepresentations() {
    const active = state.storm.activeRepresentation || "c2";
    $("stormRepresentations").innerHTML = Object.entries(STORM_REPRESENTATIONS).map(([key, item]) => `
      <button type="button" class="representation-card ${key === active ? "active" : ""}" data-representation="${key}">
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.subtitle)}</small>
      </button>`).join("");
    const item = STORM_REPRESENTATIONS[active];
    $("stormRepresentationDetail").innerHTML = `
      <div class="representation-detail-grid">
        <div><h3>模型責任</h3><p>${escapeHtml(item.description)}</p></div>
        <div><h3>示範資料</h3><ul class="compact-list">${item.data.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ul></div>
        <div><h3>分析提問</h3><p>${escapeHtml(item.classroom)}</p></div>
      </div>`;
  }

  function renderStormResults() {
    const result = state.storm.lastExperiment;
    const hasResult = !!result;
    $("stormEmptyResults").hidden = hasResult;
    $("stormResults").hidden = !hasResult;
    if (!hasResult) return;
    const s = result.summary;
    $("stormMetrics").innerHTML = `
      <article class="metric blue"><small>達成門檻機率</small><strong>${percent(s.successRate)}</strong><small>門檻 ${result.params.threshold} 分</small></article>
      <article class="metric blue"><small>平均任務效果</small><strong>${round1(s.missionMean)}</strong><small>90%平均值區間 ${round1(s.ciLow)}–${round1(s.ciHigh)}</small></article>
      <article class="metric amber"><small>平均剩餘準備</small><strong>${round1(s.readinessMean)}</strong><small>資源保留 ${round1(s.resourceMean)}</small></article>
      <article class="metric neutral"><small>平均民事風險</small><strong>${round1(s.civilianMean)}</strong><small>5–95百分位 ${round1(s.q05)}–${round1(s.q95)}</small></article>`;
    renderStormHistogram(result.scores);
    renderStormContributions(result.contributions);
    renderStormSensitivity(result.sensitivity || []);
    renderStormInterpretation(result);
    renderStormComparison();
  }

  function renderStormHistogram(scores) {
    const bins = Array(10).fill(0);
    scores.forEach(score => bins[Math.min(9, Math.max(0, Math.floor(score / 10)))]++);
    const maxCount = Math.max(...bins, 1);
    $("stormHistogram").innerHTML = bins.map((count, index) => {
      const height = Math.max(2, count / maxCount * 210);
      return `<div class="hist-bin" style="height:${height}px" title="${index * 10}–${index * 10 + 9}：${count}次">
        <i>${count}</i><span>${index * 10}–${index * 10 + 9}</span>
      </div>`;
    }).join("");
    const result = state.storm.lastExperiment;
    $("stormDistributionLabel").textContent = `5–95百分位 ${round1(result.summary.q05)}–${round1(result.summary.q95)}`;
  }

  function renderStormContributions(contributions) {
    const labels = {
      command: "指揮管制",
      assets: "資產狀態",
      intelligence: "情報圖像",
      interactions: "互動效果",
      environment: "環境適應"
    };
    $("stormContributionBars").innerHTML = Object.entries(contributions).map(([key, value]) => `
      <div class="bar-row">
        <span>${labels[key]}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${clamp(value)}%"></div></div>
        <strong>${round1(value)}</strong>
      </div>`).join("");
  }

  function renderStormSensitivity(items) {
    const maxAbs = Math.max(...items.map(item => Math.abs(item.effect)), 1);
    $("stormSensitivity").innerHTML = items.map(item => {
      const width = Math.abs(item.effect) / maxAbs * 48;
      const left = item.effect >= 0 ? 50 : 50 - width;
      return `<div class="sensitivity-row">
        <span>${escapeHtml(item.label)}</span>
        <div class="sensitivity-track"><div class="sensitivity-mark" style="left:${left}%;width:${width}%"></div></div>
        <strong>${item.effect >= 0 ? "+" : ""}${round1(item.effect)}</strong>
      </div>`;
    }).join("");
  }

  function renderStormInterpretation(result) {
    const s = result.summary;
    const top = result.sensitivity?.[0];
    const messages = [];
    messages.push(`本方案在 ${result.replications} 次重複中的平均任務效果為 ${round1(s.missionMean)}，但中間90%的結果約落在 ${round1(s.q05)} 至 ${round1(s.q95)}。`);
    if (s.q05 < result.params.threshold) messages.push("即使平均值高於門檻，低端結果仍可能失敗；應檢查韌性與備援，而不是只追求平均。");
    if (s.ciHigh - s.ciLow > 4) messages.push("平均值區間仍較寬，可增加重複次數後再比較方案。");
    else messages.push("平均值估計已相對穩定，但這不代表模型假設正確，仍需做驗證與敏感度分析。");
    if (top) messages.push(`目前最敏感的因素是「${top.label}」；在本實驗範圍內，高低水準使平均任務效果改變約 ${Math.abs(round1(top.effect))} 分。`);
    if (s.civilianMean > 60) messages.push("民事風險偏高。即使任務效果良好，也應重新檢查成功定義是否忽略政治與人道成本。");
    $("stormInterpretation").innerHTML = `<ol class="storm-interpretation-list">${messages.map(m => `<li>${escapeHtml(m)}</li>`).join("")}</ol>`;
  }

  function renderStormComparison() {
    const body = $("stormComparisonBody");
    if (!body) return;
    const rows = state.storm.comparison || [];
    body.innerHTML = rows.length ? rows.map(row => {
      const coa = STORM_COAS[row.coa];
      return `<tr>
        <td><strong>${escapeHtml(coa.label)}</strong></td>
        <td>${percent(row.successRate)}</td>
        <td>${round1(row.missionMean)}</td>
        <td>${round1(row.readinessMean)}</td>
        <td>${round1(row.resourceMean)}</td>
        <td>${round1(row.civilianMean)}</td>
        <td>${escapeHtml(coa.tradeoff)}</td>
      </tr>`;
    }).join("") : `<tr><td colspan="7" class="muted">按「比較四種COA」產生比較結果。</td></tr>`;
  }

  function renderStormDoe() {
    const doe = state.storm.doe;
    $("stormDoeTableCard").hidden = !doe;
    if (!doe) {
      $("stormDoeSummary").innerHTML = `<p class="muted">尚未執行因子實驗。</p>`;
      return;
    }
    const topEffects = doe.effects.slice(0, 4);
    $("stormDoeSummary").innerHTML = `
      <h3>效果排序</h3>
      <ol class="compact-list">${topEffects.map(item => `<li><strong>${escapeHtml(item.label)}</strong>：${item.effect >= 0 ? "+" : ""}${round1(item.effect)} 分</li>`).join("")}</ol>
      <p class="footnote">效果值是高水準平均減低水準平均；交互作用較大時，表示因素效果可能依另一因素水準而改變。</p>`;
    $("stormDoeBody").innerHTML = doe.rows.map(row => `
      <tr>
        <td>${row.point}</td>
        <td>${row.c2}（${row.a > 0 ? "高" : "低"}）</td>
        <td>${row.isr}（${row.b > 0 ? "高" : "低"}）</td>
        <td>${row.sustainment}（${row.c > 0 ? "高" : "低"}）</td>
        <td>${round1(row.missionMean)}</td>
        <td>${percent(row.successRate)}</td>
        <td>${round1(row.civilianMean)}</td>
      </tr>`).join("");
  }

  function renderStorm() {
    if (!state.storm) {
      state.storm = { activeStage: "systems", activeRepresentation: "c2", lastExperiment: null, comparison: [], doe: null };
    }
    stormUpdateLabels();
    renderStormStage();
    renderStormRepresentations();
    renderStormResults();
    renderStormDoe();
  }

  function matchesQuery(row, query) {
    if (!query) return true;
    return Object.values(row).some(value => String(value ?? "").toLowerCase().includes(query));
  }

  function saveState(showToast = true) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        scenario: state.scenario,
        currentTurn: state.currentTurn,
        status: state.status,
        orders: state.orders,
        logs: state.logs,
        revealedIntel: state.revealedIntel,
        aarReview: state.aarReview,
        storm: state.storm
      }));
      if (showToast) toast("進度已儲存在此瀏覽器。");
      return true;
    } catch {
      if (showToast) toast("瀏覽器禁止本機儲存；請使用「匯出 JSON」保存進度。");
      return false;
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed.scenario) return false;
      Object.assign(state, parsed);
      ensureScenarioResources(state.scenario);
      hydrateInventoryFormFromScenario(state.scenario);
      state.aarReview ||= { turn: null, tab: "intel" };
      state.storm ||= { activeStage: "systems", activeRepresentation: "c2", lastExperiment: null, comparison: [], doe: null };
      renderScenario();
      renderSimulation();
      renderStorm();
      renderAAR();
      return true;
    } catch {
      return false;
    }
  }

  function resetRun() {
    if (!state.scenario) return;
    if (!confirm("確定要清除目前回合紀錄並重新開始嗎？")) return;
    state.currentTurn = 1;
    state.scenario.events = state.scenario.events.filter(event => !event.nextTurnGenerated);
    state.scenario.intel = state.scenario.intel.filter(report => !report.nextTurnGenerated);
    state.scenario.nextTurnPackages = [];
    if (state.scenario.inventoryEnabled) {
      state.scenario.detailedInventory = (state.scenario.initialDetailedInventory || state.scenario.detailedInventory)
        .map((row, index) => sanitizeInventoryRow({ ...row, current: row.nominal, replenishmentApplied: false }, index));
      state.scenario.resourceLedger = [];
      state.scenario.abstractResources = calculateAbstractInventory(state.scenario.detailedInventory);
      state.scenario.resourceBalance = calculateCombinedResourceBalance(state.scenario.resources, state.scenario.abstractResources);
    }
    state.status = initialStatus(state.scenario);
    state.orders = {};
    state.logs = [];
    state.aarReview = { turn: null, tab: "intel" };
    saveState(false);
    renderSimulation();
    renderAAR();
    toast("推演已重設。");
  }

  function clearScenario() {
    if (!state.scenario) return;
    if (!confirm("確定要清除目前想定、回合紀錄與已儲存進度嗎？此操作無法復原。")) return;
    state.scenario = null;
    state.currentTurn = 1;
    state.status = {};
    state.orders = {};
    state.logs = [];
    state.revealedIntel = [];
    state.aarReview = { turn: null, tab: "intel" };
    state.storm = { activeStage: "systems", activeRepresentation: "c2", lastExperiment: null, comparison: [], doe: null };
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* State is still cleared for this session. */ }
    renderScenario();
    renderSimulation();
    renderStorm();
    renderAAR();
    setTab("builder");
    toast("想定與推演進度已清除。");
  }

  function download(name, content, type = "application/json") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function exportJSON() {
    if (!state.scenario) return toast("目前沒有可匯出的想定。");
    const payload = {
      app: "Taiwan Strait Scenario Generator with STORM Teaching Lab",
      version: "3.0",
      exportedAt: new Date().toISOString(),
      safetyClass: "EDUCATIONAL_SYNTHETIC",
      scenario: state.scenario,
      currentTurn: state.currentTurn,
      status: state.status,
      orders: state.orders,
      logs: state.logs,
      aarReview: state.aarReview,
      storm: state.storm
    };
    download(`${safeFileName(state.scenario.name)}.json`, JSON.stringify(payload, null, 2));
  }

  function importJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        if (!payload.scenario || payload.safetyClass !== "EDUCATIONAL_SYNTHETIC") {
          throw new Error("不是本系統的合成資料格式");
        }
        state.scenario = ensureScenarioResources(payload.scenario);
        hydrateInventoryFormFromScenario(state.scenario);
        state.currentTurn = payload.currentTurn || 1;
        state.status = payload.status || initialStatus(payload.scenario);
        state.orders = payload.orders || {};
        state.logs = payload.logs || [];
        state.aarReview = payload.aarReview || { turn: null, tab: "intel" };
        state.storm = payload.storm || { activeStage: "systems", activeRepresentation: "c2", lastExperiment: null, comparison: [], doe: null };
        saveState(false);
        renderScenario();
        renderSimulation();
        renderStorm();
        renderAAR();
        toast("想定與推演紀錄已匯入。");
      } catch (error) {
        toast(`匯入失敗：${error.message}`);
      }
    };
    reader.readAsText(file);
  }

  function exportCSV() {
    if (!state.logs.length) return toast("尚無回合紀錄。");
    const header = ["turn","elapsed_hours","event","blue_primary","blue_supports","blue_resource_total","red_primary","red_supports","red_resource_total","amber_primary","amber_supports","amber_resource_total","blue_readiness","red_readiness","civilian_risk","outcome","key_risk"];
    const lines = [header.join(",")];
    state.logs.forEach(log => {
      const values = [
        log.turn, log.elapsedHours, log.event,
        orderPrimary(log.orders.BLUE).action, orderSupports(log.orders.BLUE).map(item => item.action).join("；"), orderTotalResource(log.orders.BLUE),
        orderPrimary(log.orders.RED).action, orderSupports(log.orders.RED).map(item => item.action).join("；"), orderTotalResource(log.orders.RED),
        log.orders.AMBER ? orderPrimary(log.orders.AMBER).action : "", log.orders.AMBER ? orderSupports(log.orders.AMBER).map(item => item.action).join("；") : "", log.orders.AMBER ? orderTotalResource(log.orders.AMBER) : "",
        log.statusAfter.BLUE.readiness, log.statusAfter.RED.readiness, log.statusAfter.BLUE.civilianRisk,
        log.outcome, log.keyRisk
      ];
      lines.push(values.map(csvEscape).join(","));
    });
    download(`${safeFileName(state.scenario.name)}-AAR.csv`, "\ufeff" + lines.join("\n"), "text/csv;charset=utf-8");
  }

  function safeFileName(name) {
    return name.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80);
  }

  function csvEscape(value) {
    const s = String(value ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function parseCsvRows(text) {
    const rows = [];
    let row = [], field = "", quoted = false;
    const source = String(text || "").replace(/^\ufeff/, "");
    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      if (char === '"') {
        if (quoted && source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (char === "," && !quoted) {
        row.push(field);
        field = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && source[index + 1] === "\n") index += 1;
        row.push(field);
        if (row.some(value => value.trim())) rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }
    row.push(field);
    if (row.some(value => value.trim())) rows.push(row);
    return rows;
  }

  function exportInventoryCsv() {
    const header = ["actor","alias","category","nominal","availability_pct","reserve_pct","consumption_per_action","recovery_per_turn","replenishment","delay_turns","reliability_pct","note"];
    const lines = [header.join(",")];
    readDetailedInventoryRows().forEach(row => {
      lines.push([
        row.actor, row.alias, row.category, row.nominal, row.availability, row.reserve,
        row.consumption, row.recovery, row.replenishment, row.delay, row.reliability, row.note
      ].map(csvEscape).join(","));
    });
    download("educational-named-resource-inventory.csv", "\ufeff" + lines.join("\n"), "text/csv;charset=utf-8");
  }

  function importInventoryCsv(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const [header, ...data] = parseCsvRows(reader.result);
        const keys = header.map(value => value.trim().toLowerCase());
        const required = ["actor", "alias", "category", "nominal"];
        if (!required.every(key => keys.includes(key))) throw new Error(`缺少必要欄位：${required.join(", ")}`);
        const get = (row, key, fallback = "") => {
          const index = keys.indexOf(key);
          return index >= 0 ? row[index] : fallback;
        };
        const rows = data.slice(0, 200).map((values, index) => sanitizeInventoryRow({
          actor: get(values, "actor"),
          alias: get(values, "alias"),
          category: get(values, "category"),
          nominal: get(values, "nominal"),
          availability: get(values, "availability_pct", 100),
          reserve: get(values, "reserve_pct", 20),
          consumption: get(values, "consumption_per_action", 1),
          recovery: get(values, "recovery_per_turn", 0),
          replenishment: get(values, "replenishment", 0),
          delay: get(values, "delay_turns", 0),
          reliability: get(values, "reliability_pct", 85),
          note: get(values, "note", "")
        }, index));
        if (!rows.length) throw new Error("CSV 沒有可匯入的資料列");
        renderDetailedInventoryRows(rows);
        toast(`已匯入 ${rows.length} 項資源。`);
      } catch (error) {
        toast(`資源 CSV 匯入失敗：${error.message}`);
      } finally {
        $("inventoryCsvInput").value = "";
      }
    };
    reader.readAsText(file);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function percent(v) {
    return `${Math.round(v * 1000) / 10}%`;
  }

  const LLM_PRESETS = {
    gemini: { model: "gemini-3.5-flash", label: "Gemini", endpoint: "https://generativelanguage.googleapis.com/v1beta", models: ["gemini-3.5-flash", "gemini-3.6-flash"] },
    openai: { model: "gpt-5.5", label: "OpenAI", endpoint: "https://api.openai.com/v1", models: ["gpt-5.4-mini", "gpt-5.5", "gpt-5.6"] },
    claude: { model: "claude-sonnet-4-20250514", label: "Claude", endpoint: "https://api.anthropic.com/v1", models: ["claude-sonnet-4-20250514"] },
    cgu: { model: "gpt-5.4-mini", label: "長庚 CGU LLM API", endpoint: "https://air.cgu.edu.tw/cgullmapi/v1", models: ["gpt-5.4-mini", "gpt-5.5", "gpt-5.6"] }
  };

  function updateLlmProvider(preserveValues = false) {
    const provider = $("llmProvider").value;
    const preset = LLM_PRESETS[provider];
    if (!preserveValues) {
      $("llmEndpoint").value = preset.endpoint;
      $("llmModel").value = preset.model;
    }
    $("llmModelOptions").innerHTML = preset.models.map(model => `<option value="${escapeAttr(model)}"></option>`).join("");
  }

  function saveLlmSettings() {
    const settings = {
      provider: $("llmProvider").value,
      model: $("llmModel").value,
      reasoning: $("llmReasoning").value,
      apiKey: $("llmApiKey").value,
      endpoint: $("llmEndpoint").value,
      instruction: $("llmInstruction").value,
      panelOpen: $("llmPanel").open
    };
    try { localStorage.setItem(LLM_SETTINGS_KEY, JSON.stringify(settings)); } catch { toast("無法寫入瀏覽器 localStorage。") }
  }

  function loadLlmSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(LLM_SETTINGS_KEY) || "{}");
      if (saved.provider && LLM_PRESETS[saved.provider]) $("llmProvider").value = saved.provider;
      updateLlmProvider(true);
      if (saved.model) $("llmModel").value = saved.model;
      if (["minimal", "low", "medium", "high"].includes(saved.reasoning)) $("llmReasoning").value = saved.reasoning;
      if (saved.apiKey) $("llmApiKey").value = saved.apiKey;
      if (saved.endpoint) $("llmEndpoint").value = saved.endpoint;
      if (typeof saved.instruction === "string") $("llmInstruction").value = saved.instruction;
      $("llmPanel").open = true;
    } catch { /* Ignore malformed or unavailable browser storage. */ }
  }

  function clearLlmKey() {
    $("llmApiKey").value = "";
    saveLlmSettings();
    $("llmStatus").textContent = "已清除儲存在此瀏覽器的 API Key。";
    toast("已清除 API Key。");
  }

  function llmPrompt(formValues) {
    const baseline = generateScenario(formValues);
    return `你是想定編輯器。只可使用下列「完全合成、虛構」資料，不能補入真實世界的部隊、武器型號、地點、座標、射程、性能、部署或目標資訊。請以繁體中文回傳嚴格 JSON，且不要使用 Markdown。\n\nJSON schema:\n{"name":"40字內、明確對應所選情境範本的想定名稱","overview":"120字內情境摘要","objectives":["3項"],"successCriteria":["3項"],"constraints":["3至5項"],"eventIdeas":["3項不涉及真實武器或地點的事件名稱"]}\n\n所選情境範本：${JSON.stringify({ key: formValues.template, templateName: SCENARIO_TEMPLATES[formValues.template]?.name, templateDescription: SCENARIO_TEMPLATES[formValues.template]?.overview })}\n想定設定：${JSON.stringify({ name: baseline.name, focus: baseline.focusTitle, difficulty: baseline.difficultyLabel, turns: baseline.turns, hoursPerTurn: baseline.hoursPerTurn, uncertainty: baseline.uncertainty, civilPressure: baseline.civilPressure, amberSupport: baseline.amberSupport, weather: baseline.weatherPreset, abstractResources: baseline.inventoryEnabled ? sanitizedAbstractSummary(baseline.abstractResources) : null, syntheticLegacyResources: baseline.inventoryEnabled ? null : baseline.resources, strategicParameters: baseline.strategicParameters, teacherConstraints: formValues.teacherConstraints })}\n\n額外指示：${$("llmInstruction").value.trim() || "無"}\n\n名稱與敘事必須維持所選範本的核心主題，不得改成無關情境。敘事要強調資源保存、資訊不確定性、民事影響與升級控制；不得提出可執行的現實作戰建議。`;
  }

  function extractJson(text) {
    const clean = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start < 0 || end < start) throw new Error("API 未回傳 JSON 物件");
    return JSON.parse(clean.slice(start, end + 1));
  }

  function responseText(data) {
    return data.output_text || data.output?.flatMap(item => item.content || []).map(part => part.text || "").join("") || "";
  }

  function normalizeResponsesEndpoint(endpoint) {
    const base = String(endpoint || "").trim().replace(/\/+$/, "");
    return /\/responses$/i.test(base) ? base : `${base}/responses`;
  }

  function normalizeMessagesEndpoint(endpoint) {
    const base = String(endpoint || "").trim().replace(/\/+$/, "");
    return /\/messages$/i.test(base) ? base : `${base}/messages`;
  }

  function authorizationHeader(apiKey) {
    return /^Bearer\s+/i.test(apiKey) ? apiKey : `Bearer ${apiKey}`;
  }

  async function requestLlm(provider, model, apiKey, prompt, reasoning) {
    const endpointBase = $("llmEndpoint").value.trim().replace(/\/+$/, "");
    if (!/^https:\/\//i.test(endpointBase)) throw new Error("請輸入所選供應商的 HTTPS API Endpoint");
    if (provider === "gemini") {
      const endpoint = `${endpointBase}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.7 } }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || `Gemini HTTP ${response.status}`);
      return data?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") || "";
    }
    if (provider === "openai") {
      const response = await fetch(normalizeResponsesEndpoint(endpointBase), { method: "POST", headers: { "Content-Type": "application/json", "Authorization": authorizationHeader(apiKey) }, body: JSON.stringify({ model, input: prompt, reasoning: { effort: reasoning }, text: { format: { type: "json_object" } } }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || `OpenAI HTTP ${response.status}`);
      return responseText(data);
    }
    if (provider === "claude") {
      const response = await fetch(normalizeMessagesEndpoint(endpointBase), { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model, max_tokens: 1200, temperature: 0.7, messages: [{ role: "user", content: prompt }] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || `Claude HTTP ${response.status}`);
      return data.content?.map(part => part.text || "").join("") || "";
    }
    const endpoint = normalizeResponsesEndpoint(endpointBase);
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": authorizationHeader(apiKey) }, body: JSON.stringify({ model, store: false, input: prompt, reasoning: { effort: reasoning }, text: { format: { type: "json_object" } } }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || `相容 API HTTP ${response.status}`);
    return responseText(data);
  }

  function cleanLlmList(value, fallback, max) {
    if (!Array.isArray(value)) return fallback;
    const cleaned = value.map(item => String(item || "").replace(/[\r\n]+/g, " ").trim()).filter(Boolean).slice(0, max);
    return cleaned.length ? cleaned : fallback;
  }

  async function generateWithLlm() {
    const apiKey = $("llmApiKey").value.trim();
    if (!apiKey) return toast("請輸入 API Key；可保存在此瀏覽器並隨時清除。");
    const provider = $("llmProvider").value;
    const button = $("generateWithLlmBtn");
    const status = $("llmStatus");
    const formValues = readScenarioForm();
    button.disabled = true;
    status.textContent = `正在向 ${LLM_PRESETS[provider].label} 請求合成想定…`;
    try {
      saveLlmSettings();
      const result = extractJson(await requestLlm(provider, $("llmModel").value.trim(), apiKey, llmPrompt(formValues), $("llmReasoning").value));
      const scenario = generateScenario(formValues);
      scenario.name = String(result.name || scenario.name).replace(/[\r\n]+/g, " ").trim().slice(0, 100) || scenario.name;
      scenario.overview = String(result.overview || scenario.overview).slice(0, 500);
      scenario.objectives = cleanLlmList(result.objectives, scenario.objectives, 4);
      scenario.successCriteria = cleanLlmList(result.successCriteria, scenario.successCriteria, 4);
      scenario.constraints = [...scenario.constraints, ...cleanLlmList(result.constraints, [], 5)].slice(0, 7);
      scenario.llmNarrative = { provider: LLM_PRESETS[provider].label, model: $("llmModel").value.trim(), reasoning: $("llmReasoning").value, eventIdeas: cleanLlmList(result.eventIdeas, [], 4) };
      $("scenarioName").value = scenario.name;
      beginScenario(scenario);
      status.textContent = `已使用 ${scenario.llmNarrative.provider} 生成名稱與敘事；API Key 已保存於此瀏覽器，可手動清除。`;
    } catch (error) {
      status.textContent = "生成失敗。";
      toast(`LLM 生成失敗：${error.message}`);
    } finally { button.disabled = false; }
  }

  function bindEvents() {
    document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => setTab(btn.dataset.tab)));
    $("sectionNavigatorLinks").addEventListener("click", event => {
      const button = event.target.closest("[data-section-target]");
      const target = button ? $(button.dataset.sectionTarget) : null;
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      $("sectionNavigatorLinks").querySelectorAll("[data-section-target]").forEach(item => {
        item.classList.toggle("active", item === button);
      });
    });
    window.addEventListener("scroll", scheduleSectionNavigatorUpdate, { passive: true });
    window.addEventListener("resize", scheduleSectionNavigatorUpdate);
    document.querySelectorAll(".library-tabs .mini-tab").forEach(btn => btn.addEventListener("click", () => {
      document.querySelectorAll(".library-tabs .mini-tab").forEach(b => b.classList.toggle("active", b === btn));
      state.currentLibrary = btn.dataset.library;
      renderLibrary();
    }));

    $("scenarioForm").addEventListener("submit", event => {
      event.preventDefault();
      beginScenario(generateScenario(readScenarioForm()));
    });
    $("loadDemoBtn").addEventListener("click", () => {
      $("scenarioTemplate").value = "blockade";
      $("scenarioName").value = "海峽警戒與有限封控：72小時聯合決策演練";
      $("scenarioSeed").value = 20260727;
      $("focus").value = "joint";
      $("difficulty").value = "standard";
      $("turns").value = 12;
      $("hoursPerTurn").value = 6;
      $("uncertainty").value = 3;
      $("civilPressure").value = 3;
      $("amberSupport").value = "indirect";
      $("weatherPreset").value = "variable";
      $("turnOrderMode").value = "simultaneous";
      $("firstOrderVisibility").value = "sealed";
      updateTurnOrderSettings();
      Object.entries(STRATEGIC_DEFAULTS).forEach(([key, value]) => { if ($(key)) $(key).value = value; });
      $("blueAircraft").value = 48;
      $("blueInterceptors").value = 160;
      $("blueVessels").value = 14;
      $("blueLogistics").value = 72;
      $("blueDrones").value = 120;
      $("starlinkNodes").value = 24;
      $("highAltitudePlatforms").value = 6;
      $("redAircraft").value = 96;
      $("redIncoming").value = 180;
      $("redVessels").value = 24;
      $("redLogistics").value = 84;
      $("enableDetailedInventory").checked = true;
      $("inventoryDataMode").value = "synthetic";
      $("useLlmNextTurn").checked = true;
      $("allowSanitizedLlm").checked = true;
      renderDetailedInventoryRows(inventoryTemplateRows());
      updateRangeLabels();
      renderTemplateInfo();
      beginScenario(generateScenario(readScenarioForm()));
    });
    $("uncertainty").addEventListener("input", updateRangeLabels);
    $("civilPressure").addEventListener("input", updateRangeLabels);
    $("turnOrderMode").addEventListener("change", updateTurnOrderSettings);
    $("scenarioTemplate").addEventListener("change", applyScenarioTemplate);
    $("detailedInventoryRows").addEventListener("input", syncDetailedInventoryPreview);
    $("detailedInventoryRows").addEventListener("change", syncDetailedInventoryPreview);
    $("detailedInventoryRows").addEventListener("click", event => {
      const button = event.target.closest(".remove-inventory-row");
      if (!button) return;
      button.closest("tr").remove();
      syncDetailedInventoryPreview();
    });
    $("addInventoryRowBtn").addEventListener("click", () => {
      const rows = readDetailedInventoryRows();
      rows.push(sanitizeInventoryRow({ actor: "BLUE", category: "logistics", nominal: 10, availability: 100, reserve: 20, consumption: 1, reliability: 85 }, rows.length));
      renderDetailedInventoryRows(rows);
    });
    $("loadInventoryTemplateBtn").addEventListener("click", () => {
      renderDetailedInventoryRows(inventoryTemplateRows());
      toast("已載入公開裝備名稱與合成遊戲參數。");
    });
    $("exportInventoryCsvBtn").addEventListener("click", exportInventoryCsv);
    $("inventoryCsvInput").addEventListener("change", event => importInventoryCsv(event.target.files[0]));
    ["enableDetailedInventory", "inventoryDataMode", "useLlmNextTurn", "allowSanitizedLlm"]
      .forEach(id => $(id).addEventListener("change", syncInventoryPrivacy));
    $("llmProvider").addEventListener("change", () => { updateLlmProvider(false); saveLlmSettings(); });
    $("llmModel").addEventListener("input", saveLlmSettings);
    $("llmReasoning").addEventListener("change", saveLlmSettings);
    $("llmApiKey").addEventListener("input", saveLlmSettings);
    $("llmEndpoint").addEventListener("input", saveLlmSettings);
    $("llmInstruction").addEventListener("input", saveLlmSettings);
    $("llmPanel").addEventListener("toggle", saveLlmSettings);
    $("generateWithLlmBtn").addEventListener("click", generateWithLlm);
    $("clearLlmKeyBtn").addEventListener("click", clearLlmKey);
    $("orderActor").addEventListener("change", updateActionOptions);
    $("addSupportActionBtn").addEventListener("click", () => {
      const host = $("supportActionsList");
      const draft = host._draft || { actor: $("orderActor").value, supports: readSupportActions() };
      draft.supports = readSupportActions();
      if (draft.supports.length < MAX_SUPPORT_ACTIONS) draft.supports.push(defaultOrderItem(draft.actor));
      host._draft = draft;
      renderSupportActions();
    });
    $("supportActionsList").addEventListener("input", updateOrderBudget);
    $("supportActionsList").addEventListener("change", updateOrderBudget);
    $("supportActionsList").addEventListener("click", event => {
      const button = event.target.closest(".remove-support-action");
      if (!button || button.disabled) return;
      const host = $("supportActionsList");
      const draft = host._draft || { actor: $("orderActor").value, supports: readSupportActions() };
      draft.supports = readSupportActions();
      draft.supports.splice(Number(button.closest(".support-action").dataset.supportIndex), 1);
      host._draft = draft;
      renderSupportActions();
    });
    ["orderResource", "orderPriority", "orderRisk", "orderCondition"].forEach(id => $(id).addEventListener("input", updateOrderBudget));
    $("orderForm").addEventListener("submit", submitOrder);
    $("eventPanel").addEventListener("submit", event => {
      if (event.target.id === "whiteEventForm") publishWhiteEvent(event);
    });
    $("autoOrdersBtn").addEventListener("click", autoFillOrders);
    $("resolveTurnBtn").addEventListener("click", resolveTurn);
    $("operationToggleVisibilityBtn").addEventListener("click", toggleOperationTheaterVisibility);
    $("operationFullscreenBtn").disabled = !document.fullscreenEnabled;
    $("operationFullscreenBtn").addEventListener("click", toggleOperationFullscreen);
    document.addEventListener("fullscreenchange", syncOperationFullscreen);
    document.addEventListener("fullscreenchange", syncAarReplayFullscreen);
    $("operationReplayBtn").addEventListener("click", () => startOperationAnimation(true));
    $("operationPauseBtn").addEventListener("click", toggleOperationAnimation);
    $("operationSpeed").addEventListener("change", setOperationSpeed);
    window.addEventListener("resize", () => {
      if (operationAnimation.scene || state.scenario) {
        drawOperationFrame(operationAnimation.elapsed, operationAnimation.scene);
      }
      if ($("aarReplayCanvas")) drawAarReplayFrame();
    });
    $("clearRunBtn").addEventListener("click", resetRun);
    $("saveBtn").addEventListener("click", () => saveState(true));
    $("exportBtn").addEventListener("click", exportJSON);
    $("importInput").addEventListener("change", event => importJSON(event.target.files[0]));
    $("exportCsvBtn").addEventListener("click", exportCSV);
    $("printBtn").addEventListener("click", () => window.print());
    $("aarReviewTurnSelect").addEventListener("change", event => selectAarReviewTurn(event.target.value));
    $("aarReviewPrevBtn").addEventListener("click", () => {
      const turns = state.logs.map(log => Number(log.turn));
      const index = turns.indexOf(Number(state.aarReview?.turn));
      if (index > 0) selectAarReviewTurn(turns[index - 1]);
    });
    $("aarReviewNextBtn").addEventListener("click", () => {
      const turns = state.logs.map(log => Number(log.turn));
      const index = turns.indexOf(Number(state.aarReview?.turn));
      if (index >= 0 && index < turns.length - 1) selectAarReviewTurn(turns[index + 1]);
    });
    $("aarReviewTabs").addEventListener("click", event => {
      const button = event.target.closest("[data-aar-review-tab]");
      if (!button) return;
      state.aarReview ||= { turn: null, tab: "intel" };
      state.aarReview.tab = button.dataset.aarReviewTab;
      renderAarReview();
    });
    $("aarReviewContent").addEventListener("click", event => {
      if (event.target.closest("#aarReplayBtn")) startAarReplayAnimation(true);
      else if (event.target.closest("#aarReplayPauseBtn")) toggleAarReplayAnimation();
      else if (event.target.closest("#aarReplayFullscreenBtn")) toggleAarReplayFullscreen();
    });
    $("aarReviewContent").addEventListener("change", event => {
      if (event.target.id === "aarReplaySpeed") setAarReplaySpeed();
    });
    $("timelineBody").addEventListener("click", event => {
      const button = event.target.closest("[data-review-turn]");
      if (button) selectAarReviewTurn(button.dataset.reviewTurn, true);
    });
    $("librarySearch").addEventListener("input", renderLibrary);
    ["labIncoming","labShots","labBaseP","labDetection","labReadiness","labSea","labJamming"]
      .forEach(id => $(id).addEventListener("input", updateLab));

    document.querySelectorAll(".storm-flow-node").forEach(node => node.addEventListener("click", () => {
      state.storm.activeStage = node.dataset.stormStage;
      renderStormStage();
    }));
    $("stormRepresentations").addEventListener("click", event => {
      const button = event.target.closest("[data-representation]");
      if (!button) return;
      state.storm.activeRepresentation = button.dataset.representation;
      renderStormRepresentations();
    });
    $("stormExperimentForm").addEventListener("submit", runStormExperiment);
    $("stormLoadScenarioBtn").addEventListener("click", stormLoadScenario);
    $("stormCompareBtn").addEventListener("click", () => compareStormCoas(true));
    $("stormDoeBtn").addEventListener("click", runStormDoe);
    ["stormC2","stormIsr","stormReadiness","stormSustainment","stormMobility","stormEnvironment","stormPressure","stormCivil","stormThreshold"]
      .forEach(id => $(id).addEventListener("input", stormUpdateLabels));
  }

  function updateRangeLabels() {
    $("uncertaintyValue").value = $("uncertainty").value;
    $("civilPressureValue").value = $("civilPressure").value;
  }

  function updateTurnOrderSettings() {
    const simultaneous = $("turnOrderMode").value === "simultaneous";
    $("firstOrderVisibility").disabled = simultaneous;
    if (simultaneous) $("firstOrderVisibility").value = "sealed";
  }

  function applyScenarioTemplate() {
    const template = SCENARIO_TEMPLATES[$("scenarioTemplate").value];
    if (!template) return;
    $("scenarioName").value = template.name;
    $("focus").value = template.focus;
    $("difficulty").value = template.difficulty;
    $("turns").value = template.turns;
    $("hoursPerTurn").value = template.hoursPerTurn || 6;
    $("uncertainty").value = template.uncertainty || 3;
    $("civilPressure").value = template.civilPressure || 3;
    $("amberSupport").value = template.amberSupport;
    $("weatherPreset").value = template.weatherPreset;
    $("turnOrderMode").value = template.turnOrderMode || "simultaneous";
    $("firstOrderVisibility").value = template.firstOrderVisibility || "sealed";
    updateTurnOrderSettings();
    const parameters = { ...STRATEGIC_DEFAULTS, ...(template.parameters || {}) };
    Object.entries(parameters).forEach(([key, value]) => { if ($(key)) $(key).value = value; });
    updateRangeLabels();
    updateTurnOrderSettings();
    renderTemplateInfo();
    toast(`已套用「${$("scenarioTemplate").selectedOptions[0].textContent}」範本。`);
  }

  function renderTemplateInfo() {
    const template = SCENARIO_TEMPLATES[$("scenarioTemplate").value];
    const container = $("scenarioTemplateInfo");
    if (!template || !container) return;
    const references = Array.isArray(template.references) ? template.references : [];
    const sourceHtml = references.length
      ? `<p class="template-sources"><strong>參考資料：</strong>${references.map(reference => `<a href="${escapeAttr(reference.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(reference.title)}</a>`).join(" · ")}</p>`
      : "";
    container.innerHTML = `<p><strong>範本簡介：</strong>${escapeHtml(template.overview)}</p>${sourceHtml}`;
  }

  function applyFeatureVisibility() {
    const interceptLab = $("simulationLabSection");
    if (interceptLab) interceptLab.hidden = !SHOW_INTERCEPT_LAB;
  }

  function init() {
    applyFeatureVisibility();
    bindEvents();
    updateLlmProvider();
    loadLlmSettings();
    updateRangeLabels();
    renderTemplateInfo();
    renderDetailedInventoryRows(inventoryTemplateRows());
    renderSectionNavigator("builder");
    updateActionOptions();
    renderLibrary();
    renderStorm();
    if (!loadState()) {
      renderScenario();
      renderSimulation();
      renderAAR();
    }
  }

  init();
})();
