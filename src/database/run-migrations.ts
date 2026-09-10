import dataSource from './data-source';

async function runMigrations() {
  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
}

runMigrations().catch(async (error) => {
  console.error(error);
  await dataSource.destroy();
  process.exit(1);
});
