"""
Checks the environment and configuration for the Changelog generation script.
"""

import os
import subprocess
import sys
import importlib.util

# --- Configuration ---
PROMPT_FILENAME = os.path.join("prompts", "changelog_prompt.txt") # The prompt file needed by the main script
REQUIRED_PACKAGES = ["open-interpreter", "GitPython"] # Required Python packages
REQUIRED_ENV_VARS = [ # Check for at least one common LLM API key
    "OPENROUTER_API_KEY",
    # "OPENAI_API_KEY", # Keep or remove other keys as needed
    # Add other potential keys if needed, e.g., "ANTHROPIC_API_KEY", "GROQ_API_KEY"
]
# --- End Configuration ---

errors_found = False

def check_package(package_name):
    """Checks if a Python package is installed."""
    global errors_found
    spec = importlib.util.find_spec(package_name.replace('-', '_')) # Handle hyphenated names like open-interpreter
    if spec is None:
        print(f"❌ Error: Required Python package '{package_name}' is not installed.")
        print(f"  Please install it using: pip install {package_name}")
        errors_found = True
        return False
    else:
        print(f"✅ Package '{package_name}' is installed.")
        return True

def check_command(command):
    """Checks if a command is available in the system PATH."""
    global errors_found
    try:
        subprocess.run([command, '--version'], check=True, capture_output=True, text=True)
        print(f"✅ Command '{command}' found.")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print(f"❌ Error: Command '{command}' not found in PATH.")
        print(f"  Please ensure '{command}' is installed and accessible.")
        errors_found = True
        return False

def check_env_vars(var_list):
    """Checks if required environment variables are set."""
    global errors_found
    all_found = True
    for var in var_list:
        if not os.environ.get(var):
            print(f"❌ Error: Required environment variable '{var}' is not set.")
            if var == "OPENROUTER_API_KEY":
                 print("  This key is required for OpenRouter models.")
            errors_found = True
            all_found = False
        else:
            print(f"✅ Environment variable '{var}' is set.")
    return all_found
        

def check_git_repo():
    """Checks if the current directory is a Git repository."""
    global errors_found
    try:
        subprocess.run(['git', 'rev-parse', '--is-inside-work-tree'], check=True, capture_output=True, text=True)
        print("✅ Current directory is a Git repository.")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        # FileNotFoundError might happen if git isn't installed, handled by check_command('git') already
        print("❌ Error: Current directory is not a Git repository.")
        errors_found = True
        return False

def check_git_permissions():
    """Attempts a read-only git command to check basic permissions."""
    global errors_found
    try:
        # Try a simple read command like status
        subprocess.run(['git', 'status'], check=True, capture_output=True, text=True, encoding='utf-8')
        print("✅ Basic Git read permissions seem okay (ran 'git status').")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: Failed to run basic Git command ('git status'). Check repository permissions.")
        print(f"   Error details: {e.stderr.strip()}")
        errors_found = True
        return False
    except FileNotFoundError: # Should be caught by check_command already
        # This case might indicate git disappeared between checks, or wasn't found initially
        errors_found = True # Redundant but safe
        return False

def check_file(filename):
    """Checks if a file exists."""
    global errors_found
    # Ensure the directory exists if the path includes directories
    dir_name = os.path.dirname(filename)
    if dir_name and not os.path.isdir(dir_name):
        # print(f"ℹ️ Note: Directory '{dir_name}' for prompt file does not exist. Attempting to check in root instead.")
        # Fallback to checking in root if prompt dir doesn't exist?
        # Or error out? Let's error for now.
        print(f"❌ Error: Directory '{dir_name}' for prompt file '{os.path.basename(filename)}' not found.")
        errors_found = True
        return False
        
    if not os.path.isfile(filename):
        print(f"❌ Error: Required file '{filename}' not found.")
        errors_found = True
        return False
    else:
        print(f"✅ File '{filename}' found.")
        return True


if __name__ == "__main__":
    print("--- Checking Environment for Changelog Generation ---")
    
    print("\nChecking Python packages...")
    all_packages_ok = all(check_package(pkg) for pkg in REQUIRED_PACKAGES)
    
    print("\nChecking necessary commands...")
    git_ok = check_command('git')
    
    print("\nChecking environment variables (OpenRouter)...")
    keys_ok = check_env_vars(REQUIRED_ENV_VARS)
    
    print("\nChecking project structure and permissions...")
    is_repo = False
    perms_ok = False
    if git_ok:
        is_repo = check_git_repo()
        if is_repo: # Only check permissions if it is a repo
            perms_ok = check_git_permissions()
            
    prompt_file_ok = check_file(PROMPT_FILENAME)
    
    print("\n--- Check Summary ---")
    if errors_found:
        print("❌ Some checks failed. Please review the errors above and resolve them before running the generation script.")
        sys.exit(1) # Exit with error code
    else:
        print("✅ All checks passed. Environment seems ready!")
        sys.exit(0) # Exit successfully 