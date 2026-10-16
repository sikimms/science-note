# 과학 탐험 노트 아이콘: 궁금 박사 얼굴 (exe용 .ico 256px + 웹앱 PNG 192/512/maskable)
Add-Type -AssemblyName System.Drawing
$dir = Join-Path $PSScriptRoot 'icons'
New-Item -ItemType Directory -Force $dir | Out-Null

function Draw([int]$s, [bool]$maskable) {
  $b = New-Object System.Drawing.Bitmap $s, $s
  $g = [System.Drawing.Graphics]::FromImage($b); $g.SmoothingMode = 'AntiAlias'; $g.Clear([System.Drawing.Color]::Transparent)
  $sky = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(59, 125, 219))
  if ($maskable) { $g.FillRectangle($sky, 0, 0, $s, $s) }
  else {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath; $r = [int]($s * 0.44)
    $p.AddArc(0, 0, $r, $r, 180, 90); $p.AddArc($s - $r, 0, $r, $r, 270, 90); $p.AddArc($s - $r, $s - $r, $r, $r, 0, 90); $p.AddArc(0, $s - $r, $r, $r, 90, 90); $p.CloseFigure()
    $g.FillPath($sky, $p)
  }
  # 모눈 무늬
  $grid = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(40, 255, 255, 255)), ([float]($s / 128))
  for ($i = 1; $i -lt 8; $i++) { $v = [float]($s * $i / 8); $g.DrawLine($grid, $v, 0, $v, $s); $g.DrawLine($grid, 0, $v, $s, $v) }
  $k = if ($maskable) { 0.78 } else { 1.0 }   # maskable은 가운데 안전영역에 맞게 조금 작게
  $c = $s / 2; $R = $s * 0.34 * $k
  $ink = [System.Drawing.Color]::FromArgb(30, 42, 68)
  $sun = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 200, 61))
  $g.FillEllipse($sun, [float]($c - $R), [float]($c - $R + $s * 0.03 * $k), [float]($R * 2), [float]($R * 2))
  $pen = New-Object System.Drawing.Pen $ink, ([float]($s * 0.035 * $k)); $pen.StartCap = 'Round'; $pen.EndCap = 'Round'
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $inkB = New-Object System.Drawing.SolidBrush $ink
  $er = $s * 0.11 * $k; $ey = $c - $s * 0.02 * $k
  foreach ($dx in @(-0.13, 0.13)) {
    $ex = $c + $s * $dx * $k
    $g.FillEllipse($white, [float]($ex - $er), [float]($ey - $er), [float]($er * 2), [float]($er * 2))
    $g.DrawEllipse($pen, [float]($ex - $er), [float]($ey - $er), [float]($er * 2), [float]($er * 2))
    $pr = $er * 0.42
    $g.FillEllipse($inkB, [float]($ex - $pr + $er * 0.12), [float]($ey - $pr + $er * 0.1), [float]($pr * 2), [float]($pr * 2))
  }
  $mw = $s * 0.18 * $k; $my = $c + $s * 0.14 * $k
  $g.DrawArc($pen, [float]($c - $mw / 2), [float]($my - $mw / 2), [float]$mw, [float]($mw * 0.8), 20, 140)
  # 머리 위 반짝 선
  $top = $c - $R + $s * 0.03 * $k
  $g.DrawLine($pen, [float]$c, [float]($top - $s * 0.03 * $k), [float]$c, [float]($top - $s * 0.09 * $k))
  $g.Dispose(); return $b
}
function Save-Ico($bmp, $path) {
  $ms = New-Object System.IO.MemoryStream; $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png); $png = $ms.ToArray()
  $fs = [System.IO.File]::Create($path); $bw = New-Object System.IO.BinaryWriter $fs
  $bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]1); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0); $bw.Write([Byte]0)
  $bw.Write([UInt16]1); $bw.Write([UInt16]32); $bw.Write([UInt32]$png.Length); $bw.Write([UInt32]22); $bw.Write($png); $bw.Close()
}
Save-Ico (Draw 256 $false) (Join-Path $dir 'science.ico')
(Draw 192 $false).Save((Join-Path $dir 'icon-192.png'), [System.Drawing.Imaging.ImageFormat]::Png)
(Draw 512 $false).Save((Join-Path $dir 'icon-512.png'), [System.Drawing.Imaging.ImageFormat]::Png)
(Draw 512 $true).Save((Join-Path $dir 'maskable-512.png'), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output '아이콘 만듦'
