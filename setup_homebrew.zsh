#!/usr/bin/env zsh
echo "\n<<< Starting Homebrew Setup >>>\n"

# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install packages and applications from Brewfile
brew bundle --verbose