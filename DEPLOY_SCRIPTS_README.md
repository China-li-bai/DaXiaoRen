# 部署脚本使用指南

## 📋 概述

本项目提供了两个部署脚本，分别用于**第一次部署**和**后续部署**。

| 脚本 | 用途 | 使用频率 |
|------|------|---------|
| [deploy-first-time.sh](deploy-first-time.sh) | 第一次部署（初始化服务器）| 只做一次 |
| [deploy-update.sh](deploy-update.sh) | 后续部署（更新代码）| 每次代码更新 |

---

## 🚀 第一次部署

### 使用场景

- 新购买的 VPS
- 首次部署 `dadaxiaoren.com`
- 需要配置服务器环境

### 使用方法

#### 1. 上传脚本到 VPS

```bash
scp deploy-first-time.sh root@192.227.177.133:~/
```

#### 2. SSH 连接到 VPS

```bash
ssh root@192.227.177.133
```

#### 3. 运行脚本

```bash
chmod +x ~/deploy-first-time.sh
sudo bash ~/deploy-first-time.sh
```

### 脚本会自动完成

- ✅ 更新系统
- ✅ 安装 Nginx、Git、Node.js
- ✅ 配置防火墙
- ✅ 创建网站目录
- ✅ 克隆代码仓库
- ✅ 构建项目
- ✅ 配置 Nginx
- ✅ 启动 Nginx

### 手动步骤

如果脚本执行失败，请参考 [FIRST_DEPLOYMENT.md](FIRST_DEPLOYMENT.md) 手动完成部署。

---

## 🔄 后续部署

### 使用场景

- 代码已更新
- 需要部署新版本
- 服务器环境已配置完成

### 使用方法

#### 方法 1：直接运行脚本（推荐）

```bash
# 在本地项目根目录运行
chmod +x deploy-update.sh
./deploy-update.sh
```

#### 方法 2：一键命令

```bash
npm run build && \
scp -r dist/* root@192.227.177.133:/var/www/dadaxiaoren.com/ && \
ssh root@192.227.177.133 "systemctl reload nginx"
```

### 脚本会自动完成

- ✅ 本地构建项目
- ✅ 上传文件到 VPS
- ✅ 重载 Nginx
- ✅ 验证部署

---

## 📊 脚本对比

| 功能 | 第一次部署脚本 | 后续部署脚本 |
|------|-------------|-------------|
| 系统更新 | ✅ | ❌ |
| 安装软件 | ✅ | ❌ |
| 配置防火墙 | ✅ | ❌ |
| 创建目录 | ✅ | ❌ |
| 克隆代码 | ✅ | ❌ |
| 构建项目 | ✅ | ✅ |
| 上传文件 | ✅ | ✅ |
| 配置 Nginx | ✅ | ❌ |
| 重载 Nginx | ✅ | ✅ |
| 验证部署 | ✅ | ✅ |

---

## 🔧 配置变量

### deploy-first-time.sh

如需修改配置，编辑脚本中的变量：

```bash
VPS_IP="192.227.177.133"          # VPS IP 地址
WEB_ROOT="/var/www/dadaxiaoren.com" # 网站根目录
DOMAIN="dadaxiaoren.com"              # 主域名
REPO_URL="https://github.com/China-li-bai/DaXiaoRen.git"  # 仓库地址
BRANCH="dev"                        # 分支名称
```

### deploy-update.sh

如需修改配置，编辑脚本中的变量：

```bash
VPS_IP="192.227.177.133"          # VPS IP 地址
WEB_ROOT="/var/www/dadaxiaoren.com" # 网站根目录
DOMAIN="dadaxiaoren.com"              # 域名
```

---

## 🚨 故障排查

### 第一次部署脚本失败

#### 问题：SSH 连接失败

```bash
# 检查网络连接
ping 192.227.177.133

# 检查 SSH 服务
ssh root@192.227.177.133 "echo 'SSH OK'"
```

#### 问题：权限不足

```bash
# 使用 sudo 运行脚本
sudo bash deploy-first-time.sh
```

#### 问题：Node.js 安装失败

```bash
# 手动安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 验证安装
node -v
npm -v
```

### 后续部署脚本失败

#### 问题：构建失败

```bash
# 检查本地 Node.js 版本
node -v

# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 问题：上传失败

```bash
# 检查 SSH 连接
ssh root@192.227.177.133 "echo 'SSH OK'"

# 检查目录权限
ssh root@192.227.177.133 "ls -la /var/www/dadaxiaoren.com"
```

#### 问题：Nginx 重载失败

```bash
# 检查 Nginx 配置
ssh root@192.227.177.133 "nginx -t"

# 查看错误日志
ssh root@192.227.177.133 "tail -20 /var/log/nginx/error.log"
```

---

## 📚 相关文档

| 文档 | 用途 |
|------|------|
| [FIRST_DEPLOYMENT.md](FIRST_DEPLOYMENT.md) | 第一次部署详细指南 |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 整体部署方案 |
| [DNS_CONFIG.md](DNS_CONFIG.md) | DNS 配置指南 |
| [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) | VPS 部署完整指南 |

---

## 🎯 快速参考

### 第一次部署流程

```
1. 上传 deploy-first-time.sh 到 VPS
2. SSH 连接到 VPS
3. 运行脚本
4. 配置 DNS
5. 配置 Cloudflare
6. 验证部署
```

### 后续部署流程

```
1. 修改代码
2. 运行 deploy-update.sh
3. 验证部署
```

---

## ✅ 部署成功标志

### 第一次部署完成后

- [ ] Nginx 正常运行
- [ ] 网站可以访问
- [ ] DNS 已配置
- [ ] Cloudflare 已配置

### 后续部署完成后

- [ ] 构建成功
- [ ] 文件上传成功
- [ ] Nginx 重载成功
- [ ] 网站更新正常

---

**最后更新**：2026-02-04
