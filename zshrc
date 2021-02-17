# PLUGINS

# Oh My Zsh
export ZSH=$HOME/.oh-my-zsh
ZSH_THEME="AtomOne"
plugins=(git zsh-autosuggestions)
source $ZSH/oh-my-zsh.sh

# VARIABLES
# ...


# OPTIONS

if [[ -n $SSH_CONNECTION ]]; then
  export EDITOR='nano'
else
  export EDITOR='nano'
fi


# ALIASES
alias ls="ls -1AFGh"


# PROMPT
# ...


# PATHS
# ...


# FUNCTIONS

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







