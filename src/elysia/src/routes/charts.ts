import { Elysia } from "elysia";
import { prisma } from "../lib/prisma";
import {
  batchQueryChartDatasetsBodyDto,
  chartDatasetParamsDto,
  errorResponseDto,
  listChartDatasetsQueryDto,
  successResponseDto,
} from "../dto/chart.dto";

export const chartsRoutes = new Elysia({ prefix: "/api/charts" })
  // 获取数据集清单（用于前端菜单）
  .get(
    "/datasets",
    async ({ query }) => {
      const keyword = query.keyword?.trim();
      const limit = query.limit ?? 100;
      const offset = query.offset ?? 0;

      const where = keyword
        ? {
            datasetKey: {
              contains: keyword,
            },
          }
        : undefined;

      const [total, items] = await Promise.all([
        prisma.processedChartDataset.count({ where }),
        prisma.processedChartDataset.findMany({
          where,
          select: {
            datasetKey: true,
            sourceFile: true,
            itemCount: true,
            payloadType: true,
            updatedAt: true,
          },
          orderBy: { datasetKey: "asc" },
          take: limit,
          skip: offset,
        }),
      ]);

      return {
        success: true as const,
        data: {
          total,
          limit,
          offset,
          items,
        },
      };
    },
    {
      query: listChartDatasetsQueryDto,
      response: {
        200: successResponseDto,
      },
    }
  )
  // 获取单个图表数据集
  .get(
    "/datasets/:datasetKey",
    async ({ params, set }) => {
      const found = await prisma.processedChartDataset.findUnique({
        where: { datasetKey: params.datasetKey },
        select: {
          datasetKey: true,
          sourceFile: true,
          payloadType: true,
          itemCount: true,
          updatedAt: true,
          payload: true,
        },
      });

      if (!found) {
        set.status = 404;
        return {
          success: false as const,
          message: `未找到数据集: ${params.datasetKey}`,
        };
      }

      return {
        success: true as const,
        data: found,
      };
    },
    {
      params: chartDatasetParamsDto,
      response: {
        200: successResponseDto,
        404: errorResponseDto,
      },
    }
  )
  // 批量获取图表数据集
  .post(
    "/datasets/query",
    async ({ body }) => {
      const rows = await prisma.processedChartDataset.findMany({
        where: {
          datasetKey: {
            in: body.datasetKeys,
          },
        },
        select: {
          datasetKey: true,
          sourceFile: true,
          payloadType: true,
          itemCount: true,
          updatedAt: true,
          payload: true,
        },
        orderBy: {
          datasetKey: "asc",
        },
      });

      const map = Object.fromEntries(rows.map((item) => [item.datasetKey, item]));

      return {
        success: true as const,
        data: {
          items: map,
          hitCount: rows.length,
          requestCount: body.datasetKeys.length,
        },
      };
    },
    {
      body: batchQueryChartDatasetsBodyDto,
      response: {
        200: successResponseDto,
      },
    }
  );
