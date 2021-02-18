# PLUGINS
# Use plugins to skip manual setup

export ZSH=$HOME/.oh-my-zsh
ZSH_THEME="AtomOne"
plugins=(git zsh-autosuggestions)
source $ZSH/oh-my-zsh.sh



# VARIABLES
# Create variables

# ...



# PATHS
# Safe paths

# ...



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







