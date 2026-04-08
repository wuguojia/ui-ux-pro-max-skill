#!/bin/bash

echo "🎯 AI Codegen Booster Skill - 快速启动"
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
  echo "📦 检测到未安装依赖，正在安装..."
  npm install
  echo ""
fi

echo "✅ Skill 已准备就绪！"
echo ""
echo "💡 使用方法："
echo "   在你的项目中对 AI 说："
echo "   '帮我分析这个项目，提取所有组件和样式'"
echo ""
echo "📚 查看文档："
echo "   - SKILL.md - 完整功能说明"
echo "   - 如何开始.md - 快速开始指南"
echo "   - INSTALL.md - 安装说明"
echo ""
