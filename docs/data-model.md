# 資料模型

## 內建資料
- `actors`：BLUE、RED、AMBER、WHITE。
- `zones`：抽象區域，不含座標。
- `forcePackages`：合成兵力包及0–100狀態指數。
- `capabilities`：合成能力類型及1–5能力指數。
- `eventCards`：氣象、民事、情報、後勤、外交與指管事件。
- `scenarioTemplates`：9種內建情境範本及其回合順序、戰略壓力、資源、目標、限制、參考資料與案例事件。
- `settingCatalog`：由目前介面同步的設定控制項、預設值、上下限與選項；API Key只記錄保存政策，不保存內容。
- `resourceCatalog`：11項合成資源的預設值、介面上下限與效果說明。
- `actionCatalog`：BLUE、RED、AMBER共26項回合行動及抽象裁決修正。
- `llmProviders`：4個LLM供應商的預設模型、API Endpoint與可選模型。
- `intelligenceReports`：帶有來源可靠度及信心值的合成情報。
- `weather`：12回合、8區域的合成天候。
- `publicSources`：公開資料來源目錄。
- `publicActivitySample`：少量國防部公開活動結構化樣本。

網頁使用 `data/demo-data.js`；`reference/` 內的 SQLite 與 Excel 為相同目錄資料的可攜式副本。三份資料版本目前均為 `2.1-SETTINGS-SYNC`（2026-07-28）。

SQLite 另提供 `scenario_master`、`setting_catalog`、`resource_catalog`、`action_catalog` 與 `llm_providers`。`scenario_master` 以 JSON 欄位保存每個範本的戰略參數、資源、目標、成功條件、限制、參考資料與案例事件。

## 想定狀態
```json
{
  "scenario": {
    "id": "TS-20260727",
    "dataClass": "EDUCATIONAL_SYNTHETIC",
    "turns": 12,
    "events": [],
    "intel": []
  },
  "currentTurn": 1,
  "status": {
    "BLUE": {
      "readiness": 76,
      "sustainment": 78,
      "command": 72,
      "intel": 55,
      "resources": 100,
      "civilianRisk": 40
    }
  },
  "orders": {
    "1": {
      "BLUE": {
        "actor": "BLUE",
        "primary": { "action": "情報融合", "zone": "Z-ISL", "resource": 18, "priority": 4, "condition": "情資可供決策", "risk": "medium" },
        "supports": [
          { "action": "備援通訊", "zone": "Z-ISL", "resource": 6, "priority": 3, "condition": "通訊品質下降", "risk": "low" },
          { "action": "後勤修復", "zone": "Z-ISL", "resource": 5, "priority": 2, "condition": "修復需求確認", "risk": "low" }
        ],
        "resourceBudget": 35
      }
    }
  },
  "logs": []
}
```

## 匯入安全檢查
匯入檔必須具有：

```json
{
  "safetyClass": "EDUCATIONAL_SYNTHETIC"
}
```

若沒有此標記，系統拒絕匯入。


## STORM 分析實驗狀態

```json
{
  "storm": {
    "activeStage": "systems",
    "activeRepresentation": "c2",
    "lastExperiment": {
      "params": {
        "coa": "balanced",
        "replications": 100,
        "c2": 72,
        "isr": 68,
        "readiness": 76,
        "sustainment": 74,
        "mobility": 70,
        "environment": 3,
        "pressure": 3,
        "civil": 3,
        "threshold": 60
      },
      "summary": {
        "successRate": 0.62,
        "missionMean": 63.4,
        "q05": 52.1,
        "q95": 74.6
      }
    },
    "comparison": [],
    "doe": null
  }
}
```

所有STORM欄位均標記為模擬合成參數。匯出的JSON仍需具有：

```json
{
  "safetyClass": "EDUCATIONAL_SYNTHETIC"
}
```
