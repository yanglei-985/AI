[00:00] Today we talk about the Sharpe ratio, the most common way to compare strategies.
> 今天讲夏普比率，它是比较策略时最常用的指标。

[00:20] The Sharpe ratio is the average excess return divided by the standard deviation of returns. It tells you how much return you earn per unit of risk.
> 夏普比率 = 平均超额收益 ÷ 收益的标准差，表示每承担一单位风险能获得多少收益。

[00:50] Daily Sharpe is usually annualized by multiplying by the square root of 252, because volatility scales with the square root of time.
> 日频夏普通常乘以 √252 年化，因为波动率随时间按平方根增长。

[01:25] Now the danger. If you test one hundred parameter combinations on the same data, the best one will look great purely by luck.
> 危险在于：同一份数据上试 100 组参数，最好的那组仅凭运气也会看起来很漂亮。

[02:00] This is overfitting, or data snooping. The more variations you try, the more you must discount the Sharpe ratio you found.
> 这就是过拟合（数据窥探）。尝试的变体越多，就越要对你找到的夏普比率打折。

[02:40] A good habit: keep an out-of-sample period you never touch while developing, and only look at it once at the end.
> 好习惯：留出一段开发期间绝不触碰的样本外数据，最后只看一次。
