#!/usr/bin/env zsh

echo "\n<<< Starting Homebrew Setup >>>\n"

# Install Homebrew + Packages
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew install bat
brew install youtube-dl

brew install brave-browser
brew install visual-studio-code