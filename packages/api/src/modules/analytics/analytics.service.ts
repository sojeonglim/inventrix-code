import { AnalyticsRepository } from './analytics.repository.js';

export class AnalyticsService {
  constructor(private repo: AnalyticsRepository) {}
  async getDashboardKPIs() { return this.repo.getDashboardKPIs(); }
}
