DPV-CQW Python 环境配置 (针对 src/python)

建议：使用 Python 3.13 创建虚拟环境并安装依赖。

快速步骤（Windows PowerShell）：

1) 在项目根目录运行：

```powershell
cd src\python                      进入py目录
py -3.13 -m venv .venv             设置py版本环境
.\.venv\Scripts\Activate.ps1       激活虚拟环境
pip install -r requirements.txt    安装依赖

# 该项目没有python微服务，无需启动服务
& .\.venv\Scripts\python.exe -m uvicorn ai_service:app --host 127.0.0.1 --port 8000 启动()
```

2) 运行预处理：

```powershell
python scripts\preprocessing\run_preprocessing.py
```

3) 运行二次处理：

```powershell
python scripts\processing\run_processing.py
```

备注：
- 如果系统没有 Python 3.13，请从 https://www.python.org/downloads/ 安装相应版本
- `requirements.txt` 包含常用的数据处理和可视化库，按需增删。