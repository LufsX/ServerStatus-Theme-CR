# [ServerStatus Theme CR](https://github.com/LufsX/ServerStatus-Theme-CR)

这是一个基于 Next.js 和 TailwindCSS 开发的 ServerStatus 主题

This is a ServerStatus theme developed using Next.js and TailwindCSS

## 简介 Description

已验证正常使用的 ServerStatus 数据源

The ServerStatus data source has been verified for normal use

- [zdz/ServerStatus-Rust](https://github.com/zdz/ServerStatus-Rust)
- [cppla/ServerStatus](https://github.com/cppla/ServerStatus)

> 建议使用 [ServerStatus-Rust](https://github.com/zdz/ServerStatus-Rust) 作为数据源，展示的信息更多
> Suggested to use [ServerStatus-Rust](https://github.com/zdz/ServerStatus-Rust) as the data source, which provides more information

## 预览 Preview

[在线预览](https://sstcr.isteed.cc) | [Online Preview](https://serverstatus-theme-cr.vercel.app)

## 特性 Features

- 使用 Next.js 和 TailwindCSS 开发
- 响应式设计，适配手机、平板和桌面设备
- 支持基于节点和状态筛选服务器
- 支持深色模式和浅色模式自动/手动切换
- 支持卡片和列表布局切换
- 支持通过环境变量设置 API 地址

---

- Used Next.js and TailwindCSS for development
- Responsive design, compatible with mobile, tablet, and desktop devices
- Supports filtering servers by node and status
- Supports automatic/manual switching between dark mode and light mode
- Supports switching between card and list layouts
- Supports setting API address through environment variables

## 使用 Usage

若 ServerStatus API 地址公开访问且设置好了跨域访问（不在意地址暴露的话），可直接部署到 Vercel 平台

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/clone?repository-url=https%3A%2F%2Fgithub.com%2FLufsX%2FServerStatus-Theme-CR&env=NEXT_PUBLIC_API_BASE_URL)

---

编译好的静态文件见 [Release 页面](https://github.com/LufsX/ServerStatus-Theme-CR)，下载并替换掉原有主题即可，或是可以通过反向代理挂载主题

具体可见 [ServerStatus#6.FAQ](https://github.com/zdz/ServerStatus-Rust#6-faq)

---

If the ServerStatus API address is publicly accessible and CORS is set up (if you don't mind the address being exposed), you can deploy it directly to the Vercel platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/clone?repository-url=https%3A%2F%2Fgithub.com%2FLufsX%2FServerStatus-Theme-CR&env=NEXT_PUBLIC_API_BASE_URL)

---

The compiled static files can be found in the [Release page](https://github.com/LufsX/ServerStatus-Theme-CR), download and replace the original theme, or you can mount the theme through reverse proxy

For details, see [ServerStatus#6.FAQ](https://github.com/zdz/ServerStatus-Rust#6-faq)

## 其它 Other

### 开发 Development

```bash
pnpm i
pnpm dev
```

### 构建 Build

```bash
pnpm build
```

### 待办 To-Do

- [ ] 支持排序
- [ ] 添加精简显示
- [ ] 添加 CPU 图表
- [ ] 添加 i18n 支持
