import { Language, VillainType } from './types';

// CONFIGURATION: Replace these with your actual links!
export const PAYMENT_CONFIG = {
  creemUrl: "https://www.creem.io/your-profile", // Replace with your Creem.io link
  stripeUrl: "https://buy.stripe.com/your-link", // Replace with your Stripe Payment Link
  wechatQr: "https://via.placeholder.com/300?text=WeChat+Pay+QR", // Replace with your actual QR code image URL
  alipayQr: "https://via.placeholder.com/300?text=Alipay+QR",    // Replace with your actual QR code image URL
  freeCredits: 1, // Number of free tries per session
};

export const TRANSLATIONS = {
  en: {
    title: "VillainSmash",
    subtitle: "Digital Stress Relief Ritual",
    start: "Enter the Temple",
    inputTitle: "Who (or what) is disturbing your peace?",
    nameLabel: "Name of the Villain / Problem",
    typeLabel: "Type of Disturbance",
    reasonLabel: "Why do they deserve the shoe? (Optional)",
    placeholderName: "e.g., My Micromanaging Boss, Procrastination",
    placeholderReason: "e.g., Calling me at 9 PM on Friday...",
    submit: "Begin Ritual",
    generating: "Summoning the Spirits...",
    hitInstruction: "Tap the Villain to Strike!",
    hitsRemaining: "Hits Remaining",
    finish: "Banish Evil!",
    resolving: "Cleansing the Aura...",
    playAgain: "Perform Another Ritual",
    disclaimer: "Disclaimer: This application is a digital game designed for entertainment and stress relief only. It is not intended to promote hatred, violence, or genuine superstition. Please use responsibly.",
    agreeLabel: "I have read and agree to the disclaimer.",
    credits: "Karma Credits",
    outOfCredits: "Out of Karma Credits",
    recharge: "Recharge Karma",
    paymentTitle: "Offer Tribute to the Spirits",
    paymentDesc: "Your spiritual energy is depleted. Make an offering to continue the ritual.",
    payChina: "China (WeChat/Alipay)",
    payGlobal: "Global (Card/Crypto)",
    payWithCreem: "Support via Creem.io",
    payWithStripe: "Pay $0.99 via Stripe",
    scanToPay: "Scan QR Code to Support",
    iHavePaid: "I Have Completed the Offering",
    freeTrialEnded: "Free Trial Ended",
    types: {
      [VillainType.BOSS]: "Toxic Boss / Colleague",
      [VillainType.EX_PARTNER]: "Toxic Ex-Partner",
      [VillainType.FAKE_FRIEND]: "Backstabber / Fake Friend",
      [VillainType.BAD_HABIT]: "Bad Habit / Addiction",
      [VillainType.GENERAL_ANXIETY]: "General Anxiety / Bad Luck",
    }
  },
  zh: {
    title: "打小人在线",
    subtitle: "赛博驱邪 · 心理宣泄",
    start: "进入神庙",
    inputTitle: "谁在扰乱你的安宁？",
    nameLabel: "小人姓名 / 烦恼名称",
    typeLabel: "小人类型",
    reasonLabel: "为什么要打？(选填)",
    placeholderName: "例如：爱开会的老板，拖延症",
    placeholderReason: "例如：周五晚上九点给我打电话...",
    submit: "开始仪式",
    generating: "正在请神...",
    hitInstruction: "点击小人，用力打！",
    hitsRemaining: "剩余击打次数",
    finish: "驱除霉运！",
    resolving: "净化磁场...",
    playAgain: "再打一次",
    disclaimer: "免责声明：本应用仅为提供心理宣泄与娱乐的数字游戏，不提倡任何形式的仇恨、暴力或封建迷信。请理性使用，切勿沉迷。",
    agreeLabel: "我已阅读并同意免责声明",
    credits: "功德点数",
    outOfCredits: "功德不足",
    recharge: "补充功德",
    paymentTitle: "请神需供奉",
    paymentDesc: "您的免费次数已用完。请随喜香火钱，继续驱邪。",
    payChina: "国内支付 (微信/支付宝)",
    payGlobal: "国际支付 (海外)",
    payWithCreem: "通过 Creem.io 赞助",
    payWithStripe: "Stripe 支付 (推荐)",
    scanToPay: "扫码支付香火钱",
    iHavePaid: "我已完成支付",
    freeTrialEnded: "免费试用结束",
    types: {
      [VillainType.BOSS]: "职场小人 / 恶霸老板",
      [VillainType.EX_PARTNER]: "烂桃花 / 前任",
      [VillainType.FAKE_FRIEND]: "虚伪朋友 / 背后捅刀",
      [VillainType.BAD_HABIT]: "坏习惯 / 自身惰性",
      [VillainType.GENERAL_ANXIETY]: "水逆 / 焦虑 / 霉运",
    }
  }
};

export const TOTAL_HITS_REQUIRED = 20;
