과학 탐험 노트 (초등 5학년 2학기 과학)

파일
  src_science.html   원본 (아티팩트와 같은 내용). 내용을 고칠 때는 이 파일만 고칩니다.
  science.html       독립 실행 HTML (더블클릭으로 브라우저에서도 열림)
  과학탐험노트.exe    Windows 프로그램 (WebView2, 저장 위치 %LOCALAPPDATA%\ScienceNote)
  pwa\               휴대폰 홈 화면용 웹앱 (GitHub Pages: https://sikimms.github.io/apps/science/)

다시 만들기
  1. node build_web.js                                        → science.html, pwa\
  2. powershell -File C:\Baduk_Class\build\build_all.ps1 -Only SCIENCE   → 과학탐험노트.exe
  3. pwa\ 내용을 C:\Apps_Pages\science 로 복사 → git commit, push
  (아이콘을 바꿀 때만 make_icons.ps1)
