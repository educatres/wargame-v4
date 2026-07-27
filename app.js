(() => {
  "use strict";

  const DATA = window.WARGAME_DATA;
  const STORAGE_KEY = "taiwan-strait-scenario-generator-v1";
  const LLM_SETTINGS_KEY = "taiwan-strait-scenario-generator-llm-v1";

  const ACTIONS = {
    BLUE: [
      ["強化防空警戒", { readiness: 2, command: 1, intel: 1, civilian: 1 }],
      ["商船護航", { sustainment: -1, command: 1, civilian: -3 }],
      ["分散部署", { readiness: 1, sustainment: -1, civilian: 0 }],
      ["備援通訊", { command: 4, intel: 1, civilian: 0 }],
      ["後勤修復", { readiness: 1, sustainment: 5, civilian: 0 }],
      ["情報融合", { intel: 5, command: 1, civilian: 0 }]
    ],
    RED: [
      ["增加空中施壓", { readiness: -1, command: 1, intel: 0, civilian: 3 }],
      ["海上臨檢演示", { sustainment: -1, command: 0, intel: 1, civilian: 4 }],
      ["電磁壓制", { readiness: 0, command: 2, intel: 2, civilian: 2 }],
      ["遠程火力展示", { readiness: -2, command: 0, intel: 0, civilian: 6 }],
      ["調整封控區", { sustainment: 1, command: 1, intel: 0, civilian: 3 }],
      ["外交訊息操作", { readiness: 0, command: 1, intel: 2, civilian: -1 }]
    ],
    AMBER: [
      ["提供ISR支援", { readiness: 0, command: 1, intel: 6, civilian: 0 }],
      ["提升後勤準備", { readiness: 1, sustainment: 6, intel: 0, civilian: 0 }],
      ["網路防護支援", { readiness: 1, command: 5, intel: 1, civilian: 0 }],
      ["外交協調", { readiness: 0, command: 2, intel: 1, civilian: -3 }],
      ["遠距海上存在", { readiness: 1, command: 1, intel: 2, civilian: 2 }],
      ["人道支援準備", { readiness: 0, sustainment: 2, intel: 0, civilian: -5 }]
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
    airdefense: { name: "多軸空情與分層防護：48小時資源配置演練", focus: "airdefense", difficulty: "advanced", turns: 8, amberSupport: "indirect", weatherPreset: "variable", overview: "多方向空情與合成來襲目標造成警戒壓力，學生必須在預警、攔截存量與民事影響之間做取捨。" },
    logistics: { name: "港口延誤與後勤韌性：96小時持續性演練", focus: "logistics", difficulty: "standard", turns: 16, amberSupport: "limited", weatherPreset: "adverse", overview: "港口作業、運輸節點與維修批次陸續受阻；課程重點是優先順序、替代路線與資源保存。" },
    grayzone: { name: "灰色地帶與資訊迷霧：跨域判讀演練", focus: "intelligence", difficulty: "advanced", turns: 10, amberSupport: "indirect", weatherPreset: "stable", overview: "不明海空活動、訊息操作與模糊歸因事件交錯，學生需區分事實、推測與未知。" },
    humanitarian: { name: "人道疏散與民事協調：危機韌性演練", focus: "civil", difficulty: "standard", turns: 10, amberSupport: "limited", weatherPreset: "variable", overview: "人道需求、商運延誤與公共訊息壓力升高；資源配置需兼顧防護、疏散與基本服務。" },
    deescalation: { name: "危機降溫與外交窗口：升級控制演練", focus: "diplomacy", difficulty: "advanced", turns: 8, amberSupport: "indirect", weatherPreset: "stable", overview: "高風險互動後出現有限降溫窗口，學生需將資源使用、公開訊息與外交協調連成一致策略。" }
  };

  const STORM_STAGES = {
    systems: {
      title: "系統：建立可追溯的資產與支援網路",
      text: "先定義模型中存在哪些實體、群組與網路，例如指揮節點、航空／海上兵力包、後勤群、民事協調群及外部支援。課堂版只使用抽象兵力包，不對應真實單位。",
      question: "課堂問題：哪些系統若未被建模，會使研究結論產生系統性偏差？"
    },
    capabilities: {
      title: "能力：把系統轉成可比較的功能",
      text: "能力不是單一武器規格，而是感測、指管、機動、生存、持續與任務效果等屬性。相同資產在不同後勤、環境與指揮條件下，能產生不同效果。",
      question: "課堂問題：哪些能力應使用固定值，哪些應使用機率分布或區間？"
    },
    planning: {
      title: "計畫：把目的、方法與資源連成行動方案",
      text: "行動方案決定資產如何分配、何時投入、保留多少預備與如何回應情報。研究重點是比較方案取捨，而不是尋找唯一正確答案。",
      question: "課堂問題：方案比較是否使用相同假設、相同種子與相同成功門檻？"
    },
    execution: {
      title: "執行：讓五種表徵持續交換狀態",
      text: "每次模擬重複中，情報形成、命令下達、資產行動、互動裁決、資源消耗與環境摩擦反覆更新，直到到達時間或停止條件。",
      question: "課堂問題：哪些狀態更新具有延遲、回饋或累積效果？"
    },
    impact: {
      title: "影響：以分布與多重指標解讀結果",
      text: "輸出不只包括任務效果，也包括剩餘準備、資源保留、民事風險與結果變異。多次重複可顯示平均、尾端風險及罕見失敗。",
      question: "課堂問題：平均較高的方案，是否也可能具有更嚴重的低機率風險？"
    }
  };

  const STORM_REPRESENTATIONS = {
    c2: {
      title: "指揮管制 C2",
      subtitle: "命令、優先序、後勤與機動協調",
      description: "接收情報與資產狀態，形成任務、要求與新命令。教學版以指管品質、決策延遲及備援能力表示。",
      data: ["指管品質指數", "命令延遲", "備援程度", "資源配置規則"],
      classroom: "讓學生比較：提升指管品質，是否一定比增加資產更有效？"
    },
    assets: {
      title: "資產 Assets",
      subtitle: "執行任務、移動、感測並消耗資源",
      description: "代表航空、海上、陸上、支援與民事等合成兵力包。資產可處於可用、降級或失去任務能力狀態。",
      data: ["準備度", "任務效果", "機動能力", "後勤需求"],
      classroom: "讓學生辨識：資產數量與可持續執行能力並不是同一件事。"
    },
    intelligence: {
      title: "情報管理 Intelligence",
      subtitle: "來源、感知、信心與需求管理",
      description: "將不完整觀測轉成可供決策使用的情勢圖像。教學版把ISR品質、來源可靠度、環境遮蔽與分析誤差分開。",
      data: ["ISR品質", "來源可靠度", "分析信心", "資訊時效"],
      classroom: "讓學生說明：資訊更多是否必然使決策更好？錯誤信心有何影響？"
    },
    interactions: {
      title: "互動管理 Interactions",
      subtitle: "偵測、交互作用、消耗與損害",
      description: "管理不同資產之間的交互作用及狀態變化。教學版不使用真實射擊表，而以抽象摩擦、壓力與效果函數裁決。",
      data: ["交互作用條件", "效果機率", "消耗規則", "損害與恢復"],
      classroom: "讓學生檢查：模型是否錯把相關失敗當成彼此獨立？"
    },
    environment: {
      title: "環境 Environment",
      subtitle: "地形、天候、時間、交通與政治條件",
      description: "環境會限制感測、機動、持續性與民事活動。課堂版使用概略區域和1至5級嚴苛度，不含精確座標。",
      data: ["天候／海象", "能見度", "交通條件", "民事與政治約束"],
      classroom: "讓學生比較：環境是外生條件，還是會被各方行動進一步改變？"
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

  function setTab(tabId) {
    document.querySelectorAll(".tab").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tabId));
    document.querySelectorAll(".panel").forEach(panel => panel.classList.toggle("active", panel.id === tabId));
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
    return {
      BLUE: {
        readiness: round1(clamp(averageForActor("BLUE", "readiness") + resourceBalance.blue * 0.12)),
        sustainment: round1(averageForActor("BLUE", "sustainment")),
        command: round1(averageForActor("BLUE", "command_quality")),
        intel: 64 - scenario.uncertainty * 3,
        resources: 100,
        civilianRisk: 25 + scenario.civilPressure * 5
      },
      RED: {
        readiness: round1(clamp(averageForActor("RED", "readiness") + resourceBalance.red * 0.12)),
        sustainment: round1(averageForActor("RED", "sustainment")),
        command: round1(averageForActor("RED", "command_quality")),
        intel: 68 - scenario.uncertainty * 2,
        resources: 100,
        civilianRisk: 0
      },
      AMBER: {
        readiness: amberEnabled ? round1(averageForActor("AMBER", "readiness")) : 0,
        sustainment: amberEnabled ? round1(averageForActor("AMBER", "sustainment")) : 0,
        command: amberEnabled ? round1(averageForActor("AMBER", "command_quality")) : 0,
        intel: amberEnabled ? 82 : 0,
        resources: scenario.amberSupport === "limited" ? 80 : scenario.amberSupport === "indirect" ? 60 : 0,
        civilianRisk: 0
      }
    };
  }

  function readResourceInventory() {
    const number = (id, max) => clamp(Number($(id).value) || 0, 0, max);
    return {
      blueAircraft: number("blueAircraft", 240), blueInterceptors: number("blueInterceptors", 600),
      blueVessels: number("blueVessels", 80), blueLogistics: number("blueLogistics", 240),
      redAircraft: number("redAircraft", 360), redIncoming: number("redIncoming", 600),
      redVessels: number("redVessels", 100), redLogistics: number("redLogistics", 240)
    };
  }

  function calculateResourceBalance(resources) {
    const blue = ((resources.blueAircraft / 48) + (resources.blueInterceptors / 160) + (resources.blueVessels / 14) + (resources.blueLogistics / 72)) * 5 - 20;
    const red = ((resources.redAircraft / 96) + (resources.redIncoming / 180) + (resources.redVessels / 24) + (resources.redLogistics / 84)) * 5 - 20;
    return { blue: round1(clamp(blue, -15, 15)), red: round1(clamp(red, -15, 15)) };
  }

  function ensureScenarioResources(scenario) {
    if (!scenario.resources) scenario.resources = readResourceInventory();
    scenario.resourceBalance ||= calculateResourceBalance(scenario.resources);
    return scenario;
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
      SCENARIO_TEMPLATES[formValues.template]?.overview,
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
      resources: formValues.resources,
      resourceBalance: calculateResourceBalance(formValues.resources),
      overview: pick(overviewTemplates, rng),
      objectives: focus.objectives,
      successCriteria: focus.success,
      constraints,
      events: selectedEvents,
      intel: initialIntel,
      createdAt: new Date().toISOString(),
      dataClass: "EDUCATIONAL_SYNTHETIC"
    };
  }

  function readScenarioForm() {
    return {
      name: $("scenarioName").value.trim() || "未命名課程想定",
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
      resources: readResourceInventory(),
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
    saveState(false);
    renderScenario();
    renderSimulation();
    renderAAR();
    toast("想定已生成，可進入回合推演。");
  }

  function renderScenario() {
    const container = $("scenarioPreview");
    if (!state.scenario) {
      container.className = "preview empty-state";
      container.textContent = "尚未生成想定。調整左側參數後按下「生成想定」。";
      return;
    }
    const s = state.scenario;
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
        <div class="tag-list">
          <span class="tag">${escapeHtml(s.focusTitle)}</span>
          <span class="tag">情報不確定度 ${s.uncertainty}/5</span>
          <span class="tag">民事壓力 ${s.civilPressure}/5</span>
          <span class="tag">${amberLabel(s.amberSupport)}</span>
          <span class="tag">${weatherLabel(s.weatherPreset)}</span>
        </div>
      </div>
      <div class="preview-grid">
        <article class="card">
          <h3>學習目標</h3>
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
        <div class="subheading"><h3>本想定合成資源基線</h3><span class="muted">只用於課堂比較與隨機模擬</span></div>
        <div class="preview-grid">
          <div><strong>藍方</strong><p class="muted">航空架次 ${s.resources.blueAircraft} · 攔截彈 ${s.resources.blueInterceptors}<br>巡防平台 ${s.resources.blueVessels} · 補給批次 ${s.resources.blueLogistics}</p></div>
          <div><strong>紅方</strong><p class="muted">航空架次 ${s.resources.redAircraft} · 合成來襲目標 ${s.resources.redIncoming}<br>海上平台 ${s.resources.redVessels} · 補給批次 ${s.resources.redLogistics}</p></div>
          <div><strong>資源壓力</strong><p class="muted">藍方資源修正 ${s.resourceBalance.blue >= 0 ? "+" : ""}${s.resourceBalance.blue}<br>紅方資源修正 ${s.resourceBalance.red >= 0 ? "+" : ""}${s.resourceBalance.red}</p></div>
        </div>
      </article>
      <div class="actions" style="margin-top:1rem">
        <button class="primary" id="goSimulationBtn">開始回合推演</button>
        <button class="secondary" id="regenerateEventsBtn">以相同設定重抽事件</button>
      </div>
    `;
    $("goSimulationBtn").addEventListener("click", () => setTab("simulation"));
    $("regenerateEventsBtn").addEventListener("click", () => {
      $("scenarioSeed").value = Number($("scenarioSeed").value) + 1;
      beginScenario(generateScenario(readScenarioForm()));
    });
  }

  function amberLabel(value) {
    return ({ none: "不納入美軍", indirect: "美軍間接支援", limited: "美軍有限支援" }[value] || value);
  }

  function weatherLabel(value) {
    return ({ stable: "穩定天候", variable: "多變天候", adverse: "不利天候" }[value] || value);
  }

  function renderSimulation() {
    const hasScenario = !!state.scenario;
    $("simulationEmpty").hidden = hasScenario;
    $("simulationContent").hidden = !hasScenario;
    $("resolveTurnBtn").disabled = !hasScenario || state.currentTurn > (state.scenario?.turns || 0);
    if (!hasScenario) return;

    $("turnBadge").textContent = state.currentTurn > state.scenario.turns
      ? "推演完成"
      : `第 ${state.currentTurn} / ${state.scenario.turns} 回合（T+${(state.currentTurn - 1) * state.scenario.hoursPerTurn}h）`;

    renderStatusCards();
    renderZoneMap();
    renderOrderControls();
    renderCurrentOrders();
    renderTurnPanels();
    renderNarrative();
    updateLab();
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
      return `<article class="metric ${id.toLowerCase()}">
        <small>${label}</small>
        <strong>${round1(actor.readiness)}</strong>
        <small>後勤 ${round1(actor.sustainment)} · 指管 ${round1(actor.command)} · 資源 ${round1(actor.resources)}</small>
      </article>`;
    }).join("");
  }

  function renderZoneMap() {
    const currentOrders = state.orders[state.currentTurn] || {};
    const currentEvent = state.scenario.events.find(e => Number(e.trigger_turn) === state.currentTurn);
    const zones = DATA.zones.filter(z => z.zone_id !== "Z-REAR" || state.scenario.amberSupport !== "none");
    $("zoneMap").innerHTML = zones.map(zone => {
      const signals = [];
      Object.values(currentOrders).forEach(order => {
        if (order.zone === zone.zone_id) signals.push(order.actor.toLowerCase());
      });
      if (currentEvent?.zone_id === zone.zone_id) signals.push("neutral");
      return `<div class="zone" data-zone="${zone.zone_id}" title="${escapeHtml(zone.teaching_note || "")}">
        <div><span class="zone-name">${escapeHtml(zone.zone_name)}</span><br><small>${escapeHtml(zone.domain)} · ${escapeHtml(zone.distance_band)}</small></div>
        <div class="zone-signals">${signals.map(s => `<i class="signal ${s}"></i>`).join("")}</div>
      </div>`;
    }).join("");
  }

  function renderOrderControls() {
    const zoneSelect = $("orderZone");
    if (!zoneSelect.options.length) {
      zoneSelect.innerHTML = DATA.zones
        .filter(z => z.zone_id !== "Z-REAR" || state.scenario.amberSupport !== "none")
        .map(z => `<option value="${z.zone_id}">${escapeHtml(z.zone_name)}</option>`).join("");
    }
    updateActionOptions();
    const finished = state.currentTurn > state.scenario.turns;
    [...$("orderForm").elements].forEach(el => el.disabled = finished);
    $("resolveTurnBtn").disabled = finished;
  }

  function updateActionOptions() {
    const actor = $("orderActor").value;
    $("orderAction").innerHTML = ACTIONS[actor].map(([name]) => `<option>${escapeHtml(name)}</option>`).join("");
  }

  function renderCurrentOrders() {
    const current = state.orders[state.currentTurn] || {};
    const orderList = $("currentOrders");
    const values = Object.values(current);
    if (!values.length) {
      orderList.innerHTML = `<p class="muted">本回合尚未提交命令。</p>`;
      return;
    }
    orderList.innerHTML = values.map(order => `
      <div class="order-item ${order.actor}">
        <strong>${actorLabel(order.actor)}：${escapeHtml(order.action)}</strong>
        <div>${zoneName(order.zone)} · 資源 ${order.resource}${order.aiGenerated ? " · AI建議" : ""} · ${escapeHtml(order.rationale || "未填寫理由")}</div>
      </div>`).join("");
  }

  function currentIntel() {
    if (!state.scenario) return [];
    return state.scenario.intel.filter(i => Number(i.turn) === state.currentTurn);
  }

  function currentWeather() {
    if (!state.scenario) return [];
    const baseTurn = ((state.currentTurn - 1) % 12) + 1;
    const rows = DATA.weather.filter(w => Number(w.turn) === baseTurn);
    const modifier = state.scenario.weatherPreset === "adverse" ? 1 :
      state.scenario.weatherPreset === "stable" ? -1 : 0;
    return rows.map(w => ({
      ...w,
      sea_state_1_5: clamp(Number(w.sea_state_1_5) + modifier, 1, 5),
      visibility_1_5: clamp(Number(w.visibility_1_5) - modifier, 1, 5)
    }));
  }

  function renderTurnPanels() {
    const intel = currentIntel();
    $("intelPanel").innerHTML = intel.length ? intel.map(i => `
      <div class="turn-log">
        <strong>${escapeHtml(i.report_type)} · ${zoneName(i.zone_id)}</strong>
        <p>${escapeHtml(i.report_text)}</p>
        <small>來源 ${escapeHtml(i.source_reliability)} · 信心 ${i.confidence_pct}%</small>
      </div>`).join("") : `<p class="muted">本回合沒有新增情報；學生需判斷資訊缺口。</p>`;

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

    const event = state.scenario.events.find(e => Number(e.trigger_turn) === state.currentTurn);
    $("eventPanel").innerHTML = event ? `
      <div class="turn-log">
        <strong>${escapeHtml(event.event_name)}</strong>
        <p>${escapeHtml(event.description)}</p>
        <small>${escapeHtml(event.category)} · ${zoneName(event.zone_id)}</small>
      </div>` : `<p class="muted">白方可視課堂狀況臨時加入事件。</p>`;
  }

  function submitOrder(event) {
    event.preventDefault();
    if (!state.scenario || state.currentTurn > state.scenario.turns) return;
    const actor = $("orderActor").value;
    if (actor === "AMBER" && state.scenario.amberSupport === "none") {
      toast("本想定未納入美軍支援。");
      return;
    }
    const order = {
      actor,
      action: $("orderAction").value,
      zone: $("orderZone").value,
      resource: clamp(Number($("orderResource").value) || 20, 5, 35),
      rationale: $("orderRationale").value.trim(),
      submittedAt: new Date().toISOString()
    };
    state.orders[state.currentTurn] ||= {};
    state.orders[state.currentTurn][actor] = order;
    $("orderRationale").value = "";
    saveState(false);
    renderSimulation();
    toast(`${actorLabel(actor)}命令已提交。`);
  }

  function fallbackAutoFill(missingActors) {
    const rng = mulberry32(state.scenario.seed + state.currentTurn * 991);
    missingActors.forEach(actor => {
      const action = pick(ACTIONS[actor], rng)[0];
      const zone = pick(DATA.zones.filter(z => z.zone_id !== "Z-REAR" || actor === "AMBER"), rng).zone_id;
      state.orders[state.currentTurn][actor] = {
        actor, action, zone, resource: Math.round(12 + rng() * 15),
        rationale: "本機合成規則：依本回合的合成態勢補齊代表性行動。",
        submittedAt: new Date().toISOString()
      };
    });
  }

  function autoOrderPrompt(missingActors) {
    const availableActions = Object.fromEntries(missingActors.map(actor => [actor, ACTIONS[actor].map(([name]) => name)]));
    const zones = DATA.zones.filter(z => z.zone_id !== "Z-REAR" || missingActors.includes("AMBER")).map(z => ({ id: z.zone_id, name: z.zone_name, domain: z.domain }));
    const event = state.scenario.events.find(e => Number(e.trigger_turn) === state.currentTurn);
    const weather = currentWeather().map(w => ({ zone: w.zone_id, sea: w.sea_state_1_5, visibility: w.visibility_1_5 }));
    return `你是教學兵推的回合助理。只能使用下列完全合成、虛構的課堂資料；不得補入真實部隊、武器型號、座標、部署、射程、目標或可執行的現實作戰建議。\n\n請只回傳嚴格 JSON：{"orders":[{"actor":"BLUE|RED|AMBER","action":"必須從允許動作選一項","zone":"必須從允許區域選一項","resource":5到35的整數,"rationale":"繁體中文、80字內，明確說明如何根據資源、準備度、情報、事件或天候作取捨"}]}\n\n必須補齊的角色：${JSON.stringify(missingActors)}\n允許動作：${JSON.stringify(availableActions)}\n允許區域：${JSON.stringify(zones)}\n當前狀態：${JSON.stringify({ turn: state.currentTurn, status: state.status, resources: state.scenario.resources, currentOrders: state.orders[state.currentTurn], event: event ? { name: event.event_name, category: event.category, zone: event.zone_id } : null, weather })}\n\n每個缺少角色剛好一項命令；理由必須可供教師與學生檢視。`;
  }

  function applyAiOrders(result, missingActors) {
    const rows = Array.isArray(result?.orders) ? result.orders : [];
    const allowedZones = new Set(DATA.zones.filter(z => z.zone_id !== "Z-REAR" || missingActors.includes("AMBER")).map(z => z.zone_id));
    const accepted = new Set();
    rows.forEach(row => {
      const actor = String(row?.actor || "");
      const action = String(row?.action || "");
      if (!missingActors.includes(actor) || accepted.has(actor) || !ACTIONS[actor].some(([name]) => name === action) || !allowedZones.has(row?.zone)) return;
      state.orders[state.currentTurn][actor] = {
        actor, action, zone: row.zone, resource: Math.round(clamp(Number(row.resource) || 20, 5, 35)),
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
    const effort = Math.sqrt(order.resource) * 2.3;
    const readiness = status.readiness * 0.22;
    const command = status.command * 0.16;
    const sustain = status.sustainment * 0.12;
    const riskBonus = (order.resource > 25 ? 4 : 0);
    const resourceModifier = state.scenario?.resourceBalance?.[order.actor.toLowerCase()] || 0;
    return effort + readiness + command + sustain + riskBonus + resourceModifier + (rng() - 0.5) * 14;
  }

  function applyOwnAction(actor, order) {
    if (!order) return;
    const effect = actionEffect(actor, order.action);
    const status = state.status[actor];
    const scale = order.resource / 20;
    status.readiness = clamp(status.readiness + (effect.readiness || 0) * scale);
    status.sustainment = clamp(status.sustainment + (effect.sustainment || 0) * scale);
    status.command = clamp(status.command + (effect.command || 0) * scale);
    status.intel = clamp(status.intel + (effect.intel || 0) * scale);
    status.resources = clamp(status.resources - order.resource * 0.72);
    if (actor === "BLUE" || actor === "RED") {
      state.status.BLUE.civilianRisk = clamp(state.status.BLUE.civilianRisk + (effect.civilian || 0) * scale);
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

  async function resolveTurn() {
    if (!state.scenario || state.currentTurn > state.scenario.turns) return;
    await autoFillOrders();
    const orders = state.orders[state.currentTurn] || {};
    const rng = mulberry32(state.scenario.seed + state.currentTurn * 7919 + hashText(JSON.stringify(orders)));
    const difficulty = DIFFICULTY[state.scenario.difficulty];
    const event = state.scenario.events.find(e => Number(e.trigger_turn) === state.currentTurn) || null;
    const weather = currentWeather();
    const avgSea = weather.reduce((sum, w) => sum + Number(w.sea_state_1_5), 0) / Math.max(1, weather.length);
    const avgVisibility = weather.reduce((sum, w) => sum + Number(w.visibility_1_5), 0) / Math.max(1, weather.length);

    Object.values(orders).forEach(order => applyOwnAction(order.actor, order));
    applyEvent(event);

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
      const load = (orders[actor]?.resource || 10) * 0.08;
      state.status[actor].sustainment = clamp(state.status[actor].sustainment - load - rng() * 1.5);
      state.status[actor].command = clamp(state.status[actor].command - Math.max(0, state.scenario.uncertainty - 2) * 0.5 + rng());
    });

    if (orders.AMBER && state.scenario.amberSupport !== "none") {
      state.status.BLUE.intel = clamp(state.status.BLUE.intel + (orders.AMBER.action === "提供ISR支援" ? 4 : 1));
      state.status.BLUE.sustainment = clamp(state.status.BLUE.sustainment + (orders.AMBER.action === "提升後勤準備" ? 4 : 0.8));
    }

    const outcome = balance > 12 ? "藍方在本回合取得較佳態勢，但仍須保存資源。" :
      balance < -12 ? "紅方施壓取得較明顯效果，藍方需調整部署與資訊判讀。" :
      "本回合態勢膠著，雙方均付出資源與持續性成本。";

    const log = {
      turn: state.currentTurn,
      elapsedHours: (state.currentTurn - 1) * state.scenario.hoursPerTurn,
      event: event ? event.event_name : "無預排事件",
      orders: JSON.parse(JSON.stringify(orders)),
      blueScore: round1(blueScore),
      redScore: round1(redScore),
      amberContribution: round1(amberContribution),
      environment: { avgSea: round1(avgSea), avgVisibility: round1(avgVisibility) },
      outcome,
      statusAfter: JSON.parse(JSON.stringify(state.status)),
      keyRisk: state.status.BLUE.civilianRisk > 65 ? "民事風險升高" :
        state.status.BLUE.sustainment < 50 ? "藍方持續性不足" :
        state.status.BLUE.resources < 30 ? "藍方資源接近下限" :
        state.status.BLUE.intel < 50 ? "情報品質不足" : "需持續監控"
    };
    state.logs.push(log);
    state.currentTurn += 1;
    saveState(false);
    renderSimulation();
    renderAAR();
    toast(state.currentTurn > state.scenario.turns ? "推演完成，可進行課後檢討。" : "本回合已結算。");
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
      <article class="metric blue"><small>修正後單次機率</small><strong>${percent(adjusted)}</strong><small>僅為合成教學值</small></article>
      <article class="metric blue"><small>至少一次成功</small><strong>${percent(atLeastOne)}</strong><small>假設各次近似獨立</small></article>
      <article class="metric neutral"><small>期望剩餘目標</small><strong>${round1(residual)}</strong><small>用於方案比較</small></article>
      <article class="metric amber"><small>每次投入效率</small><strong>${percent(efficiency)}</strong><small>增加投入存在邊際效益遞減</small></article>`;
  }

  function renderAAR() {
    const hasLogs = state.logs.length > 0;
    $("aarEmpty").hidden = hasLogs;
    $("aarContent").hidden = !hasLogs;
    if (!hasLogs) return;

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

    $("timelineBody").innerHTML = state.logs.map(log => {
      const o = log.orders || {};
      return `<tr>
        <td>${log.turn}<br><small>T+${log.elapsedHours}h</small></td>
        <td>${escapeHtml(log.event)}</td>
        <td>${formatOrder(o.BLUE)}</td>
        <td>${formatOrder(o.RED)}</td>
        <td>${formatOrder(o.AMBER)}</td>
        <td>${escapeHtml(log.outcome)}<br><small>${escapeHtml(log.keyRisk)}</small></td>
      </tr>`;
    }).join("");
  }

  function formatOrder(order) {
    if (!order) return "—";
    return `<strong>${escapeHtml(order.action)}</strong><br><small>${zoneName(order.zone)} · 資源 ${order.resource}</small>`;
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
        <p class="footnote">共 ${rows.length} 筆。公開來源僅作為背景與來源目錄；合成資料可由教師修改。</p>
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
        <div><h3>教學提問</h3><p>${escapeHtml(item.classroom)}</p></div>
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
    state.status = initialStatus(state.scenario);
    state.orders = {};
    state.logs = [];
    saveState(false);
    renderSimulation();
    renderAAR();
    toast("推演已重設。");
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
      version: "2.0",
      exportedAt: new Date().toISOString(),
      safetyClass: "EDUCATIONAL_SYNTHETIC",
      scenario: state.scenario,
      currentTurn: state.currentTurn,
      status: state.status,
      orders: state.orders,
      logs: state.logs,
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
          throw new Error("不是本系統的教育合成資料格式");
        }
        state.scenario = ensureScenarioResources(payload.scenario);
        state.currentTurn = payload.currentTurn || 1;
        state.status = payload.status || initialStatus(payload.scenario);
        state.orders = payload.orders || {};
        state.logs = payload.logs || [];
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
    const header = ["turn","elapsed_hours","event","blue_action","red_action","amber_action","blue_readiness","red_readiness","civilian_risk","outcome","key_risk"];
    const lines = [header.join(",")];
    state.logs.forEach(log => {
      const values = [
        log.turn, log.elapsedHours, log.event,
        log.orders.BLUE?.action || "", log.orders.RED?.action || "", log.orders.AMBER?.action || "",
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
    gemini: { model: "gemini-3.5-flash", label: "Gemini", models: ["gemini-3.5-flash", "gemini-3.6-flash"] },
    openai: { model: "gpt-5.5", label: "OpenAI", models: ["gpt-5.4-mini", "gpt-5.5", "gpt-5.6"] },
    claude: { model: "claude-sonnet-4-20250514", label: "Claude", models: ["claude-sonnet-4-20250514"] },
    cgu: { model: "gpt-5.4-mini", label: "長庚 CGU LLM API", endpoint: "https://air.cgu.edu.tw/cgullmapi/v1", models: ["gpt-5.4-mini", "gpt-5.5", "gpt-5.6"] }
  };

  function updateLlmProvider() {
    const provider = $("llmProvider").value;
    const preset = LLM_PRESETS[provider];
    $("llmEndpointWrap").hidden = provider !== "cgu";
    if (provider === "cgu") $("llmEndpoint").value = preset.endpoint;
    $("llmModel").value = preset.model;
    $("llmModelOptions").innerHTML = preset.models.map(model => `<option value="${escapeAttr(model)}"></option>`).join("");
  }

  function saveLlmKey() {
    try { localStorage.setItem(LLM_SETTINGS_KEY, JSON.stringify({ apiKey: $("llmApiKey").value })); } catch { toast("無法寫入瀏覽器 localStorage。") }
  }

  function loadLlmKey() {
    try {
      const saved = JSON.parse(localStorage.getItem(LLM_SETTINGS_KEY) || "{}");
      if (saved.apiKey) $("llmApiKey").value = saved.apiKey;
    } catch { /* Ignore malformed or unavailable browser storage. */ }
  }

  function clearLlmKey() {
    try { localStorage.removeItem(LLM_SETTINGS_KEY); } catch { /* Best-effort removal. */ }
    $("llmApiKey").value = "";
    $("llmStatus").textContent = "已清除儲存在此瀏覽器的 API Key。";
    toast("已清除 API Key。");
  }

  function llmPrompt(formValues) {
    const baseline = generateScenario(formValues);
    return `你是課程想定編輯器。只可使用下列「完全合成、虛構」資料，不能補入真實世界的部隊、武器型號、地點、座標、射程、性能、部署或目標資訊。請以繁體中文回傳嚴格 JSON，且不要使用 Markdown。\n\nJSON schema:\n{"overview":"120字內情境摘要","objectives":["3項"],"successCriteria":["3項"],"constraints":["3至5項"],"eventIdeas":["3項不涉及真實武器或地點的事件名稱"]}\n\n課程設定：${JSON.stringify({ name: baseline.name, focus: baseline.focusTitle, difficulty: baseline.difficultyLabel, turns: baseline.turns, hoursPerTurn: baseline.hoursPerTurn, uncertainty: baseline.uncertainty, civilPressure: baseline.civilPressure, amberSupport: baseline.amberSupport, weather: baseline.weatherPreset, resources: baseline.resources, teacherConstraints: formValues.teacherConstraints })}\n\n額外教師指示：${$("llmInstruction").value.trim() || "無"}\n\n敘事要強調資源保存、資訊不確定性、民事影響與升級控制；不得提出可執行的現實作戰建議。`;
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

  function authorizationHeader(apiKey) {
    return /^Bearer\s+/i.test(apiKey) ? apiKey : `Bearer ${apiKey}`;
  }

  async function requestLlm(provider, model, apiKey, prompt, reasoning) {
    if (provider === "gemini") {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.7 } }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || `Gemini HTTP ${response.status}`);
      return data?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("") || "";
    }
    if (provider === "openai") {
      const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": authorizationHeader(apiKey) }, body: JSON.stringify({ model, input: prompt, reasoning: { effort: reasoning }, text: { format: { type: "json_object" } } }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || `OpenAI HTTP ${response.status}`);
      return responseText(data);
    }
    if (provider === "claude") {
      const response = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model, max_tokens: 1200, temperature: 0.7, messages: [{ role: "user", content: prompt }] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || `Claude HTTP ${response.status}`);
      return data.content?.map(part => part.text || "").join("") || "";
    }
    const endpoint = normalizeResponsesEndpoint($("llmEndpoint").value);
    if (!/^https:\/\//i.test(endpoint)) throw new Error("請輸入 CGU／相容 API 的 HTTPS Endpoint");
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
      saveLlmKey();
      const result = extractJson(await requestLlm(provider, $("llmModel").value.trim(), apiKey, llmPrompt(formValues), $("llmReasoning").value));
      const scenario = generateScenario(formValues);
      scenario.overview = String(result.overview || scenario.overview).slice(0, 500);
      scenario.objectives = cleanLlmList(result.objectives, scenario.objectives, 4);
      scenario.successCriteria = cleanLlmList(result.successCriteria, scenario.successCriteria, 4);
      scenario.constraints = [...scenario.constraints, ...cleanLlmList(result.constraints, [], 5)].slice(0, 7);
      scenario.llmNarrative = { provider: LLM_PRESETS[provider].label, model: $("llmModel").value.trim(), reasoning: $("llmReasoning").value, eventIdeas: cleanLlmList(result.eventIdeas, [], 4) };
      beginScenario(scenario);
      status.textContent = `已使用 ${scenario.llmNarrative.provider} 生成敘事；API Key 已保存於此瀏覽器，可手動清除。`;
    } catch (error) {
      status.textContent = "生成失敗。";
      toast(`LLM 生成失敗：${error.message}`);
    } finally { button.disabled = false; }
  }

  function bindEvents() {
    document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => setTab(btn.dataset.tab)));
    document.querySelectorAll(".mini-tab").forEach(btn => btn.addEventListener("click", () => {
      document.querySelectorAll(".mini-tab").forEach(b => b.classList.toggle("active", b === btn));
      state.currentLibrary = btn.dataset.library;
      renderLibrary();
    }));

    $("scenarioForm").addEventListener("submit", event => {
      event.preventDefault();
      beginScenario(generateScenario(readScenarioForm()));
    });
    $("loadDemoBtn").addEventListener("click", () => {
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
      $("blueAircraft").value = 48;
      $("blueInterceptors").value = 160;
      $("blueVessels").value = 14;
      $("blueLogistics").value = 72;
      $("redAircraft").value = 96;
      $("redIncoming").value = 180;
      $("redVessels").value = 24;
      $("redLogistics").value = 84;
      updateRangeLabels();
      beginScenario(generateScenario(readScenarioForm()));
    });
    $("uncertainty").addEventListener("input", updateRangeLabels);
    $("civilPressure").addEventListener("input", updateRangeLabels);
    $("scenarioTemplate").addEventListener("change", applyScenarioTemplate);
    $("llmProvider").addEventListener("change", updateLlmProvider);
    $("llmApiKey").addEventListener("input", saveLlmKey);
    $("generateWithLlmBtn").addEventListener("click", generateWithLlm);
    $("clearLlmKeyBtn").addEventListener("click", clearLlmKey);
    $("orderActor").addEventListener("change", updateActionOptions);
    $("orderForm").addEventListener("submit", submitOrder);
    $("autoOrdersBtn").addEventListener("click", autoFillOrders);
    $("resolveTurnBtn").addEventListener("click", resolveTurn);
    $("clearRunBtn").addEventListener("click", resetRun);
    $("saveBtn").addEventListener("click", () => saveState(true));
    $("exportBtn").addEventListener("click", exportJSON);
    $("importInput").addEventListener("change", event => importJSON(event.target.files[0]));
    $("exportCsvBtn").addEventListener("click", exportCSV);
    $("printBtn").addEventListener("click", () => window.print());
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

  function applyScenarioTemplate() {
    const template = SCENARIO_TEMPLATES[$("scenarioTemplate").value];
    if (!template) return;
    $("scenarioName").value = template.name;
    $("focus").value = template.focus;
    $("difficulty").value = template.difficulty;
    $("turns").value = template.turns;
    $("amberSupport").value = template.amberSupport;
    $("weatherPreset").value = template.weatherPreset;
    toast(`已套用「${$("scenarioTemplate").selectedOptions[0].textContent}」範本。`);
  }

  function init() {
    bindEvents();
    updateLlmProvider();
    loadLlmKey();
    updateRangeLabels();
    updateActionOptions();
    renderLibrary();
    renderStorm();
    if (!loadState()) {
      beginScenario(generateScenario(readScenarioForm()));
    }
  }

  init();
})();
