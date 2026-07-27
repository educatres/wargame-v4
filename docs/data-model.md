# 資料模型

## 內建資料
- `actors`：BLUE、RED、AMBER、WHITE。
- `zones`：抽象區域，不含座標。
- `forcePackages`：合成兵力包及0–100狀態指數。
- `capabilities`：合成能力類型及1–5能力指數。
- `eventCards`：氣象、民事、情報、後勤、外交與指管事件。
- `intelligenceReports`：帶有來源可靠度及信心值的合成情報。
- `weather`：12回合、8區域的合成天候。
- `publicSources`：公開資料來源目錄。
- `publicActivitySample`：少量國防部公開活動結構化樣本。

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
  "orders": {},
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


## STORM 教學實驗狀態

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

所有STORM欄位均標記為課程合成參數。匯出的JSON仍需具有：

```json
{
  "safetyClass": "EDUCATIONAL_SYNTHETIC"
}
```
