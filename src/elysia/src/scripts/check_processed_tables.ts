import { basename, extname, resolve } from "path";
import { readdir } from "fs/promises";
import { prisma } from "../lib/prisma";

const DATA_PROCESSED_DIR = resolve(import.meta.dir, "../../../python/data_processed");
const EXCLUDED_FILE = "processing_report.json";

async function main() {
  const files = (await readdir(DATA_PROCESSED_DIR))
    .filter((file) => file.endsWith(".json") && file !== EXCLUDED_FILE)
    .sort();

  const expectedDatasetKeys = files.map((file) => basename(file, extname(file)));

  const [datasetCount, logCount, rows, latestLog] = await Promise.all([
    prisma.processedChartDataset.count(),
    prisma.processedChartImportLog.count(),
    prisma.processedChartDataset.findMany({
      select: {
        datasetKey: true,
        sourceFile: true,
        payloadType: true,
        itemCount: true,
        importedAt: true,
        updatedAt: true,
      },
      orderBy: { datasetKey: "asc" },
    }),
    prisma.processedChartImportLog.findFirst({
      orderBy: { importedAt: "desc" },
      select: {
        runId: true,
        importedAt: true,
        fileCount: true,
        successCount: true,
        failedCount: true,
      },
    }),
  ]);

  const importedKeys = new Set(rows.map((row) => row.datasetKey));
  const missingKeys = expectedDatasetKeys.filter((key) => !importedKeys.has(key));

  console.log("\n====== 数据库导入检查 ======");
  console.log(`数据库数据集记录数: ${datasetCount}`);
  console.log(`导入日志记录数: ${logCount}`);
  console.log(`文件期望数据集数: ${expectedDatasetKeys.length}`);
  console.log(`缺失数据集数: ${missingKeys.length}`);

  if (latestLog) {
    console.log("\n最近一次导入:");
    console.log(latestLog);
  }

  if (missingKeys.length > 0) {
    console.log("\n缺失数据集:");
    for (const key of missingKeys) {
      console.log(`- ${key}`);
    }
  }

  console.log("\n已导入数据集明细:");
  for (const row of rows) {
    console.log(
      `- ${row.datasetKey} | type=${row.payloadType} | itemCount=${row.itemCount} | updatedAt=${row.updatedAt.toISOString()}`
    );
  }
}

main()
  .catch((error) => {
    console.error("检查脚本异常:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
