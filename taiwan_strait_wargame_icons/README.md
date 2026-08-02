# 台海兵推 16×16 單色像素圖標

- 共 48 個不重複軍備、設施與單位。
- `svg/`：16×16 透明背景 SVG，使用 `fill="currentColor"`，適合內嵌後依陣營換色。
- `gif/`：16×16 黑色單色透明 GIF。
- `preview_8x/`：放大 8 倍的陣營色 PNG，僅供檢視。
- `manifest.csv` / `manifest.json`：附件項目與圖檔名稱對照。
- `contact_sheet.png`：全部圖標總覽。
- `index.html`：本機或網站預覽頁。

## SVG 換色範例

將 SVG 原始碼直接內嵌頁面後：

```html
<span style="color:#2563eb">
  <!-- 貼上 svg 檔內容 -->
</span>
```

或作為 CSS mask：

```css
.icon {
  width: 32px; height: 32px;
  background: #2563eb;
  mask: url('svg/blue_f16v.svg') center / contain no-repeat;
  -webkit-mask: url('svg/blue_f16v.svg') center / contain no-repeat;
  image-rendering: pixelated;
}
```

圖標是遊戲化的辨識性剪影，不代表精密工程外形或比例。
