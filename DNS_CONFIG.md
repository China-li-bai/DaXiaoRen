# DNS 配置指南

## 📋 概述

本指南帮助你配置 `dadaxiaoren.com` 域名的 DNS 解析。

---

## 🎯 推荐方案：Cloudflare Pages（最佳方案）

### 为什么选择 Cloudflare Pages？

✅ **免费 SSL 证书**：自动配置 HTTPS
✅ **全球 CDN**：快速访问
✅ **DDoS 防护**：保护网站安全
✅ **零配置部署**：GitHub 自动同步
✅ **自定义域名**：轻松绑定

### 配置步骤

#### 1. 添加域名到 Cloudflare

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击 "Add a Site"
3. 输入域名：`dadaxiaoren.com`
4. 选择 "Free" 计划
5. 点击 "Add Site"

#### 2. 配置 DNS 记录

Cloudflare 会自动扫描现有 DNS 记录，添加以下记录：

| 类型 | 名称 | 内容 | 代理状态 |
|------|------|------|----------|
| A | @ | 192.227.177.133 | 已代理（橙色云朵） |
| CNAME | www | @ | 已代理（橙色云朵） |

#### 3. 更新域名服务器

Cloudflare 会提供两个域名服务器，例如：

```
alice.ns.cloudflare.com
bob.ns.cloudflare.com
```

登录你的域名注册商（Namecheap, GoDaddy 等），将域名服务器更新为 Cloudflare 提供的服务器。

#### 4. 部署到 Cloudflare Pages

1. 在 Cloudflare Dashboard 中：
   - Workers & Pages → Create Application
   - 选择 Pages → Connect to Git
   - 授权 GitHub 并选择仓库
   - 构建设置：
     ```
     Build command: npm run build
     Build output directory: dist
     ```
2. 添加自定义域名：
   - Pages → 选择项目 → Custom domains
   - 添加 `dadaxiaoren.com` 和 `www.dadaxiaoren.com`

#### 5. 验证配置

```bash
# 检查 DNS 解析
dig dadaxiaoren.com

# 检查 HTTPS
curl -I https://dadaxiaoren.com
```

---

## 🔄 备选方案：VPS 直接部署

### 快速部署（推荐）

使用自动化部署脚本：

```bash
# 1. 上传脚本到 VPS
scp deploy-vps.sh root@192.227.177.133:~/

# 2. SSH 连接到 VPS
ssh root@192.227.177.133

# 3. 运行部署脚本
chmod +x deploy-vps.sh
sudo bash deploy-vps.sh
```

### 手动配置步骤

#### 1. DNS 记录配置

在你的域名注册商（如 Namecheap）添加以下记录：

| 类型 | 名称 | 内容 | TTL |
|------|------|------|-----|
| A | @ | 192.227.177.133 | 600 |
| A | www | 192.227.177.133 | 600 |

#### 2. 配置 Nginx

SSH 连接到 VPS：

```bash
ssh root@192.227.177.133
```

安装 Nginx：

```bash
apt update
apt install nginx -y
```

创建 Nginx 配置文件：

```bash
nano /etc/nginx/sites-available/dadaxiaoren.com
```

添加以下内容：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name dadaxiaoren.com www.dadaxiaoren.com;

    root /var/www/dadaxiaoren.com;
    index index.html;

    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
```

启用配置：

```bash
ln -s /etc/nginx/sites-available/dadaxiaoren.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx
```

#### 3. 部署应用

克隆仓库并构建：

```bash
# 创建网站目录
mkdir -p /var/www/dadaxiaoren.com
cd /var/www/dadaxiaoren.com

# 克隆仓库
git clone https://github.com/your-username/villainsmash.git .

# 安装依赖
npm install

# 构建项目
npm run build

# 复制构建产物
cp -r dist/* .
```

#### 4. 配置 SSL（使用 Certbot）

安装 Certbot：

```bash
apt install certbot python3-certbot-nginx -y
```

获取 SSL 证书：

```bash
certbot --nginx -d dadaxiaoren.com -d www.dadaxiaoren.com
```

自动续期：

```bash
certbot renew --dry-run
```

设置自动续期：

```bash
(crontab -l 2>/dev/null; echo "0 0 * * * certbot renew --quiet") | crontab -
```

#### 5. 配置防火墙

```bash
# 允许 HTTP 和 HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp

# 启用防火墙
ufw --force enable
```

### 更新网站

当有新代码时，运行：

```bash
cd /var/www/dadaxiaoren.com
git pull origin main
npm install
npm run build
cp -r dist/* .
systemctl reload nginx
```

---

## 🌐 DNS 记录说明

### A 记录

将域名指向 IPv4 地址。

```
类型: A
名称: @
内容: 192.227.177.133
```

### CNAME 记录

将子域名指向另一个域名。

```
类型: CNAME
名称: www
内容: dadaxiaoren.com
```

### MX 记录（邮件）

如果需要配置邮件服务：

```
类型: MX
名称: @
内容: mail.dadaxiaoren.com
优先级: 10
```

---

## 🧪 验证 DNS 配置

### 使用 dig 命令

```bash
# 检查 A 记录
dig dadaxiaoren.com A

# 检查 CNAME 记录
dig www.dadaxiaoren.com CNAME

# 检查 MX 记录
dig dadaxiaoren.com MX
```

### 使用 nslookup 命令（Windows）

```cmd
nslookup dadaxiaoren.com
```

### 在线工具

- [DNS Checker](https://dnschecker.org/)
- [MXToolbox](https://mxtoolbox.com/)
- [Cloudflare Diagnostic](https://1.1.1.1/diagnostic/)

---

## ⏱️ DNS 传播时间

DNS 更改通常需要 5 分钟到 48 小时在全球传播。

- **本地缓存**：立即生效（清除缓存后）
- **ISP 缓存**：5 分钟到 1 小时
- **全球传播**：24 到 48 小时

### 清除本地 DNS 缓存

**Windows**：

```cmd
ipconfig /flushdns
```

**macOS**：

```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Linux**：

```bash
sudo systemd-resolve --flush-caches
```

---

## 🚨 常见问题

### 1. DNS 解析失败

**原因**：
- DNS 记录配置错误
- 域名服务器未更新
- DNS 缓存未清除

**解决方法**：
- 检查 DNS 记录是否正确
- 等待 DNS 传播完成
- 清除本地 DNS 缓存

### 2. SSL 证书错误

**原因**：
- 域名未指向正确的服务器
- SSL 证书未正确配置

**解决方法**：
- 检查 A 记录是否正确
- 重新获取 SSL 证书
- 使用 Cloudflare 的 SSL 模式

### 3. 网站无法访问

**原因**：
- 服务器未运行
- 防火墙阻止访问
- Nginx 配置错误

**解决方法**：
- 检查服务器状态
- 检查防火墙规则
- 检查 Nginx 配置

---

## 📚 参考资料

- [Cloudflare DNS 文档](https://developers.cloudflare.com/dns/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Certbot 文档](https://certbot.eff.org/)

---

**最后更新**：2026-02-04
