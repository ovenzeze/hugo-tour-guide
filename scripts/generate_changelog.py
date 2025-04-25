"""
Generates user-facing and developer changelogs using Open Interpreter based on Git history and a prompt file.
"""

import os
import sys
import subprocess
from interpreter import interpreter # Assuming Open Interpreter library is installed
import re
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
PROMPT_FILENAME = "prompts/changelog_prompt.md" # Corrected path
OUTPUT_CHANGELOG_FILENAME = "CHANGELOG.md" # Combined output file

# Read configuration from environment variables
# Provide defaults or raise errors if necessary
DEFAULT_MODEL = "openai/gpt-3.5-turbo" # A sensible default if not set
OI_MODEL = os.getenv("OPENROUTER_MODEL", DEFAULT_MODEL)
# The interpreter library often picks up API keys automatically from standard env vars
# like OPENAI_API_KEY, ANTHROPIC_API_KEY, or potentially OPENROUTER_API_KEY.
# We can also set it explicitly if needed.
OI_API_KEY = os.getenv("OPENROUTER_API_KEY")
# For OpenRouter, we might need to set the API base as well
OI_API_BASE = os.getenv("OPENROUTER_API_BASE", "https://openrouter.ai/api/v1")


# Open Interpreter Configuration
OI_SYSTEM_MESSAGE = """You are an expert technical writer specializing in generating release notes and changelogs. 
You will be given instructions from a prompt file and a list of git commit messages since the last release. 
Analyze the commits according to the instructions and generate two distinct changelogs: one for end-users and one for developers, formatted exactly as requested in the prompt.
Use Markdown for the output. Adhere strictly to the output format specified in the instructions, including the exact code fence markers (USER_CHANGELOG, DEV_CHANGELOG).
"""
OI_AUTO_RUN = True # Set to False for manual confirmation during debugging
# --- End Configuration ---

def run_command(command_list):
    """Runs a shell command list and returns its stdout."""
    try:
        result = subprocess.run(command_list, check=True, capture_output=True, text=True, encoding='utf-8')
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        stderr_output = e.stderr.strip() if e.stderr else "No stderr output"
        # Handle known non-error messages for git describe
        if "No names found" in stderr_output or "No tags found" in stderr_output:
             print(f"Info: Git command '{' '.join(command_list)}' reported no tags.", file=sys.stderr)
             return "" # Return empty string for no tags found scenario
        print(f"Error running command '{' '.join(command_list)}': {stderr_output}", file=sys.stderr)
        return None
    except FileNotFoundError:
        print(f"Error: Command not found during execution '{command_list[0]}'", file=sys.stderr)
        return None

def get_latest_tag():
    """Gets the latest Git tag using git describe. Returns empty string if no tags found."""
    # Using describe with --tags --abbrev=0 gives the latest tag on the current commit or its ancestors
    tag = run_command(['git', 'describe', '--tags', '--abbrev=0'])
    # Fallback to finding the most recent tag in history if describe fails
    if tag is None or tag == "":
        print("git describe failed or found no tag, trying rev-list...", file=sys.stderr)
        tag = run_command(['git', 'rev-list', '--tags', '--max-count=1'])
        if tag:
             tag = run_command(['git', 'describe', '--tags', tag]) # Get the actual tag name
    return tag if tag else "" # Ensure empty string if still no tag

def get_git_commits_since_tag(tag=""):
    """Gets git commit messages since the last tag or from the beginning if no tag."""
    commit_range = f"{tag}..HEAD" if tag else "HEAD" # If no tag, get all reachable commits
    print(f"Getting commits for range: {commit_range}", file=sys.stderr)
    command = ['git', 'log', commit_range, '--pretty=format:%H %s']
    result = run_command(command)
    if result is None:
         print("Error getting git log.", file=sys.stderr)
         sys.exit(1)
    # Return empty list if result is empty string
    return result.split('\n') if result else []

def get_prompt():
    """Reads the prompt content from the specified file."""
    try:
        with open(PROMPT_FILENAME, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Error: Prompt file not found at {PROMPT_FILENAME}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error reading prompt file: {e}", file=sys.stderr)
        sys.exit(1)

def extract_changelog_section(llm_output, section_marker):
    """Extracts specific section from LLM output using markers."""
    pattern = re.compile(rf"```{section_marker}\s*\n(.*?)\n```", re.DOTALL | re.IGNORECASE)
    match = pattern.search(llm_output)
    if match:
        print(f"Successfully extracted {section_marker} section.", file=sys.stderr)
        return match.group(1).strip()
    else:
        print(f"Warning: Could not find marker ```{section_marker} ... ``` in LLM output.", file=sys.stderr)
        return f"### {section_marker.replace('_', ' ')}\n\n_Error: Could not extract section from LLM response._"

def save_changelog(filename, content):
    """Saves content to a file."""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Changelog saved to '{filename}'.", file=sys.stderr)
    except IOError as e:
        print(f"Error writing changelog to '{filename}': {e}", file=sys.stderr)

if __name__ == "__main__":
    print("--- Starting Changelog Generation ---", file=sys.stderr)

    # 1. Read Prompt File
    print(f"Reading prompt file: {PROMPT_FILENAME}", file=sys.stderr)
    prompt_instructions = get_prompt()

    # 2. Determine Change Range
    print("Determining commit range...", file=sys.stderr)
    latest_tag = get_latest_tag()
    if latest_tag:
        print(f"Found latest tag: {latest_tag}", file=sys.stderr)
    else:
        print("No previous tags found. Getting all commits.", file=sys.stderr)

    commits = get_git_commits_since_tag(latest_tag)
    if not commits:
        print("No new commits found since the last tag or no commits in repository. Exiting.", file=sys.stderr)
        # Create an empty changelog file? Or just exit? Let's exit.
        # save_changelog(OUTPUT_CHANGELOG_FILENAME, "# Changelog\n\nNo changes detected.")
        sys.exit(0) # Exit gracefully if no commits

    print(f"Found {len(commits)} commits since '{latest_tag or 'beginning'}'.", file=sys.stderr)

    # 3. Construct the Full Prompt for the LLM
    print("Constructing prompt for LLM...", file=sys.stderr)
    commit_list_str = "\n".join(commits)
    full_prompt = f"""
{prompt_instructions}

Here are the relevant commit messages:
```
{commit_list_str}
```

Please generate the changelogs based **only** on these commits and the instructions above.
"""

    # 4. Initialize and Run Open Interpreter
    print(f"Initializing Open Interpreter (Model: {OI_MODEL}, Auto Run: {OI_AUTO_RUN})...", file=sys.stderr)

    # Explicitly configure the interpreter
    interpreter.llm.model = OI_MODEL
    interpreter.llm.api_key = OI_API_KEY # Pass the key explicitly
    interpreter.llm.api_base = OI_API_BASE # Pass the base url explicitly
    interpreter.system_message = OI_SYSTEM_MESSAGE
    interpreter.auto_run = OI_AUTO_RUN
    interpreter.llm.temperature = 0.2 # Lower temperature for more deterministic changelog generation
    # Set context window and max tokens based on model specs (DeepSeek R1)
    interpreter.llm.context_window = 163840 # Set based on web search
    interpreter.llm.max_tokens = 4096   # Set a reasonable limit for output

    # Ensure history is clear for this specific task
    interpreter.reset()

    print("Sending request to LLM... (This may take a while)", file=sys.stderr)
    llm_response_text = ""
    try:
        # Collect the response message content
        messages = interpreter.chat(full_prompt, display=False, stream=False) # Use stream=False to get full response easily

        # Find the last assistant message which should contain the result
        assistant_messages = [msg for msg in messages if msg.get("role") == "assistant"]
        if assistant_messages:
            llm_response_text = assistant_messages[-1].get("content", "")
        else:
             print("Error: No assistant message found in the LLM response.", file=sys.stderr)
             llm_response_text = "Error: Failed to get response from LLM."

        if not llm_response_text.strip():
             print("Warning: LLM returned an empty response.", file=sys.stderr)
             llm_response_text = "Error: LLM returned an empty response."

        response_content = ""
        if interpreter.messages and isinstance(interpreter.messages[-1], dict) and 'content' in interpreter.messages[-1]:
            response_content = interpreter.messages[-1]['content']
            print("\\n--- Raw LLM Response ---")
            print(response_content)
            print("--- End Raw LLM Response ---\\n")
        else:
            print("Warning: Could not retrieve content from the last message.")
            # Consider adding more robust error handling or inspection here if needed

    except Exception as e:
        print(f"❌ Error during Open Interpreter execution: {e}", file=sys.stderr)
        # You might want to log the 'messages' variable here for debugging
        sys.exit(1)

    print("LLM processing complete.", file=sys.stderr)

    print("\\n--- Raw LLM Response for Extraction ---")
    print(llm_response_text) # This is the text we'll try to parse
    print("--- End Raw LLM Response for Extraction ---\\n")

    # 5. Extract and Combine Changelogs
    print("Extracting changelog sections from LLM response...", file=sys.stderr)
    user_changelog = extract_changelog_section(llm_response_text, "USER_CHANGELOG")
    dev_changelog = extract_changelog_section(llm_response_text, "DEV_CHANGELOG")

    # Combine into a single file
    final_changelog_content = f"""# Changelog

{user_changelog}

---

{dev_changelog}
"""

    # 6. Save Combined Changelog
    save_changelog(OUTPUT_CHANGELOG_FILENAME, final_changelog_content)

    print("\n--- Changelog Generation Complete ---", file=sys.stderr)
    sys.exit(0) # Exit successfully 