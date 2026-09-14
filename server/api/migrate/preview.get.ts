import { buildMigrationPlan } from '../../utils/csvMigration'

export default defineEventHandler(async () => {
  const plan = await buildMigrationPlan()

  return {
    files: plan.files,
    newWalletsCount: plan.newWallets.length,
    newWallets: plan.newWallets,
    newCategoriesCount: plan.newCategories.length,
    newCategories: plan.newCategories,
    transactionCount: plan.transactions.length,
    transferCount: plan.transfers.length,
    totals: plan.totals,
    dateRange: plan.dateRange
  }
})
