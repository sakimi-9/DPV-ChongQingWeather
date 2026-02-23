import * as echarts from "echarts";
import JSZip from "jszip";

type ExportChartItem = {
    title: string;
    option: Record<string, unknown>;
    analysisText: string;
};

// 导出图表压缩包：每个文件为“图表+分析文本”合成图片
export async function exportChartsAsZip(items: ExportChartItem[], zipFileName: string) {
    if (typeof window === "undefined" || typeof document === "undefined") {
        throw new Error("当前环境不支持导出");
    }

    const zip = new JSZip();

    // 离屏容器：用于逐个渲染 ECharts 再导出图片
    const offscreenHost = document.createElement("div");
    offscreenHost.style.position = "fixed";
    offscreenHost.style.left = "-100000px";
    offscreenHost.style.top = "0";
    offscreenHost.style.width = "1400px";
    offscreenHost.style.height = "760px";
    offscreenHost.style.pointerEvents = "none";
    document.body.appendChild(offscreenHost);

    try {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const chartDiv = document.createElement("div");
            chartDiv.style.width = "1400px";
            chartDiv.style.height = "760px";
            offscreenHost.appendChild(chartDiv);

            const chart = echarts.init(chartDiv, undefined, { renderer: "canvas" });
            chart.setOption(item.option as echarts.EChartsOption, true);
            chart.resize();

            await sleep(80);

            const chartDataUrl = chart.getDataURL({
                type: "png",
                pixelRatio: 2,
                backgroundColor: "#061c38",
            });

            chart.dispose();
            chartDiv.remove();

            const imageBlob = await mergeChartAndAnalysis({
                chartDataUrl,
                title: item.title,
                analysisText: item.analysisText,
            });

            const safeName = sanitizeFileName(item.title);
            const prefix = String(i + 1).padStart(2, "0");
            zip.file(`${prefix}_${safeName}.png`, imageBlob);
        }
    } finally {
        offscreenHost.remove();
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, zipFileName);
}

// 合成图片：上方图表，下方分析文本
async function mergeChartAndAnalysis(input: {
    chartDataUrl: string;
    title: string;
    analysisText: string;
}) {
    const chartImage = await loadImage(input.chartDataUrl);

    const paddingX = 36;
    const paddingY = 28;
    const textAreaHeight = 360;
    const canvasWidth = chartImage.width;
    const canvasHeight = chartImage.height + textAreaHeight;

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("导出失败：无法创建画布上下文");
    }

    ctx.fillStyle = "#061a35";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.drawImage(chartImage, 0, 0);

    ctx.fillStyle = "rgba(8, 29, 57, 0.98)";
    ctx.fillRect(0, chartImage.height, canvasWidth, textAreaHeight);

    ctx.strokeStyle = "rgba(94, 160, 255, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, chartImage.height);
    ctx.lineTo(canvasWidth, chartImage.height);
    ctx.stroke();

    // 文本标题
    ctx.fillStyle = "#d9ecff";
    ctx.font = "600 40px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    ctx.fillText(input.title, paddingX, chartImage.height + paddingY + 10);

    ctx.fillStyle = "#99c5ff";
    ctx.font = "600 30px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    ctx.fillText("数据分析", paddingX, chartImage.height + paddingY + 70);

    // 分析正文
    ctx.fillStyle = "#d4e8ff";
    ctx.font = "400 26px 'Microsoft YaHei', 'PingFang SC', sans-serif";

    const textMaxWidth = canvasWidth - paddingX * 2;
    const textStartY = chartImage.height + paddingY + 118;
    const lineHeight = 42;
    const textLines = wrapTextLines(ctx, input.analysisText, textMaxWidth);

    const maxLines = Math.floor((textAreaHeight - 140) / lineHeight);
    textLines.slice(0, maxLines).forEach((line, index) => {
        ctx.fillText(line, paddingX, textStartY + index * lineHeight);
    });

    const blob = await canvasToBlob(canvas);
    if (!blob) {
        throw new Error("导出失败：图片生成失败");
    }

    return blob;
}

function wrapTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
    const lines: string[] = [];
    const paragraphs = text.split(/\n+/).filter((item) => item.trim().length > 0);

    for (const paragraph of paragraphs) {
        let currentLine = "";

        for (const char of paragraph) {
            const testLine = currentLine + char;
            if (ctx.measureText(testLine).width > maxWidth) {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine.length > 0) {
            lines.push(currentLine);
        }
    }

    return lines;
}

function sanitizeFileName(fileName: string) {
    return fileName.replace(/[\\/:*?"<>|]/g, "_").trim();
}

function sleep(ms: number) {
    return new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("导出失败：图表图片加载失败"));
        image.src = src;
    });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
    return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 1);
    });
}

function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}
