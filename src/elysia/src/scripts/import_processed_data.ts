import { basename, extname, resolve } from "path";
import { readdir } from "fs/promises";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

const DATA_PROCESSED_DIR = resolve(import.meta.dir, "../../../python/data_processed");
const EXCLUDED_FILE = "processing_report.json";

function calcItemCount(payload: unknown): number {
  if (Array.isArray(payload)) {
    return payload.length;
  }
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items.length;
    if (Array.isArray(obj.xAxis)) return obj.xAxis.length;
    return Object.keys(obj).length;
  }
  return 0;
}

async function main() {
  const runId = `import_${Date.now()}`;
  const files = (await readdir(DATA_PROCESSED_DIR))
    .filter((file) => file.endsWith(".json") && file !== EXCLUDED_FILE)
    .sort();

  const details: Array<Record<string, unknown>> = [];
  let successCount = 0;
  let failedCount = 0;

  for (const fileName of files) {
    const fullPath = resolve(DATA_PROCESSED_DIR, fileName);
    const datasetKey = basename(fileName, extname(fileName));

    try {
      // 读取并解析图表最终数据 JSON
      const text = await Bun.file(fullPath).text();
      const payload = JSON.parse(text) as unknown;
      const payloadType = Array.isArray(payload) ? "array" : "object";
      const itemCount = calcItemCount(payload);

      await prisma.processedChartDataset.upsert({
        where: { datasetKey },
        create: {
          datasetKey,
          sourceFile: fileName,
          payloadType,
          itemCount,
          payload: payload as Prisma.InputJsonValue,
        },
        update: {
          sourceFile: fileName,
          payloadType,
          itemCount,
          payload: payload as Prisma.InputJsonValue,
          importedAt: new Date(),
        },
      });

      successCount += 1;
      details.push({ datasetKey, sourceFile: fileName, status: "success", itemCount });
      console.log(`✅ 导入成功: ${fileName}`);
    } catch (error) {
      failedCount += 1;
      const reason = error instanceof Error ? error.message : String(error);
      details.push({ datasetKey, sourceFile: fileName, status: "failed", reason });
      console.error(`❌ 导入失败: ${fileName} -> ${reason}`);
    }
  }

  await prisma.processedChartImportLog.create({
    data: {
      runId,
      fileCount: files.length,
      successCount,
      failedCount,
      details: details as Prisma.InputJsonValue,
    },
  });

  console.log("\n====== 导入完成 ======");
  console.log(`数据目录: ${DATA_PROCESSED_DIR}`);
  console.log(`文件总数: ${files.length}`);
  console.log(`成功数量: ${successCount}`);
  console.log(`失败数量: ${failedCount}`);
  console.log(`运行标识: ${runId}`);
}

main()
  .catch((error) => {
    console.error("导入脚本异常:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
