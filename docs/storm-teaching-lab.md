# STORM 作戰研究教學實驗室

## 名稱
STORM：Synthetic Theater Operations Research Model。

公開文獻將其描述為戰役層級、資料驅動且具隨機性的分析模型。本專案建立的是 **STORM-inspired educational model**，用於教授建模模擬、作戰研究與實驗設計，不是正式STORM。

## 學習目標
學生完成本單元後，應能：
1. 說明戰役分析模型的系統、能力、計畫、執行與影響鏈結。
2. 說明C2、Assets、Intelligence、Interactions及Environment的責任。
3. 區分單次模擬結果、結果分布與平均值估計。
4. 解讀成功率、標準差、百分位與信賴區間。
5. 執行基本敏感度分析。
6. 使用2³設計理解主效應及交互作用。
7. 說明模型驗證、效度、資料品質與倫理限制。

## 互動模組
### 戰役分析流程
點選五個階段查看模型責任及課堂問題。

### 五種表徵
每一表徵包含：
- 模型責任
- 示範資料
- 教學提問

### 批次實驗
可設定：
- C2
- ISR
- 資產準備度
- 後勤持續性
- 機動
- 環境
- 對手壓力
- 民事暴露
- COA
- 成功門檻
- 重複次數與種子

### COA比較
四種方案：
- 均衡韌性防衛
- 集中主要方向
- 後勤優先
- 分散式ISR與指管

### DOE
2³設計同時改變：
- C2
- ISR
- 後勤

系統計算A、B、C、AB、AC、BC及ABC效果。

## 教師示範建議
1. 固定種子，先比較COA。
2. 更換種子，觀察方案排序是否穩定。
3. 將重複次數從30改成300，觀察平均值區間。
4. 提高成功門檻，討論成功定義如何改變結論。
5. 提高民事暴露，討論多準則決策。
6. 執行DOE後，讓學生設計下一輪實驗。

## 公開參考
- Naval Postgraduate School thesis: Improving the Analysis Capabilities of STORM.
- Winter Simulation Conference: Enhancing the Analytic Utility of STORM.
- Naval Postgraduate School research on applying DOE to STORM.

## 安全聲明
本模組不含真實部署、庫存、弱點、射擊表、精確地理資料或可靠實戰效能。任何結果都不能用於真實作戰規劃。
