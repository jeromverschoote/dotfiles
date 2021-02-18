# PLUGINS
# Use plugins to skip manual setup

export ZSH=$HOME/.oh-my-zsh
ZSH_THEME="AtomOne"
plugins=(git zsh-autosuggestions)
source $ZSH/oh-my-zsh.sh



# VARIABLES
# Create variables

# Disable Gatekeeper for Homebrew
export HOMEBREW_CASK_OPTS="--no-quarantine"



# PATHS
# Add directories to search in when a command is called

# Add Visual Studio Code (code)
export PATH="$PATH:/Applications/Visual Studio Code.app/Contents/Resources/app/bin"



# OPTIONS
# Tweak preferred options

if [[ -n $SSH_CONNECTION ]]; then
  export EDITOR='nano'
else
  export EDITOR='nano'
fi



# ALIASES
# Update or combine existing commands

alias ls="ls -1AFGh"
alias cat="bat"



# FUNCTIONS
# Create new commands

function precmd() {
  # Execute before each command

  if [ $timer ]; then
    timer_show=$(($SECONDS - $timer))
    export RPROMPT="%F{cyan}${timer_show}s%{$reset_color%}"
    unset timer
  fi
}

function preexec() {
  # Execute before the execution of each command

  timer=${timer:-$SECONDS}
}

function mkcd() {
  # Create directory and cd into it

  mkdir -p "$@" && cd "$_";
}



# PROMPT
# Define how the terminal is formated

# ...







