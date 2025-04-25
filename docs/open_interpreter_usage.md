# 使用 Open Interpreter Python 库

Open Interpreter 提供了一个 Python 包，允许您在自己的脚本中集成其功能，让语言模型能够与您的本地环境交互并执行代码。

## 1. 安装

如果您还没有安装，可以通过 pip 安装：

```bash
pip install open-interpreter
```

## 2. 基本用法

最核心的交互方式是通过 `interpreter` 对象实例的 `.chat()` 方法。

```python
from interpreter import interpreter # 或者使用旧版 import interpreter

# 方式一：执行单个指令并获取结果 (会阻塞直到完成)
# 输出和代码执行确认会直接显示在终端
print("正在请求 Open Interpreter 处理单个指令...")
interpreter.chat("List all files in the current directory.")
print("指令处理完成.")

print("-" * 20)

# 方式二：启动交互式聊天 (类似于在终端直接运行 interpreter)
# 这会阻塞脚本，直到用户在终端中输入 'exit'
# print("启动交互式聊天 (输入 'exit' 退出)...")
# interpreter.chat() 
# print("交互式聊天结束.")

# 注意：以上两种方式默认都会在执行代码前请求用户确认 (y/n)
```

## 3. Programmatic Chat (核心方法)

为了在脚本中更精细地控制交互，直接向 `.chat()` 传递消息是最常用的方式。默认情况下，`.chat()` 会：

*   将输出（包括思考过程、代码、系统输出）**流式打印**到终端。
*   在执行代码前**请求用户确认**。
*   **阻塞**直到该轮对话完成（LLM 回复完毕且代码执行完毕）。
*   **记住**之前的对话历史（在一个 `interpreter` 实例内部）。

```python
from interpreter import interpreter

# 发送第一条消息
interpreter.chat("Create a file named 'hello.txt' with the content 'Hello from Open Interpreter!'") 

# 发送后续消息 (会基于之前的历史)
interpreter.chat("Now read the content of 'hello.txt'.") 
```

## 4. 控制终端输出 (`display=False`)

如果您不希望 Open Interpreter 自动将其执行过程和结果打印到终端，可以在调用 `.chat()` 时设置 `display=False`。

```python
from interpreter import interpreter

# 设置 display=False 来阻止自动打印到终端
# 注意：这通常与 stream=True 结合使用 (见下文)，否则您将无法直接看到发生了什么
print("正在执行任务 (禁止终端输出)...")
interpreter.chat("Append '! Python was here.' to hello.txt", display=False) 
print("任务执行完成 (无终端输出).")

# 读取文件内容以验证 (仍然会请求确认，除非 auto_run=True)
interpreter.chat("Read hello.txt") 
```

## 5. 控制代码执行确认 (`auto_run=True`)

默认情况下，Open Interpreter 会在执行任何代码前请求确认。在自动化脚本中，您可能希望跳过这一步。

```python
from interpreter import interpreter

# 设置为自动运行代码 (无需确认)
# 警告：这有安全风险，请确保您信任 LLM 生成的代码！
interpreter.auto_run = True 

interpreter.chat("Run 'pwd' and then 'ls -l'.") 
```

## 6. 获取流式响应 (非阻塞, `stream=True`)

如果您不希望 `.chat()` 阻塞，并且想要在脚本中 **完全控制** 输出（例如，解析 JSON、更新 UI、或者像之前提到的，配合 `display=False` 来阻止默认打印），可以使用 `stream=True` 并迭代返回的生成器。

```python
from interpreter import interpreter

interpreter.auto_run = True # 假设我们需要自动执行

message = "List files in the current directory."

print(f"发送指令: {message}")
print("--- 开始接收流式响应 (无终端输出) ---")

# display=False 阻止 OI 自动打印到终端
# stream=True 返回一个生成器供我们迭代
response_generator = interpreter.chat(message, display=False, stream=True) 

full_response = ""
for chunk in response_generator:
  # chunk 的结构可能包含 'role', 'type', 'content', 'format', 'code', 'language', 'output' 等键
  # 具体结构请参考 Open Interpreter 的 LMC Messages 协议
  # https://docs.openinterpreter.com/protocols/lmc-messages
  
  # 简单示例：打印非代码块的内容
  if chunk.get("type") == "message" and chunk.get("role") == "assistant":
      content = chunk.get("content", "")
      if content:
          print(f"Assistant Message: {content}")
          full_response += content
  elif chunk.get("type") == "code":
       code = chunk.get("code", "")
       lang = chunk.get("language", "")
       print(f"Executing Code ({lang}):\n{code}\n--------------------"))
  elif chunk.get("type") == "output":
       output = chunk.get("output", "")
       print(f"Code Output:\n{output}\n--------------------"))
  elif chunk.get("type") == "confirmation":
       # 如果 auto_run=False，这里会收到确认请求
       print(f"Confirmation Request (Code):\n{chunk.get('code')}"))
       # 您需要在这里决定是否确认执行，但通常 auto_run=True 时不会收到这个
       pass 
       
  # 您可以在这里处理其他类型的 chunk，例如 'start', 'end', 'thought'等

print("--- 流式响应结束 ---")
# print(f"\n完整助手响应文本:\n{full_response}") # 可能不完整，因为流包含多种类型
```

## 7. 管理对话历史

`interpreter` 实例会维护一个消息列表 (`interpreter.messages`)。

```python
from interpreter import interpreter

# 查看当前消息历史
print("当前消息:", interpreter.messages)

# 发送消息会追加到历史
interpreter.chat("Remember the number 42.")

print("更新后的消息:", interpreter.messages)

# 清空历史，开始新对话
interpreter.reset() # 或者 interpreter.messages = [] 
print("重置后的消息:", interpreter.messages)

# 加载之前的消息历史以恢复对话
# messages_to_load = [...] # 从某处获取之前的消息列表
# interpreter.messages = messages_to_load 
```

*注意*: 根据一些文档或 fork，恢复对话的方法可能是 `interpreter.load(messages)`，并且获取消息列表可能是通过 `interpreter.chat(..., return_messages=True)`。官方文档似乎更倾向于直接操作 `interpreter.messages` 属性。请以您安装的库的实际行为为准。

## 8. 配置

可以配置多个方面，最常见的是：

*   **模型**: 通过 `interpreter.llm.model` 设置。
    ```python
    interpreter.llm.model = "gpt-4-turbo" 
    # interpreter.llm.model = "ollama/llama3" # 使用 Ollama (需配置 api_base)
    # interpreter.llm.model = "groq/llama3-70b-8192" # 使用 Groq
    ```
    需要配合 API Key 和 API Base URL 进行设置 (见下文)。支持的模型列表和格式参考 LiteLLM 文档。
*   **API Keys & Base URL**: 通常通过环境变量 (`OPENAI_API_KEY`, `GROQ_API_KEY` 等) 或配置文件设置。也可以在代码中设置：
    ```python
    # interpreter.llm.api_key = "sk-..." 
    # interpreter.llm.api_base = "http://localhost:11434/v1" # Ollama 示例
    # interpreter.offline = True # 如果使用本地模型，可能需要禁用在线功能
    ```
*   **系统消息 (System Message)**: 通过 `interpreter.system_message` 定制解释器的行为和上下文。
    ```python
    interpreter.system_message = "You are a helpful assistant." # 完全覆盖
    interpreter.system_message += "\nAlways respond in Markdown." # 追加指令
    print(interpreter.system_message)
    ```
*   **其他设置**: 如 `temperature`, `max_tokens`, `context_window` 等，通常在 `interpreter.llm` 对象下设置。
    ```python
    # interpreter.llm.temperature = 0.5
    # interpreter.llm.max_tokens = 1000 
    # interpreter.context_window = 4096 # 注意：这可能与模型本身的限制有关
    ```

## 9. 本地调试建议

*   **从简单开始**: 先让脚本执行简单的、非破坏性的命令（如 `pwd`, `ls`, 读取文件）。
*   **使用 `auto_run = False` (默认)**: 在调试阶段，手动确认每一步代码执行，确保 LLM 理解正确并且代码无害。
*   **打印调试信息**: 在脚本中打印 `interpreter.messages` 查看交互历史，打印收到的 `chunk` 内容（如果使用流式处理）。
*   **配置文件**: 使用 Open Interpreter 的配置文件 (`interpreter --profiles` 打开目录，编辑 `default.yaml`) 来设置模型、API Key 等，避免硬编码在脚本里。Python 脚本会默认加载 `default.yaml` 的设置。
*   **错误处理**: 使用 `try...except` 块包裹 `.chat()` 调用，处理可能的 API 错误或执行错误。

这个文档应该为您提供了在 Python 脚本中使用 Open Interpreter 的基础知识，足够开始您的 Changelog 生成脚本的本地调试工作。 