// 角标标签：一个标签同时具备「置顶」与「底部角标」两种功能。
// 命中这些标签的卡片会被放到推广位（原置顶推广位），并在卡片底部渲染带色角标。
export const BADGE_TAGS = ['领优惠券', '好物精选', '人气优选', '口碑推荐', '编辑推荐'];

// 特殊标签：仅用于代码识别广告位，不应作为普通标签展示给用户
export const TAG_AD_TAG = '标签广告';

// 普通卡片上需要隐藏的特殊标签（给代码看、不给用户看）
export const HIDDEN_TAGS = [TAG_AD_TAG];

// 推广位（角标位）最多展示数量
export const MAX_PROMOTED = 5;
