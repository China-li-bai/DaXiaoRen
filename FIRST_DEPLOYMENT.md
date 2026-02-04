# 第一次部署完整指南

## 📋 概述

本文档详细说明如何在 VPS 上**第一次部署** `dadaxiaoren.com` 网站。

**VPS 信息**：
- IP 地址：`192.227.177.133`
- 操作系统：Debian 12
- 域名：`dadaxiaoren.com`

---

## 🎯 部署前准备

### 1. 准备工作

- [ ] 拥有 VPS 的 root 访问权限
- [ ] 域名已购买
- [ ] 本地已安装 SSH 客户端

### 2. 获取必要信息

| 信息 | 值 |
|------|-----|
| VPS IP | 192.227.177.133 |
| SSH 用户名 | root |
| SSH 端口 | 22 |
| 域名 | dadaxiaoren.com |

---

## 🚀 部署步骤

### 步骤 1：测试 SSH 连接

```bash
ssh root@192.227.177.133
```

如果连接成功，继续下一步。

---

### 步骤 2：更新系统

```bash
apt update && apt upgrade -y
```

---

### 步骤 3：安装必要软件

```bash
# 安装 Nginx
apt install nginx -y

# 安装 Git
apt install git -y

# 安装 Node.js（使用 NodeSource 仓库）
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装 Certbot（SSL 证书）
apt install certbot python3-certbot-nginx -y
```

---

### 步骤 4：配置防火墙

```bash
# 允许 HTTP
ufw allow 80/tcp

# 允许 HTTPS
ufw allow 443/tcp

# 允许 SSH
ufw allow 22/tcp

# 启用防火墙
ufw --force enable

# 查看防火墙状态
ufw status
```

---

### 步骤 5：创建网站目录

```bash
# 创建网站根目录
mkdir -p /var/www/dadaxiaoren.com

# 设置目录权限
chown -R $USER:$USER /var/www/dadaxiaoren.com
chmod -R 755 /var/www/dadaxiaoren.com
```

---

### 步骤 6：克隆代码仓库

```bash
# 进入网站目录
cd /var/www/dadaxiaoren.com

# 克隆仓库
git clone https://github.com/China-li-bai/DaXiaoRen.git .
```

---

### 步骤 7：构建项目

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 复制构建产物
cp -r dist/* .
```

---

### 步骤 8：配置 Nginx

#### 8.1 创建 Nginx 配置文件

```bash
cat > /etc/nginx/sites-available/dadaxiaoren.com << 'EOF'
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
EOF
```

#### 8.2 启用配置

```bash
# 创建符号链接
ln -sf /etc/nginx/sites-available/dadaxiaoren.com /etc/nginx/sites-enabled/

# 删除默认配置
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx

# 启用 Nginx 开机自启
systemctl enable nginx
```

---

### 步骤 9：配置 DNS

在你的域名注册商（如 Namecheap、GoDaddy）添加以下 DNS 记录：

| 类型 | 名称 | 内容 | TTL |
|------|------|------|-----|
| A | @ | 192.227.177.133 | 600 |
| A | www | 192.227.177.133 | 600 |

**等待 DNS 传播**：通常需要 5-30 分钟。

---

### 步骤 10：配置 Cloudflare

#### 10.1 添加站点到 Cloudflare

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击"添加站点"
3. 输入域名：`dadaxiaoren.com`
4. 选择"免费"计划
5. 扫描现有 DNS 记录

#### 10.2 更新域名服务器

Cloudflare 会提供两个域名服务器，例如：
- `xxx.ns.cloudflare.com`
- `yyy.ns.cloudflare.com`

在你的域名注册商更新域名服务器为 Cloudflare 提供的服务器。

#### 10.3 配置 SSL 模式

1. 在 Cloudflare Dashboard 中选择 `dadaxiaoren.com`
2. 进入 **SSL/TLS** → **Overview**
3. 将加密模式设置为：**Flexible**

**为什么选择 Flexible**：
- 源服务器（Nginx）只监听 HTTP (端口 80)
- Cloudflare ↔ 用户：HTTPS
- Cloudflare ↔ 源服务器：HTTP

#### 10.4 确认 DNS 记录

确保 DNS 记录状态为：
- 代理状态：橙色云朵（已代理）
- 记录类型：A
- 内容：`192.227.177.133`

---

### 步骤 11：验证部署

#### 11.1 检查 Nginx 状态

```bash
systemctl status nginx
```

应该显示：`Active: active (running)`

#### 11.2 检查端口监听

```bash
netstat -tlnp | grep nginx
```

应该显示：
```
tcp  0  0  0.0.0.0:80  0.0.0.0:*  LISTEN  664/nginx
```

#### 11.3 测试网站访问

```bash
# 测试 HTTP 访问
curl -I http://192.227.177.133

# 测试域名访问（DNS 传播后）
curl -I http://dadaxiaoren.com
```

应该返回：`HTTP/1.1 200 OK`

#### 11.4 检查网站内容

```bash
curl -s http://dadaxiaoren.com | head -20
```

应该看到 HTML 内容。

---

## ✅ 部署完成检查清单

### 服务器配置

- [ ] 系统已更新
- [ ] Nginx 已安装并运行
- [ ] Node.js 已安装
- [ ] Git 已安装
- [ ] 防火墙已配置
- [ ] 网站目录已创建

### 项目部署

- [ ] 代码已克隆
- [ ] 依赖已安装
- [ ] 项目已构建
- [ ] 构建产物已复制
- [ ] Nginx 配置已创建
- [ ] Nginx 已重启

### 域名配置

- [ ] DNS 记录已添加
- [ ] 域名服务器已更新为 Cloudflare
- [ ] Cloudflare 站点已添加
- [ ] SSL 模式已设置为 Flexible

### 验证测试

- [ ] Nginx 状态正常
- [ ] 端口监听正常
- [ ] IP 访问正常
- [ ] 域名访问正常
- [ ] 网站内容正确显示

---

## 🔍 故障排查

### 问题 1：SSH 连接失败

**可能原因**：
- SSH 端口未开放
- IP 地址错误
- 网络问题

**解决方案**：
```bash
# 检查防火墙
ufw status

# 检查 SSH 服务
systemctl status ssh
```

### 问题 2：Nginx 无法启动

**可能原因**：
- 配置文件语法错误
- 端口被占用

**解决方案**：
```bash
# 测试配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log

# 检查端口占用
netstat -tlnp | grep :80
```

### 问题 3：DNS 未传播

**可能原因**：
- DNS 记录配置错误
- 域名服务器未更新
- 传播时间不足

**解决方案**：
```bash
# 查询 DNS 记录
nslookup dadaxiaoren.com

# 查询域名服务器
dig NS dadaxiaoren.com
```

### 问题 4：Cloudflare 错误 521

**可能原因**：
- SSL 模式不匹配
- 源服务器未运行
- 防火墙阻止 Cloudflare

**解决方案**：
1. 检查 Nginx 是否运行：`systemctl status nginx`
2. 检查防火墙：`ufw status`
3. 将 Cloudflare SSL 模式改为 **Flexible**

### 问题 5：网站显示 404

**可能原因**：
- 文件路径错误
- Nginx 配置错误

**解决方案**：
```bash
# 检查文件是否存在
ls -la /var/www/dadaxiaoren.com/

# 检查 Nginx 配置
cat /etc/nginx/sites-available/dadaxiaoren.com
```

---

## 📚 相关文档

| 文档 | 用途 |
|------|------|
| [deploy-first-time.sh](deploy-first-time.sh) | 第一次部署自动化脚本 |
| [deploy-update.sh](deploy-update.sh) | 后续部署快速脚本 |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 整体部署方案 |
| [DNS_CONFIG.md](DNS_CONFIG.md) | DNS 配置指南 |

---

## 🎉 完成第一次部署后

第一次部署完成后，后续更新代码只需使用 [`deploy-update.sh`](deploy-update.sh) 脚本，无需重复配置服务器环境。

**后续部署命令**：
```bash
./deploy-update.sh
```

---

**最后更新**：2026-02-04
