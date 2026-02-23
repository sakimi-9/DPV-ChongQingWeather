import type { ReactNode } from "react";

// 通用面板组件：支持右上角放大按钮
export function Panel({
    title,
    children,
    onExpand,
}: {
    title: string;
    children: ReactNode;
    onExpand?: () => void;
}) {
    return (
        <article className="panel">
            <div className="panel-title-row">
                <h3 className="panel-title">{title}</h3>
                {onExpand && (
                    <button
                        type="button"
                        className="panel-expand-btn"
                        onClick={onExpand}
                        aria-label={`放大查看${title}`}
                    >
                        ⛶
                    </button>
                )}
            </div>
            <div className="panel-body">{children}</div>
        </article>
    );
}
