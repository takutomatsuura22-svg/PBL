# 🏠 HOME Dashboard

**今日**:: `=date(today)`  
**週番号**:: `=this.week`  
**エネルギー**:: ☀️☀️☀️☀️☀️

## 🎯 今日のTop3
- [ ] ディープワーク: コンテンツ制作
- [ ] SURVIBE AI講座の仕込み
- [ ] 家族/メンテ作業

## ✅ 今日のタスク
```dataview
TASK
FROM "02_Daily"
WHERE !completed AND file.day = date(today)
SORT priority DESC
```

## 📚 最近の学び
```dataview
LIST file.link + " – " + choice(summary, summary, "メモなし")
FROM "04_Memory"
WHERE file.mtime >= date(today) - dur(2 days)
LIMIT 6
```

## 💧 エネルギーチェック
- 睡眠 : [ ] 7h以上
- 運動 : [ ] 有酸素または筋トレ
- 栄養 : [ ] 朝食/昼食/夕食
