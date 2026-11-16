# 食刻 AI 3.0

面向学生和职场人群的饮食、饮水、心情与营养管理网页。当前工程保留 Work 中已经完成的 3.0 交互设计，并整理为可继续由 Codex Cloud 开发的静态前端 + Node 服务端结构。

## 运行

```bash
npm run check
npm start
```

然后访问 `http://localhost:8787`。项目不依赖第三方 npm 包，Node 18+ 即可运行。

## DeepSeek 安全接入

不要把 API Key 写入前端或提交到 GitHub。将 `DEEPSEEK_API_KEY` 配置到 Codex Cloud Personal vault 或部署平台的服务端环境变量。前端未来调用 `/api/ai/chat`，服务端再访问 DeepSeek。`/api/ai/analyze-food` 已保留入口，目前返回 501，避免把模拟识别结果误认为真实分析。

## 功能状态

### 已可体验（当前浏览器本地数据）

- 综合健康仪表盘、热量和营养素统计
- 文字记录、手动修改、饮水记录
- 餐前/餐后心情、满意度、花费、用餐时长
- 饮食历史、趋势、日报/周报入口
- AI 助手交互界面（当前为本地规则摘要）
- 健康知识栏目与中国大陆官方来源链接
- 个人中心、设置、语言切换和完整功能免费使用

### 明确标注的模拟或预览

- 拍照上传目前只做本地预览和记录入口，尚未调用视觉模型自动计算热量。
- AI 助手尚未接入真实模型，接口已在服务端预留。
- 报告按当前浏览器保存的数据生成，尚未接入账号和云端数据库。
- 当前不设置 Pro 会员、额度限制或支付流程。

## 目录

- `dist/`：现有 3.0 前端页面、样式和交互
- `server.mjs`：静态文件服务与 DeepSeek 服务端代理
- `.env.example`：环境变量模板
- `README.md`：运行和功能说明

## 后续建议

Codex Cloud 接手后，可先把 `/api/ai/chat` 接入前端 AI 助手，再增加图片输入模型、D1/Postgres 数据库、用户登录和真实订阅支付。所有密钥继续放在 Personal vault 或部署环境变量中。

## 照片营养分析

选择 JPEG、PNG、GIF、WebP 照片（最大 15 MB）后，前端将图片发送至
`POST /api/ai/analyze-food`，成功后自动打开可编辑的饮食记录表单。
食物名称、热量（kcal）、蛋白质、碳水、脂肪（g）均为整餐估算，保存前需核对。
分析失败或未配置时仍可手动填写；不保存原始照片到服务端磁盘。

服务端直接复用 `process.env.DEEPSEEK_API_KEY`，不需要额外视觉密钥。
图片使用 base64 data URL 发送至 `https://api.deepseek.com/chat/completions`，
模型固定为 `deepseek-flash`。需允许访问 `api.deepseek.com`。
模型可用性及图片支持以实际 API 响应为准；调用失败不会生成模拟识别数据。
Node 24 云环境启动命令：`NODE_USE_ENV_PROXY=1 npm start`。
