# 声音开关功能实现

## 📝 功能概述

为打小人仪式界面添加了声音开关功能，让用户可以控制是否播放咒语语音，避免吓到用户。

## ✨ 主要功能

### 1. 声音开关按钮

**位置**：页面右上角，在线人数旁边

**图标**：
- 🔊 声音开启
- 🔇 声音关闭

**交互**：
- 点击切换声音状态
- 悬停显示提示文字（"关闭声音"/"开启声音"）
- 状态持久化到 localStorage

### 2. 咒语区域提示

**声音关闭时**：
- 在咒语标题旁显示 "🔇 声音已关闭" 提示
- 每个咒语行的播放按钮变为禁用状态（透明度降低）
- 悬停禁用按钮时显示提示："请先开启声音"

**声音开启时**：
- 正常显示咒语内容
- 播放按钮可用
- 点击咒语行或播放按钮可以播放语音

### 3. 状态持久化

使用 localStorage 保存声音开关状态：
- 键名：`soundEnabled`
- 值：`"true"` 或 `"false"`
- 默认值：`true`（开启声音）

## 🔧 技术实现

### 代码修改

#### 1. 添加状态管理

```typescript
const [soundEnabled, setSoundEnabled] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? saved === 'true' : true;
  }
  return true;
});
```

#### 2. 修改语音播放函数

```typescript
const speakChant = (text: string) => {
  if (speechSupported && soundEnabled) {
    speak(text);
  }
};

const speakAllChants = () => {
  if (speechSupported && soundEnabled && !hasAutoPlayed && chantData.chantLines.length > 0) {
    setHasAutoPlayed(true);
    const allChants = chantData.chantLines.join('，');
    speak(allChants);
  }
};
```

#### 3. 添加切换函数

```typescript
const toggleSound = () => {
  setSoundEnabled(prev => {
    const newValue = !prev;
    localStorage.setItem('soundEnabled', String(newValue));
    return newValue;
  });
};
```

#### 4. UI 组件

**声音开关按钮**：
```tsx
<button
  onClick={toggleSound}
  className="bg-slate-800/80 backdrop-blur-sm border border-slate-600 rounded-full px-3 py-1 flex items-center gap-2 hover:bg-slate-700/80 transition-colors"
  title={soundEnabled ? '关闭声音' : '开启声音'}
>
  {soundEnabled ? (
    <span className="text-lg">🔊</span>
  ) : (
    <span className="text-lg">🔇</span>
  )}
</button>
```

**咒语行播放按钮**：
```tsx
<button 
  className="text-slate-500 hover:text-amber-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
  onClick={(e) => {
    e.stopPropagation();
    speakChant(line);
  }}
  disabled={!soundEnabled}
  title={!soundEnabled ? '请先开启声音' : undefined}
>
  🔊
</button>
```

## 🎨 交互设计

### 用户体验流程

1. **首次访问**：
   - 声音默认开启
   - 用户点击小人时自动播放咒语
   - 可以随时点击右上角按钮关闭声音

2. **关闭声音后**：
   - 右上角显示 🔇 图标
   - 咒语区域显示 "🔇 声音已关闭" 提示
   - 播放按钮变为禁用状态
   - 点击小人不再播放语音

3. **重新开启声音**：
   - 点击右上角按钮切换到 🔊
   - 提示消失
   - 播放按钮恢复可用
   - 可以正常播放语音

### 视觉反馈

- **按钮悬停**：背景色变深，提供视觉反馈
- **禁用状态**：透明度降低到 30%，明确表示不可用
- **提示文字**：使用 `animate-pulse` 动画，引起注意
- **图标切换**：🔊 和 🔇 清晰表示声音状态

## 📊 布局设计

### 控制栏布局

**位置**：绝对定位到右上角（`top-2 right-2`）

**排列**：水平排列，间距 8px（`gap-2`）

**层级**：`z-50`，确保在其他元素之上

**样式**：
- 半透明背景（`bg-slate-800/80`）
- 毛玻璃效果（`backdrop-blur-sm`）
- 边框（`border border-slate-600`）
- 圆角（`rounded-full`）

### 咒语区域布局

**位置**：主要内容区域的顶部

**样式**：
- 半透明黑色背景（`bg-black/60`）
- 红色边框（`border-red-800`）
- 毛玻璃效果（`backdrop-blur-sm`）
- 圆角（`rounded-lg`）

**内部结构**：
1. 标题栏（包含标题和声音提示）
2. 说明文字
3. 咒语列表（每行一个，交替颜色）

### 咒语行布局

**排列**：水平居中，间距 8px（`gap-2`）

**交互**：
- 整行可点击播放
- 悬停显示播放按钮
- 播放按钮独立可点击

**颜色**：
- 偶数行：琥珀色（`text-amber-400`）
- 奇数行：红色（`text-red-400`）

## 🎯 依赖关系和上下文数据传递

### 保持的核心逻辑

1. **语音合成功能**：
   - `useSpeechSynthesis` hook 的调用方式不变
   - 只是在调用前检查 `soundEnabled` 状态
   - 不影响语音合成本身的实现

2. **自动播放逻辑**：
   - 第一次点击小人时自动播放所有咒语
   - 只播放一次（`hasAutoPlayed` 状态）
   - 声音关闭时不触发自动播放

3. **PartyKit 通信**：
   - WebSocket 连接和消息处理不受影响
   - HIT、SYNC、COMPLETION 等消息正常处理
   - 在线人数显示正常

4. **打小人核心逻辑**：
   - 点击处理（`handleHit`）不受影响
   - 连击系统（Combo）正常工作
   - 进度计算和完成触发保持不变

### 新增的状态管理

1. **`soundEnabled`**：
   - 独立状态，不影响其他逻辑
   - 通过 localStorage 持久化
   - 只在语音播放时检查

2. **`toggleSound`**：
   - 独立函数，不依赖其他状态
   - 直接修改 `soundEnabled` 和 localStorage
   - 不触发副作用

## 🔍 测试要点

### 功能测试

1. **声音开关**：
   - 点击按钮可以切换声音状态
   - 图标正确显示（🔊/🔇）
   - 状态正确保存到 localStorage

2. **语音播放**：
   - 声音开启时可以播放咒语
   - 声音关闭时不播放
   - 自动播放在第一次点击时触发

3. **视觉反馈**：
   - 声音关闭时显示提示
   - 播放按钮正确禁用/启用
   - 悬停提示正确显示

### 兼容性测试

1. **浏览器兼容性**：
   - localStorage 支持检查
   - 语音合成支持检查
   - 按钮禁用状态支持

2. **持久化测试**：
   - 刷新页面后声音状态保持
   - 关闭浏览器后重新打开状态保持
   - 清除 localStorage 后恢复默认值

## 📝 注意事项

1. **不破坏原有逻辑**：
   - 所有修改都是条件判断，不改变原有流程
   - 新增状态独立管理，不影响其他状态
   - UI 修改只增加提示，不改变布局结构

2. **用户体验优先**：
   - 默认开启声音，保持原有体验
   - 提供明确的视觉反馈
   - 禁用状态有明确提示

3. **代码可维护性**：
   - 状态管理清晰
   - 函数职责单一
   - UI 组件结构清晰

## 🎊 总结

成功添加了声音开关功能，用户可以自由控制是否播放咒语语音。实现方式简洁优雅，不影响原有核心逻辑，提供了良好的用户体验和视觉反馈。
