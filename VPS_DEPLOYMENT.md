# VPS 部署完整指南

## 📋 概述

本指南详细介绍如何在 VPS 上部署 `dadaxiaoren.com` 网站。

**VPS 信息**：
- IP 地址：`192.227.177.133`
- 操作系统：Ubuntu/Debian（推荐）
- 域名：`dadaxiaoren.com`

---

## 🚀 快速开始（自动化部署）

### 前提条件

1. 拥有 VPS 的 root 访问权限
2. 域名已配置 DNS A 记录指向 VPS IP
3. 本地已安装 Git

### 部署步骤

#### 1. 准备部署脚本

在本地项目根目录，确保存在 `deploy-vps.sh` 脚本。

#### 2. 上传脚本到 VPS

```bash
scp deploy-vps.sh root@192.227.177.133:~/
```

#### 3. SSH 连接到 VPS

```bash
ssh root@192.227.177.133
```

#### 4. 运行部署脚本

```bash
chmod +x deploy-vps.sh
sudo bash deploy-vps.sh
```

脚本会自动完成以下操作：
- 更新系统
- 安装 Nginx、Git、Node.js、Certbot
- 克隆并构建项目
- 配置 Nginx
- 获取 SSL 证书
- 配置防火墙

#### 5. 验证部署

访问 `https://dadaxiaoren.com` 确认网站正常运行。

---

## 📝 手动部署步骤

### 第一步：DNS 配置

在你的域名注册商（如 Namecheap、GoDaddy）添加以下 DNS 记录：

| 类型 | 名称 | 内容 | TTL |
|------|------|------|-----|
| A | @ | 192.227.177.133 | 600 |
| A | www | 192.227.177.133 | 600 |

等待 DNS 传播完成（通常 5-30 分钟）。

### 第二步：连接 VPS

```bash
ssh root@192.227.177.133
```

### 第三步：更新系统

```bash
apt update && apt upgrade -y
```

### 第四步：安装必要软件

```bash
# 安装 Nginx
apt install nginx -y

# 安装 Git
apt install git -y

# 安装 Node.js 和 npm
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装 Certbot（SSL 证书）
apt install certbot python3-certbot-nginx -y
```

### 第五步：创建网站目录

```bash
mkdir -p /var/www/dadaxiaoren.com
cd /var/www/dadaxiaoren.com
```

### 第六步：克隆并构建项目

```bash
# 克隆仓库（替换为你的仓库地址）
git clone https://github.com/your-username/villainsmash.git .

# 安装依赖
npm install

# 构建项目
npm run build

# 复制构建产物
cp -r dist/* .
```

### 第七步：配置 Nginx

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

### 第八步：配置 SSL 证书

```bash
# 获取 SSL 证书
certbot --nginx -d dadaxiaoren.com -d www.dadaxiaoren.com

# 测试自动续期
certbot renew --dry-run
```

### 第九步：设置 SSL 自动续期

```bash
(crontab -l 2>/dev/null; echo "0 0 * * * certbot renew --quiet") | crontab -
```

### 第十步：配置防火墙

```bash
# 允许 HTTP 和 HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp

# 启用防火墙
ufw --force enable

# 查看防火墙状态
ufw status
```

---

## 🔄 更新网站

当有新代码需要部署时：

```bash
# SSH 连接到 VPS
ssh root@192.227.177.133

# 进入网站目录
cd /var/www/dadaxiaoren.com

# 拉取最新代码
git pull origin main

# 安装依赖（如有更新）
npm install

# 构建项目
npm run build

# 复制构建产物
cp -r dist/* .

# 重载 Nginx
systemctl reload nginx
```

---

## 🛠️ 常用命令

### Nginx 管理

```bash
# 查看状态
systemctl status nginx

# 启动
systemctl start nginx

# 停止
systemctl stop nginx

# 重启
systemctl restart nginx

# 重载配置
systemctl reload nginx

# 测试配置
nginx -t
```

### 查看日志

```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log

# 查看最后 100 行
tail -n 100 /var/log/nginx/access.log
```

### SSL 证书管理

```bash
# 查看证书信息
certbot certificates

# 手动续期
certbot renew

# 测试续期
certbot renew --dry-run

# 撤销证书
certbot revoke --cert-path /etc/letsencrypt/live/dadaxiaoren.com/cert.pem
```

### 防火墙管理

```bash
# 查看状态
ufw status

# 允许端口
ufw allow 8080/tcp

# 删除规则
ufw delete allow 8080/tcp

# 禁用防火墙
ufw disable
```

---

## 🔍 故障排查

### 网站无法访问

**检查 Nginx 状态**：

```bash
systemctl status nginx
```

**检查 Nginx 配置**：

```bash
nginx -t
```

**查看错误日志**：

```bash
tail -f /var/log/nginx/error.log
```

### SSL 证书错误

**检查证书状态**：

```bash
certbot certificates
```

**重新获取证书**：

```bash
certbot --nginx -d dadaxiaoren.com -d www.dadaxiaoren.com --force-renewal
```

### 端口被占用

**查找占用端口的进程**：

```bash
netstat -tulpn | grep :80
```

**终止进程**：

```bash
kill -9 <PID>
```

### 权限问题

**修复文件权限**：

```bash
chown -R www-data:www-data /var/www/dadaxiaoren.com
chmod -R 755 /var/www/dadaxiaoren.com
```

---

## 📊 性能优化

### 启用 HTTP/2

在 Nginx 配置中添加：

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    # ... 其他配置
}
```

### 启用 Brotli 压缩

安装 Brotli：

```bash
apt install libnginx-mod-http-brotli -y
```

在 Nginx 配置中添加：

```nginx
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
```

### 配置缓存

在 Nginx 配置中添加：

```nginx
# 浏览器缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# FastCGI 缓存（如使用 PHP）
fastcgi_cache_path /var/cache/nginx levels=1:2 keys_zone=fastcgi_cache:100m inactive=60m;
fastcgi_cache_key "$scheme$request_method$host$request_uri";
```

---

## 🔒 安全加固

### 配置 fail2ban

安装 fail2ban：

```bash
apt install fail2ban -y
```

创建 Nginx 监狱配置：

```bash
nano /etc/fail2ban/jail.local
```

添加以下内容：

```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 6
```

启动 fail2ban：

```bash
systemctl start fail2ban
systemctl enable fail2ban
```

### 限制请求速率

在 Nginx 配置中添加：

```nginx
# 在 http 块中
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

# 在 server 块中
limit_req zone=one burst=20 nodelay;
```

### 配置安全头部

在 Nginx 配置中添加：

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## 📚 参考资料

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Certbot 文档](https://certbot.eff.org/)
- [Let's Encrypt 文档](https://letsencrypt.org/docs/)
- [Ubuntu 防火墙文档](https://ubuntu.com/server/docs/security-firewall)

---

**最后更新**：2026-02-04
