# 臺海想定生成

一套可直接部署到 GitHub Pages、也可在電腦上以瀏覽器單機開啟的想定模擬與作戰研究分析系統。

版本 2.0 新增 **STORM（Synthetic Theater Operations Research Model）概念分析實驗室**。本模組是依公開文獻重新設計的模擬版，不是正式 STORM 軟體或其演算法重製。

## 核心功能

### STORM 作戰研究分析實驗室
- 戰役分析流程：系統 → 能力 → 計畫 → 執行 → 影響。
- 五種表徵：指揮管制、資產、情報管理、互動管理、環境。
- 隨機重複：30–500次批次模擬，顯示平均、標準差、百分位與90%平均值區間。
- 方案比較：以相同條件和隨機種子比較四種COA。
- 敏感度分析：逐項調整因素，觀察任務效果變化。
- 2³因子實驗：同時比較C2、ISR與後勤的高低水準與交互作用。
- 模型透明：畫面直接說明假設、資料類型、係數屬性與限制。


- 離線想定生成：依分析重點、難度、回合、情報不確定度、民事壓力、天候與美軍支援程度組合情境。
- 回合兵推：藍方、紅方、琥珀方提交命令，由規則引擎與事件卡產生抽象結果。
- 概略情勢圖：只使用北／中／南海峽、東部外海、本島整體等抽象區域。
- 情報與戰場迷霧：情報帶有來源可靠度與信心值。
- 後勤與資源：追蹤準備、持續性、指管、情報、資源及民事風險。
- 攔截資源配置實驗：以合成機率展示資源投入與邊際效益。
- 事後檢討：自動建立決策時間線、主要風險及反思題。
- 匯入／匯出：JSON保存完整模擬狀態，CSV匯出回合紀錄。
- 本機保存：進度只存在瀏覽器 localStorage，除非主動匯出。
- 合成資源基線：可設定雙方的航空架次、攔截彈、海上平台與補給批次；這些虛構數量會影響想定摘要、起始準備與回合裁決。
- LLM 輔助想定：支援 Gemini、OpenAI、Anthropic Claude 與長庚 CGU LLM API，以當前合成資源和補充限制生成敘事、目標及事件構想。整個設定區預設收合，供應商、模型、思考力度、Endpoint、額外指示與 API Key 均保存在瀏覽器 localStorage。
- AI 回合補齊：輸入 API Key 後，「自動補齊其他角色」會依當前資源、準備度、情報、事件、天候與已提交命令生成缺少角色的合成行動，並顯示理由；API 不可用時回退至本機合成規則。
- 模擬情境範本：提供有限封控、多軸空情、港口後勤、灰色地帶、人道疏散與危機降溫等六種合成情境。

## 單機使用

解壓縮後直接雙擊 `index.html`。

本專案不使用 ES Module、fetch 或外部 CDN，因此可在多數瀏覽器的 `file://` 模式直接執行。

若瀏覽器的本機檔案政策較嚴格，可在專案目錄執行：

```bash
python3 -m http.server 8000
```

再開啟：

```text
http://localhost:8000
```

Windows 也可雙擊 `start-local.bat`。

## GitHub Pages 部署

1. 建立新的 GitHub repository。
2. 將本專案全部檔案上傳到 repository 根目錄。
3. 進入 **Settings → Pages**。
4. Source 選擇 **Deploy from a branch**。
5. Branch 選擇 `main`，資料夾選 `/root`。
6. 儲存後等待 GitHub Pages 網址產生。

不需要 Firebase、資料庫伺服器或 API Key。

若要使用 LLM 輔助想定，才需自行在頁面輸入對應服務的 API Key。系統會將 Key 儲存在目前瀏覽器的 localStorage，不會包含在想定匯出檔；共用電腦使用完畢請按頁面上的「清除已儲存 API Key」。Gemini 的模型欄可填入帳戶可用的 `gemini-3.5-flash` 或 `gemini-3.6-flash`；實際模型名稱仍以該帳戶/API 版本提供者為準。

## 專案結構

```text
index.html
styles.css
app.js
data/
  demo-data.js
docs/
  system-spec.md
  course-guide.md
  data-model.md
  storm-teaching-lab.md
reference/
  taiwan_strait_wargame_demo.sqlite
  taiwan_strait_wargame_demo.xlsx
start-local.bat
start-local.command
LICENSE
```

`data/demo-data.js`、SQLite與Excel目前同步保存9種情境範本、62個介面設定、11項合成資源、26項回合行動及4個LLM供應商預設值。API Key不會寫入任何資料庫檔案。

## 資料與安全界線

- 公開來源目錄與少量國防部公告樣本屬真實公開資料。
- 兵力、能力、庫存、妥善、損失、機率、事件結果及區域位置均為合成示範。
- 不含精確軍事座標、真實單位部署、現役庫存、弱點、射擊表或可靠實戰效能。
- 不得用於真實目標選擇、武器配置、攔截規劃、漏洞分析或即時作戰支援。

## 未來擴充

目前採完全離線規則式生成器。未來可新增：

- 校內地端LLM想定文字生成
- 多使用者房間
- 白方裁決介面與人工修正紀錄
- IndexedDB大型情境庫
- 更完整的Monte Carlo批次分析與實驗資料匯出
- 模擬評分規準與分析歷程匯出
- 開放標準介接其他模擬器

詳見 `docs/system-spec.md`。
