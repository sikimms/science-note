과학 탐험 노트 (초등 5학년 2학기 과학)

파일
  src_science.html   원본 (아티팩트와 같은 내용). 내용을 고칠 때는 이 파일만 고칩니다.
  science.html       독립 실행 HTML (더블클릭으로 브라우저에서도 열림)
  과학탐험노트.exe    Windows 프로그램 (WebView2, 저장 위치 %LOCALAPPDATA%\ScienceNote)
  docs\              휴대폰 홈 화면용 웹앱 (GitHub Pages: https://sikimms.github.io/science-note/)
  build\             exe 런처(ScienceNote.cs)와 빌드 스크립트

다시 만들기
  powershell -ExecutionPolicy Bypass -File build\build.ps1   → science.html, docs\, 과학탐험노트.exe 모두
  그다음 git commit, git push 하면 휴대폰 앱도 바뀝니다 (휴대폰에 "새 버전이 나왔어요" 알림)
  (아이콘을 바꿀 때만 make_icons.ps1)
  build\*.dll(WebView2)은 저장소에 없음: C:\Baduk_Class\build 에서 복사
