#!/bin/bash
cd "$(dirname "$0")"

echo "🍰 Sweet Kingdom Lite DX v2 시작!"
echo "-----------------------------------"

if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "❌ Node.js가 설치되어 있지 않습니다."
  echo "먼저 https://nodejs.org 에서 설치해주세요."
  echo ""
  read -p "엔터를 누르면 종료됩니다..."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo ""
  echo "📦 처음 실행이라 패키지 설치 중..."
  npm install
  if [ $? -ne 0 ]; then
    echo ""
    echo "❌ npm install 실패"
    read -p "엔터를 누르면 종료됩니다..."
    exit 1
  fi
fi

echo ""
echo "🚀 게임 서버 실행 중..."
echo "브라우저에서 http://localhost:5173 를 열어주세요"
echo ""
npm run dev

echo ""
read -p "엔터를 누르면 종료됩니다..."
