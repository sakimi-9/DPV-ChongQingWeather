import { t } from "elysia";

// 数据集列表查询参数 DTO
export const listChartDatasetsQueryDto = t.Object({
  keyword: t.Optional(t.String({ minLength: 1, maxLength: 128 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 200 })),
  offset: t.Optional(t.Numeric({ minimum: 0 })),
});

// 数据集路径参数 DTO
export const chartDatasetParamsDto = t.Object({
  datasetKey: t.String({ minLength: 1, maxLength: 128 }),
});

// 批量查询请求 DTO
export const batchQueryChartDatasetsBodyDto = t.Object({
  datasetKeys: t.Array(t.String({ minLength: 1, maxLength: 128 }), {
    minItems: 1,
    maxItems: 100,
  }),
});

// 通用成功响应 DTO
export const successResponseDto = t.Object({
  success: t.Literal(true),
  data: t.Any(),
});

// 通用失败响应 DTO
export const errorResponseDto = t.Object({
  success: t.Literal(false),
  message: t.String(),
});
