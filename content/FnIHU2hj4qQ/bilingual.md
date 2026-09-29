[00:00] GARCH vs ARIMA, a comparison of two time series models. Welcome to this educational video where we'll explore and compare two widely used time series models, ARIMA and GARCH. These models serve different purposes in forecasting and analyzing time-dependent data. Let's break down their differences, strengths and use cases. ARIMA stands for Auto Regressive Integrated Moving Average. It is a linear model used to forecast a variable based on its own past values and past errors.
> 本视频比较两个常用时间序列模型：ARIMA 与 GARCH。它们用途不同。ARIMA（自回归综合移动平均）是一个线性模型，根据变量自身的过去值和过去误差来预测该变量。

[00:34] The model has three components. AR, autoregressive, uses the relationship between an observation and a number of lagged observations. I, integrated, applies differencing to make the time series stationary. And MA, moving average, uses the relationship between an observation and a lagged error term. GARCH stands for Generalized Autoregressive Conditional Heteroscedasticity. It is used primarily to model volatility, especially in financial time series like stock returns.
> ARIMA 有三个组成部分：AR（自回归）利用一个观测值与若干滞后观测值之间的关系；I（差分整合）通过差分让时间序列平稳；MA（移动平均）利用观测值与滞后误差项的关系。GARCH（广义自回归条件异方差）主要用于对波动率建模，尤其是股票收益等金融时间序列。

[01:05] While ARIMA models the mean of a time series, GARCH models the variance, which often changes over time in financial data. GARCH-PQ captures P, lagged values of past variance, also known as ARCH terms, and Q, lagged squared residuals, known as GARCH terms. Alright, let's compare them directly ARIMA is often used for datasets like monthly sales where patterns are more predictable over longer periods on the other hand GARCH is more suited for daily stock returns capturing the volatility and unpredictability of financial markets.
> ARIMA 建模的是时间序列的「均值」，GARCH 建模的是随时间变化的「方差」（金融数据里方差往往不恒定）。GARCH(p,q) 包含 p 项滞后的方差和 q 项滞后的平方残差。（注意：视频把这两类项的名称说反了——标准叫法是滞后方差项为 GARCH 项、滞后平方残差项为 ARCH 项。）对比：ARIMA 常用于像月度销量这类长期模式较可预测的数据；GARCH 更适合日度股票收益，能刻画金融市场的波动与不可预测性。

[01:42] Use ARIMA when your primary goal is to predict future values in a time series that doesn't show changing variance. It's widely used in economic forecasting, energy demand and environmental data. Use GARCH when dealing with financial data, especially where volatility is not constant. For example in asset returns, where sudden market shocks lead to volatility clustering. Example, forecasting next month's rainfall? Use ARIMA. Estimating risk in stock returns? Use GARCH.
> 当你的主要目标是预测序列的未来值、且方差不随时间变化时用 ARIMA，常见于经济预测、能源需求和环境数据。当处理金融数据、尤其波动率不恒定时用 GARCH，例如资产收益中突发冲击导致的「波动率聚集」。例：预测下月降雨量用 ARIMA；估计股票收益的风险用 GARCH。

[02:12] Yes, a common approach in finance is to use ARIMA for modeling the mean and GARCH for modeling the variance of the residuals, this hybrid model is useful when both trend and volatility need to be captured. To summarize, ARIMA is great for forecasting values, GARCH is ideal for forecasting variance or risk. Use them based on your data characteristics and your forecasting goal. Understanding the right tool for the right task is key in time series analysis.
> 金融中常见的做法是：用 ARIMA 建模均值、用 GARCH 建模残差的方差，这种混合模型在需要同时刻画趋势和波动时很有用。总结：ARIMA 擅长预测数值，GARCH 擅长预测方差（风险）；根据数据特征和预测目标选择合适的工具是时间序列分析的关键。

[02:44] Stay Curious Keep Learning Like Share and Subscribe for more educational content.
> （结尾：欢迎订阅点赞。）
