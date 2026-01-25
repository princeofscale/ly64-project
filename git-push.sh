#!/bin/bash

# Lyceum 64 - Git Automation Script
# Автоматически добавляет изменения, создает коммит с описанием и пушит на GitHub

set -e  # Exit on any error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "${BLUE}🔄 Lyceum 64 - Git Push Automation${NC}"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "${RED}❌ Error: Not a git repository${NC}"
    exit 1
fi

# Check if there are any changes
if [ -z "$(git status --porcelain)" ]; then
    echo "${YELLOW}⚠️  No changes to commit${NC}"
    exit 0
fi

echo "${GREEN}📊 Analyzing changes...${NC}"
echo ""

# Get git status
git status --short

echo ""

# Generate commit message based on changes
COMMIT_MSG=""

# Check for new files
NEW_FILES=$(git status --porcelain | grep "^??" | wc -l | tr -d ' ')
if [ "$NEW_FILES" -gt 0 ]; then
    NEW_FILE_LIST=$(git status --porcelain | grep "^??" | cut -c4- | head -5 | tr '\n' ', ' | sed 's/,$//')
    COMMIT_MSG="${COMMIT_MSG}Добавлены новые файлы: $NEW_FILE_LIST. "
fi

# Check for modified files
MODIFIED_FILES=$(git status --porcelain | grep "^ M\|^M" | wc -l | tr -d ' ')
if [ "$MODIFIED_FILES" -gt 0 ]; then
    MODIFIED_FILE_LIST=$(git status --porcelain | grep "^ M\|^M" | cut -c4- | head -5 | tr '\n' ', ' | sed 's/,$//')
    COMMIT_MSG="${COMMIT_MSG}Изменены файлы: $MODIFIED_FILE_LIST. "
fi

# Check for deleted files
DELETED_FILES=$(git status --porcelain | grep "^ D\|^D" | wc -l | tr -d ' ')
if [ "$DELETED_FILES" -gt 0 ]; then
    DELETED_FILE_LIST=$(git status --porcelain | grep "^ D\|^D" | cut -c4- | head -5 | tr '\n' ', ' | sed 's/,$//')
    COMMIT_MSG="${COMMIT_MSG}Удалены файлы: $DELETED_FILE_LIST. "
fi

# If no specific message, use generic one
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Обновление проекта"
fi

# Add statistics
TOTAL_CHANGES=$(git status --porcelain | wc -l | tr -d ' ')
COMMIT_MSG="${COMMIT_MSG}($TOTAL_CHANGES изменений)"

echo "${BLUE}📝 Сгенерированное сообщение коммита:${NC}"
echo "${GREEN}   $COMMIT_MSG${NC}"
echo ""

# Ask for confirmation or custom message
read -p "Использовать это сообщение? (y/n/custom): " CHOICE

if [ "$CHOICE" = "n" ]; then
    echo "${YELLOW}Отмена операции${NC}"
    exit 0
elif [ "$CHOICE" = "custom" ]; then
    echo "Введите свое сообщение коммита:"
    read CUSTOM_MSG
    COMMIT_MSG="$CUSTOM_MSG"
    echo ""
fi

echo "${GREEN}✓ Git add .${NC}"
git add .

echo "${GREEN}✓ Git commit${NC}"
git commit -m "$COMMIT_MSG

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo ""
echo "${BLUE}🚀 Pushing to GitHub...${NC}"

# Check if remote is set
if ! git remote get-url origin &> /dev/null; then
    echo "${YELLOW}⚠️  Remote 'origin' not found. Adding remote...${NC}"
    git remote add origin https://github.com/princeofscale/ly64-project.git
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

echo "${BLUE}📤 Pushing branch: ${GREEN}$CURRENT_BRANCH${NC}"

# Push to remote
if git push -u origin "$CURRENT_BRANCH"; then
    echo ""
    echo "${GREEN}✅ Successfully pushed to GitHub!${NC}"
    echo "${BLUE}🔗 Repository: ${GREEN}https://github.com/princeofscale/ly64-project${NC}"
    echo ""
else
    echo ""
    echo "${RED}❌ Failed to push to GitHub${NC}"
    echo "${YELLOW}Возможно нужно выполнить: git push --set-upstream origin $CURRENT_BRANCH${NC}"
    exit 1
fi
