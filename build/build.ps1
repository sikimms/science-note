# 과학 탐험 노트: 화면을 만들고(node build_web.js) exe까지 한 번에 만든다
Set-Location $PSScriptRoot
& node (Join-Path $PSScriptRoot '..\build_web.js')
if ($LASTEXITCODE -ne 0) { Write-Output 'FAILED: build_web.js'; exit 1 }
Copy-Item '..\science.html' 'page.html' -Force
$csc = 'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'
& $csc /nologo /codepage:65001 /target:winexe /platform:x64 /optimize+ `
  /r:Microsoft.Web.WebView2.Core.dll /r:Microsoft.Web.WebView2.WinForms.dll /r:System.Windows.Forms.dll /r:System.Drawing.dll `
  /resource:Microsoft.Web.WebView2.Core.dll,Microsoft.Web.WebView2.Core.dll `
  /resource:Microsoft.Web.WebView2.WinForms.dll,Microsoft.Web.WebView2.WinForms.dll `
  /resource:WebView2Loader.dll,WebView2Loader.dll `
  /resource:page.html,index.html `
  /win32icon:..\icons\science.ico /out:Science.exe ScienceNote.cs
if ($LASTEXITCODE -ne 0) { Write-Output 'FAILED: exe'; exit 1 }
Copy-Item -Force Science.exe '..\과학탐험노트.exe'
Remove-Item -Force Science.exe, page.html
Write-Output 'built: C:\Science_Note\과학탐험노트.exe'
