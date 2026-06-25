import { communityRepository } from './community.repository';

export const communityService = {
  async listCommunityProjects(userId: string, query: { category?: string; page?: number; per_page?: number }) {
    const page = query.page ?? 1;
    const perPage = Math.min(query.per_page ?? 20, 100);
    const categories = query.category?.split(',') ?? ['community_project', 'religious'];

    const { rows, total } = await communityRepository.findCommunityProjects(userId, {
      categories,
      page,
      perPage,
    });
    return { data: rows, meta: { page, per_page: perPage, total } };
  },

  async search(userId: string, query: { q: string; type?: string }) {
    const results: Record<string, unknown[]> = {};

    const [goals, transactions, contributors] = await Promise.all([
      !query.type || query.type === 'goals'        ? communityRepository.searchGoals(userId, query.q)        : Promise.resolve([]),
      !query.type || query.type === 'transactions' ? communityRepository.searchTransactions(userId, query.q) : Promise.resolve([]),
      !query.type || query.type === 'contributors' ? communityRepository.searchContributors(userId, query.q) : Promise.resolve([]),
    ]);

    if (!query.type || query.type === 'goals')        results.goals        = goals;
    if (!query.type || query.type === 'transactions') results.transactions = transactions;
    if (!query.type || query.type === 'contributors') results.contributors = contributors;

    return results;
  },
};
