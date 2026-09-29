[00:00] In this video, I want to use some basic math derivations and pseudocode to walk you through the strategic portfolio allocation approach of Markowitz. The video is well suited for undergrad students and also for MBA students. The portfolio selection process of Markowitz is a two-step approach.
> 本视频用基本数学推导和伪代码，讲解马科维茨（Markowitz）的战略性资产配置方法，适合本科生和 MBA 学生。马科维茨的组合选择分两步。

[00:32] Step 1 is to find the tangency portfolio. Step 2 is that based on the investor's risk aversion, we find the optimal portfolio on the capital allocation line. And remember, the capital allocation line is the linear connecting line between the tangency portfolio and the risk-free rate. So let's add some math intuition for step one. Now I'm going to present three ways for determining the tangency portfolio.
> 第 1 步：找到「切点组合」（tangency portfolio）。第 2 步：根据投资者的风险厌恶程度，在「资本配置线」（CAL，连接切点组合与无风险利率的直线）上找到最优组合。下面先讲第 1 步，给出三种确定切点组合的方法。

[01:08] The first approach is the most direct one. You have to run a numerical optimization across all possible portfolio weights Wp and you're going to search for the portfolio weight that maximizes the portfolio's Sharpe ratio. The resulting optimal portfolio weight is then the tangency portfolio which I denote as Wtp. I also like the upcoming second approach as it gives us not only the portfolio weight of the tangency portfolio WTP but it also gives us any other efficient portfolio allocation WF.
> 方法一（最直接）：对所有可能的组合权重 W 做数值优化，寻找使组合夏普比率最大的权重，该最优权重就是切点组合 W_TP。方法二：不仅能得到切点组合，还能得到任何其他有效组合 W_F。

[01:57] Now that's the approach that is often used in financial software which displays the efficient frontier. So here's what you would do numerically. So look at the mu sigma diagram. You discretize the x-axis as fine as you like. That specifies the target risk, sigma p, for which you are now going to find the unique portfolio that offers for that risk the highest expected return mu p Notice capital sigma is an exogenous data input It's the covariance matrix of asset returns.
> 方法二正是金融软件绘制有效前沿时常用的做法：在 μ–σ 图上把横轴（目标风险 σ_P）尽可能细地离散化，对每个目标风险，求预期收益 μ_P 最高的唯一组合。注意：Σ（协方差矩阵）是外生输入数据，即资产收益的协方差矩阵。

[02:45] The last constraint is called the full investment constraint. This says that all the wealth needs to be invested into the risky assets. As you have a grid for sigma p and hence also for sigma square p, you can now solve the previous optimization problem for any target risk. Mathematically, it means that for all target risks, σ2p, within a lower bound and an upper bound, you are going to solve the previous optimization problem.
> 最后一个约束叫「全额投资约束」：全部财富都必须投入风险资产。有了 σ_P（进而 σ²_P）的网格，就能对任意目标风险求解上述优化问题——即对下界与上界之间的所有目标方差逐一求解。

[03:29] And here Lb denotes the lower bound, Ub denotes the upper bound. An increment is the step size of the grid. Note, the resulting efficient portfolios W are all on the efficient frontier. In order to plot the efficient frontier, you have to record their respective expected return µf and their respective variance σ²f.
> 其中 Lb 是下界，Ub 是上界，increment 是网格步长。所得的有效组合 W 都在有效前沿上；要画出有效前沿，需要记录各组合的预期收益 μ_F 和方差 σ²_F。

[04:06] Now you are going to find the tangency portfolio as the efficient portfolio with the highest Sharpe ratio. Now the upcoming third approach for getting the tangency portfolio is to calculate the full minimum variance frontier. The upper part of that frontier is the efficient frontier. The lower part is the inefficient frontier.
> 之后，切点组合就是这些有效组合中夏普比率最高的那个。方法三：计算完整的「最小方差前沿」，其上半部分是有效前沿，下半部分是无效前沿。

[04:39] Similar to the previous approach, you find the tangency portfolio as the efficient portfolio with the highest Sharpe ratio. So mathematically you do create a grid for all expected portfolio returns that you want to consider We call them mu p. And for these you set a lower bound, an upper bound and an incremental step size.
> 与方法二类似，切点组合仍是夏普比率最高的有效组合。数学上，对所有想考虑的目标预期收益建一个网格（记为 μ_P），并设下界、上界和步长。

[05:13] And now you are looking for a portfolio of risky assets that earns the target expected return µP and that exposes the investor to the least amount of risk. Note here that the tangency portfolio will be the efficient portfolio with the highest Sharpe ratio. Okay, let's pause for a minute. We just talked about three ways to determine the tangency portfolio.
> 然后，寻找能取得目标预期收益 μ_P 且使投资者承担最小风险的风险资产组合。切点组合就是夏普比率最高的有效组合。我们暂停一下：刚才讲了三种确定切点组合的方法。

[05:48] Once you have its portfolio weight WTP, you determine its expected return, its volatility and its Sharpe ratio. So let's move on to the second step of the Markowitz portfolio selection procedure. Given the tangency portfolio and importantly given the investors risk aversion we find now how much to lever the tangency portfolio up or down.
> 得到权重 W_TP 后，就可算出它的预期收益、波动率和夏普比率。接着是马科维茨组合选择的第 2 步：给定切点组合，以及投资者的风险厌恶程度，决定要把切点组合杠杆加大还是减小。

[06:25] So investor I has mean variance preferences with the risk aversion gamma I which is zero or larger than zero. The mean variance investor seeks to find the optimal fraction of wealth, yi, that should be invested into the tangency portfolio. And the share 1 minus yi, that should be invested into the risk-free instrument.
> 投资者 i 有均值–方差偏好，风险厌恶系数 γ_i ≥ 0。均值–方差投资者要找的是：投入切点组合的最优财富比例 y_i，其余 1 − y_i 投入无风险资产。

[06:56] So, if we connect back to the case where we are looking for the optimal portfolio for each of the 200,000 employees of Daimler, we would solve the following problem. The first order condition would look as follows. We set that to zero and then we solve for the optimal fraction of wealth that employee I invests into the tangency portfolio And finally the optimal allocation for employee I would be to invest YI star into the tangency portfolio and 1 minus YI star into the risk-free asset.
> 例：假设要为戴姆勒（Daimler）20 万名员工每人找最优组合。一阶条件令导数为零，解出员工 i 投入切点组合的最优比例 y_i*；最终最优配置就是把 y_i* 投入切点组合、1 − y_i* 投入无风险资产。

[07:50] Now it's likely that some of the 280,000 Daimler employees, if not all of them, will have difficulties to state their coefficient of risk aversion. So alternatively they could state the maximum volatility that they are willing to accept. For example, let's say Pauline wants her optimal portfolio to have an annualized volatility of 20%.
> 但很多员工也许难以说出自己的风险厌恶系数，可以改说「能接受的最大波动率」。例如 Pauline 希望自己的最优组合年化波动率为 20%。

[08:23] Also assume that the tangency portfolio has an expected volatility of 15%. And assume in addition that Pauline wants to invest 100,000 euros. You therefore know that y square times the variance of the TP portfolio needs to be equal to the variance that Pauline is willing to take. Now you solve for y star and you see it just coincides with the ratio of the volatility that Pauline wants to hold in her portfolio divided by the volatility of the tangency portfolio. Plugging in the numbers in that example you have 0.2 divided by 0.15 which gives you 1.333.
> 假设切点组合的预期波动率为 15%，Pauline 想投资 10 万欧元。则 y² × 切点组合方差 = Pauline 愿意承担的方差，解得 y* = 她想要的波动率 ÷ 切点组合波动率 = 0.2 ÷ 0.15 = 1.333。

[09:19] So that solution would say that as Pauline is willing to be exposed to 20 percent of systematic volatility while the TP portfolio is exposed to 15 percent volatility the optimal portfolio for Pauline would be to borrow an additional 33,333 euros at the risk-free rate and to invest a total of 133,333 euros into the Tangency portfolio.
> 因此 Pauline 愿意承担 20% 的系统性波动，而切点组合波动为 15%，她的最优组合就是：以无风险利率再借入 33,333 欧元，共 133,333 欧元投入切点组合。

[09:52] into the Tangency portfolio. Notice, Pauline's optimal portfolio will only have exposure to systematic risk. Systematic risk is also called non-diversifiable risk. And here is why. WTP has 100% exposure to systematic risk. The ratio sigma CP over sigma TP quantifies the optimal amount of leverage that is going to be applied to the systematic risk of the TP portfolio.
> 注意 Pauline 的最优组合只承担系统性风险。系统性风险又叫「不可分散风险」（字幕原文写成「可分散」，应为口误/转写错误，已更正）。切点组合 100% 暴露于系统性风险；σ_CP/σ_TP 之比表示对切点组合的系统性风险所加的最优杠杆量。

[10:36] So Pauline and any other employee of Daimler will therefore not be exposed to any type of asset specific risk.
> 因此 Pauline 以及戴姆勒的其他员工都不会暴露于任何资产特有（非系统性）风险。
