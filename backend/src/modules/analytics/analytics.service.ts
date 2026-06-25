import { analyticsRepository } from './analytics.repository';

export const analyticsService = {
  async overview(userId: string) {
    const [totals, recentTransactions, recentGoals] = await Promise.all([
      analyticsRepository.getOverview(userId),
      analyticsRepository.getRecentTransactions(userId),
      analyticsRepository.getRecentGoals(userId),
    ]);
    return { ...totals, recent_transactions: recentTransactions, recent_goals: recentGoals };
  },

  async monthlyContributions(userId: string, months = 6) {
    return analyticsRepository.getMonthlyContributions(userId, months);
  },

  async categoryBreakdown(userId: string) {
    return analyticsRepository.getCategoryBreakdown(userId);
  },

  async topContributors(userId: string, limit = 10) {
    return analyticsRepository.getTopContributors(userId, limit);
  },

  async goalPerformance(userId: string) {
    return analyticsRepository.getGoalPerformance(userId);
  },
};
